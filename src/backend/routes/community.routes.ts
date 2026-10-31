import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { checkAbusiveContent, ABUSE_WARNING_MESSAGE } from '../../shared/moderation/abuseDetector.ts';

const router = Router();
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'community.json');

export type ReactionType = 'warmth' | 'here' | 'matter' | 'proud';

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null;
  author: string;
  authorId?: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId?: string;
  isAnonymous: boolean;
  createdAt: string;
  reactions: Record<ReactionType, number>;
  userReactions: Record<string, ReactionType>; // userId -> reaction
  comments: Comment[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Taking pauses when the mind feels full',
    content:
      'I used to feel guilty for stepping away from my notes during exam preparation. Today I finally realized that my thoughts settle much better when I give myself permission to take a 15-minute walk outside. The information actually sticks when I’m not constantly running on panic.',
    category: 'College & Life',
    author: 'Priya S.',
    authorId: 'system_author_1',
    isAnonymous: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reactions: {
      warmth: 12,
      here: 18,
      matter: 7,
      proud: 14,
    },
    userReactions: {},
    comments: [
      {
        id: 'comment-1',
        postId: 'post-1',
        author: 'Arun K.',
        authorId: 'system_author_2',
        isAnonymous: false,
        content:
          'This is so true. Fresh air changes everything when the study anxiety kicks in.',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: 'comment-2',
        postId: 'post-1',
        parentId: 'comment-1',
        author: 'Anonymous Friend',
        authorId: 'system_author_3',
        isAnonymous: true,
        content:
          'Needed this reminder today. Been sitting at my desk for 6 hours straight. Stepping out now.',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'post-2',
    title: 'Reached out to a friend after weeks of isolation',
    content:
      'My self-doubt kept insisting they were too busy and that I would just be an emotional burden. But I finally sent a short message saying "Thinking of you." We ended up laughing over voice notes for an hour. Sometimes the hardest part is just pressing send.',
    category: 'Small Wins',
    author: 'Anonymous Friend',
    authorId: 'system_author_4',
    isAnonymous: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reactions: {
      warmth: 24,
      here: 15,
      matter: 11,
      proud: 32,
    },
    userReactions: {},
    comments: [
      {
        id: 'comment-3',
        postId: 'post-2',
        author: 'Maya R.',
        authorId: 'system_author_5',
        isAnonymous: false,
        content:
          'I am so proud of you! Breaking that isolation loop takes so much bravery.',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'post-3',
    title: 'Evening tea without any screens or noise',
    content:
      'Sat by the open window with warm chamomile and just watched the dusk settle over the trees. No notifications, no podcast in the background. It felt strange for the first two minutes, and then incredibly grounding.',
    category: 'Self Reflection',
    author: 'Arun K.',
    authorId: 'system_author_2',
    isAnonymous: false,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    reactions: {
      warmth: 19,
      here: 8,
      matter: 14,
      proud: 9,
    },
    userReactions: {},
    comments: [],
  },
  {
    id: 'post-4',
    title: 'Heavy heart tonight, just need to know someone is out there',
    content:
      'Everything felt like too much today. Just feeling a bit alone in my room and wanted to leave a quiet note here. Hope whoever is reading this has a gentle night.',
    category: 'Need Someone to Talk To',
    author: 'Anonymous Friend',
    authorId: 'system_author_6',
    isAnonymous: true,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    reactions: {
      warmth: 35,
      here: 42,
      matter: 29,
      proud: 5,
    },
    userReactions: {},
    comments: [
      {
        id: 'comment-4',
        postId: 'post-4',
        author: 'Dev M.',
        authorId: 'system_author_7',
        isAnonymous: false,
        content:
          'We are right here with you. You are never truly alone. Wrap yourself in a warm blanket tonight.',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

async function loadPosts(): Promise<Post[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    await savePosts(INITIAL_POSTS);
    return INITIAL_POSTS;
  }
}

async function savePosts(posts: Post[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

/**
 * Basic safety moderation helper:
 * Detects abusive slurs, harassment, or personal threats while allowing genuine emotional vulnerability.
 */
function checkModeration(text: string): { safe: boolean; reason?: string } {
  const harassmentKeywords = [
    /\bkys\b/i,
    /\bkill yourself\b/i,
    /\bgo die\b/i,
    /\bfuck you\b/i,
    /\bhate you\b/i,
    /\byou are disgusting\b/i,
    /\byou are pathetic\b/i,
    /\bidiot\b/i,
    /\bretard\b/i,
  ];

  for (const pattern of harassmentKeywords) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason:
          'Circles is a supportive sanctuary. Please ensure your post remains kind, respectful, and free from abusive attacks.',
      };
    }
  }

  return { safe: true };
}

// GET /api/community/posts
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || '';
    const posts = await loadPosts();

    // Map posts: never expose authorId in public responses, compute isOwner
    const formatted = posts.map((post) => {
      const isPostOwner = Boolean(userId && post.authorId === userId);
      const myReaction = userId && post.userReactions ? post.userReactions[userId] || null : null;

      const formattedComments = (post.comments || []).map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        parentId: comment.parentId || null,
        author: comment.author,
        isAnonymous: comment.isAnonymous,
        content: comment.content,
        createdAt: comment.createdAt,
        isOwner: Boolean(userId && comment.authorId === userId),
      }));

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        author: post.author,
        isAnonymous: post.isAnonymous,
        createdAt: post.createdAt,
        reactions: post.reactions || { warmth: 0, here: 0, matter: 0, proud: 0 },
        myReaction,
        isOwner: isPostOwner,
        comments: formattedComments,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('[Community] Failed to load posts:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to retrieve community posts. Please try again in a moment.',
    });
  }
});

// POST /api/community/posts
router.post('/posts', async (req: Request, res: Response) => {
  try {
    const { title, content, category, isAnonymous, author, userId } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a title for your post.',
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please write some thoughts in your post content.',
      });
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // Moderation check using robust abuse detection
    const modCheckTitle = checkAbusiveContent(trimmedTitle);
    if (modCheckTitle.isAbusive) {
      return res.status(400).json({
        success: false,
        isAbusive: true,
        error: modCheckTitle.reason || ABUSE_WARNING_MESSAGE,
      });
    }

    const modCheckContent = checkAbusiveContent(trimmedContent);
    if (modCheckContent.isAbusive) {
      return res.status(400).json({
        success: false,
        isAbusive: true,
        error: modCheckContent.reason || ABUSE_WARNING_MESSAGE,
      });
    }

    const posts = await loadPosts();

    const allowedCategories = [
      'Small Wins',
      'Need Someone to Talk To',
      'Self Reflection',
      'College & Life',
      'Just Sharing',
    ];

    const finalCategory = allowedCategories.includes(category)
      ? category
      : 'Just Sharing';

    // Strictly ensure anonymous identity protection
    const postIsAnonymous = Boolean(isAnonymous);
    const finalAuthor = postIsAnonymous
      ? 'Anonymous Friend'
      : typeof author === 'string' && author.trim().length > 0
      ? author.trim()
      : 'Community Member';

    const newPost: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: trimmedTitle,
      content: trimmedContent,
      category: finalCategory,
      author: finalAuthor,
      authorId: typeof userId === 'string' && userId.length > 0 ? userId : undefined,
      isAnonymous: postIsAnonymous,
      createdAt: new Date().toISOString(),
      reactions: {
        warmth: 0,
        here: 0,
        matter: 0,
        proud: 0,
      },
      userReactions: {},
      comments: [],
    };

    posts.unshift(newPost);
    await savePosts(posts);

    return res.status(201).json({
      success: true,
      data: {
        id: newPost.id,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        author: newPost.author,
        isAnonymous: newPost.isAnonymous,
        createdAt: newPost.createdAt,
        reactions: newPost.reactions,
        myReaction: null,
        isOwner: true,
        comments: [],
      },
    });
  } catch (error) {
    console.error('[Community] Failed to create post:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to publish post. Please try again.',
    });
  }
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.body?.userId || req.query?.userId) as string;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User identification is required to delete content.',
      });
    }

    const posts = await loadPosts();
    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found.',
      });
    }

    const post = posts[postIndex];

    // Ownership check: must match authorId
    if (!post.authorId || post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this post.',
      });
    }

    // Remove post along with all its comments and reactions
    posts.splice(postIndex, 1);
    await savePosts(posts);

    return res.status(200).json({
      success: true,
      message: 'Post successfully deleted.',
      deletedPostId: id,
    });
  } catch (error) {
    console.error('[Community] Failed to delete post:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete post.',
    });
  }
});

// POST /api/community/posts/:id/react
router.post('/posts/:id/react', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reaction, userId } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User identification is required to react.',
      });
    }

    const allowedReactions: ReactionType[] = ['warmth', 'here', 'matter', 'proud'];
    if (!allowedReactions.includes(reaction as ReactionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reaction type.',
      });
    }

    const rx = reaction as ReactionType;

    const posts = await loadPosts();
    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found.',
      });
    }

    const post = posts[postIndex];
    if (!post.reactions) {
      post.reactions = { warmth: 0, here: 0, matter: 0, proud: 0 };
    }
    if (!post.userReactions) {
      post.userReactions = {};
    }

    const existingReaction = post.userReactions[userId];

    if (existingReaction === rx) {
      // Toggle off / remove reaction
      delete post.userReactions[userId];
      post.reactions[rx] = Math.max(0, (post.reactions[rx] || 0) - 1);
    } else {
      // If changing from another reaction, decrement old reaction
      if (existingReaction && post.reactions[existingReaction]) {
        post.reactions[existingReaction] = Math.max(0, post.reactions[existingReaction] - 1);
      }
      // Set new reaction
      post.userReactions[userId] = rx;
      post.reactions[rx] = (post.reactions[rx] || 0) + 1;
    }

    await savePosts(posts);

    return res.status(200).json({
      success: true,
      data: {
        reactions: post.reactions,
        myReaction: post.userReactions[userId] || null,
      },
    });
  } catch (error) {
    console.error('[Community] Failed to update reaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record reaction.',
    });
  }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isAnonymous, author, parentId, userId } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content cannot be empty.',
      });
    }

    const trimmedContent = content.trim();

    // Moderation check using robust abuse detection
    const modCheck = checkAbusiveContent(trimmedContent);
    if (modCheck.isAbusive) {
      return res.status(400).json({
        success: false,
        isAbusive: true,
        error: modCheck.reason || ABUSE_WARNING_MESSAGE,
      });
    }

    const posts = await loadPosts();
    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found.',
      });
    }

    const post = posts[postIndex];
    if (!post.comments) {
      post.comments = [];
    }

    const commentIsAnonymous = Boolean(isAnonymous);
    const finalAuthor = commentIsAnonymous
      ? 'Anonymous Friend'
      : typeof author === 'string' && author.trim().length > 0
      ? author.trim()
      : 'Community Member';

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postId: id,
      parentId: parentId || null,
      author: finalAuthor,
      authorId: typeof userId === 'string' && userId.length > 0 ? userId : undefined,
      isAnonymous: commentIsAnonymous,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    };

    post.comments.push(newComment);
    await savePosts(posts);

    return res.status(201).json({
      success: true,
      data: {
        id: newComment.id,
        postId: newComment.postId,
        parentId: newComment.parentId,
        author: newComment.author,
        isAnonymous: newComment.isAnonymous,
        content: newComment.content,
        createdAt: newComment.createdAt,
        isOwner: true,
      },
    });
  } catch (error) {
    console.error('[Community] Failed to add comment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to post comment. Please try again.',
    });
  }
});

// DELETE /api/community/posts/:postId/comments/:commentId
router.delete('/posts/:postId/comments/:commentId', async (req: Request, res: Response) => {
  try {
    const { postId, commentId } = req.params;
    const userId = (req.body?.userId || req.query?.userId) as string;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User identification is required to delete content.',
      });
    }

    const posts = await loadPosts();
    const post = posts.find((p) => p.id === postId);

    if (!post || !post.comments) {
      return res.status(404).json({
        success: false,
        error: 'Post or comment not found.',
      });
    }

    const commentIndex = post.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found.',
      });
    }

    const comment = post.comments[commentIndex];

    // Ownership check
    if (!comment.authorId || comment.authorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this comment.',
      });
    }

    // Remove this comment and any direct child replies attached to it
    post.comments = post.comments.filter(
      (c) => c.id !== commentId && c.parentId !== commentId
    );
    await savePosts(posts);

    return res.status(200).json({
      success: true,
      message: 'Comment successfully deleted.',
      deletedCommentId: commentId,
    });
  } catch (error) {
    console.error('[Community] Failed to delete comment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete comment.',
    });
  }
});

export default router;
