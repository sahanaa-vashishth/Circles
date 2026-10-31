/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const COMMUNITY_FILE = path.join(DATA_DIR, 'community.json');

export interface UserProfile {
  userId: string;
  displayName: string;
  bio: string;
  email: string;
  avatar: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommunityComment {
  id: string;
  postId: string;
  parentId?: string | null;
  author: string;
  authorId?: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId?: string;
  isAnonymous: boolean;
  createdAt: string;
  reactions: Record<string, number>;
  userReactions?: Record<string, string>;
  comments?: CommunityComment[];
}

async function loadProfiles(): Promise<Record<string, UserProfile>> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(PROFILES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveProfiles(profiles: Record<string, UserProfile>): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
}

async function loadCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const content = await fs.readFile(COMMUNITY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// GET /api/profile?userId=...
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || '';
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId parameter',
      });
    }

    const profiles = await loadProfiles();
    let profile = profiles[userId];

    if (!profile) {
      // Create initial persistent profile for this user
      profile = {
        userId,
        displayName: 'Sahana V.',
        bio: 'Seeking mindfulness and quiet strength. Taking things one gentle breath at a time.',
        email: 'sahanaav2024@gmail.com',
        avatar: 'indigo',
        createdAt: new Date().toISOString(),
      };
      profiles[userId] = profile;
      await saveProfiles(profiles);
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('[Profile] Failed to fetch profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile data.',
    });
  }
});

// PUT /api/profile
router.put('/', async (req: Request, res: Response) => {
  try {
    const { userId, displayName, bio, avatar, email } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid userId is required.',
      });
    }

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Display name cannot be empty.',
      });
    }

    const profiles = await loadProfiles();
    const existing = profiles[userId] || {
      userId,
      createdAt: new Date().toISOString(),
    };

    const updatedProfile: UserProfile = {
      ...existing,
      userId,
      displayName: displayName.trim().slice(0, 50),
      bio: typeof bio === 'string' ? bio.trim().slice(0, 300) : '',
      avatar: typeof avatar === 'string' ? avatar : existing.avatar || 'indigo',
      email: typeof email === 'string' ? email.trim() : existing.email || 'sahanaav2024@gmail.com',
      updatedAt: new Date().toISOString(),
    };

    profiles[userId] = updatedProfile;
    await saveProfiles(profiles);

    return res.status(200).json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('[Profile] Failed to update profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile details.',
    });
  }
});

// GET /api/profile/activity?userId=...
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || '';
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId parameter',
      });
    }

    const posts = await loadCommunityPosts();

    // 1. Posts authored by user
    const userPosts = posts
      .filter((p) => p.authorId === userId)
      .map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category,
        isAnonymous: p.isAnonymous,
        author: p.author,
        createdAt: p.createdAt,
        reactions: p.reactions || { warmth: 0, here: 0, matter: 0, proud: 0 },
        commentsCount: (p.comments || []).length,
      }));

    // 2. Comments authored by user across all posts
    const userComments: Array<{
      id: string;
      postId: string;
      postTitle: string;
      content: string;
      isAnonymous: boolean;
      createdAt: string;
    }> = [];

    posts.forEach((post) => {
      (post.comments || []).forEach((comment) => {
        if (comment.authorId === userId) {
          userComments.push({
            id: comment.id,
            postId: post.id,
            postTitle: post.title,
            content: comment.content,
            isAnonymous: comment.isAnonymous,
            createdAt: comment.createdAt,
          });
        }
      });
    });

    // 3. Supportive reactions made by user
    const userReactions: Array<{
      postId: string;
      postTitle: string;
      reaction: string;
    }> = [];

    posts.forEach((post) => {
      if (post.userReactions && post.userReactions[userId]) {
        userReactions.push({
          postId: post.id,
          postTitle: post.title,
          reaction: post.userReactions[userId],
        });
      }
    });

    return res.status(200).json({
      success: true,
      activity: {
        posts: userPosts,
        comments: userComments,
        reactions: userReactions,
      },
    });
  } catch (error) {
    console.error('[Profile] Failed to fetch activity:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user community activity.',
    });
  }
});

// GET /api/profile/reflections?userId=...
router.get('/reflections', async (_req: Request, res: Response) => {
  // Explicitly reporting that reflections backend storage is not implemented
  return res.status(200).json({
    success: true,
    supported: false,
    reflections: [],
    message: 'Personal reflection saving is not currently implemented in the Circles backend.',
  });
});

export default router;
