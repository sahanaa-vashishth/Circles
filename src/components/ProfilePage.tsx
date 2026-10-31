/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Edit3,
  Shield,
  EyeOff,
  UserCheck,
  Calendar,
  Mail,
  Fingerprint,
  Heart,
  MessageCircle,
  FileText,
  BookOpen,
  Check,
  X,
  ArrowRight,
  Info,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: 'home' | 'orbit' | 'community' | 'profile') => void;
}

interface UserProfileData {
  userId: string;
  displayName: string;
  bio: string;
  email: string;
  avatar: string;
  createdAt: string;
  updatedAt?: string;
}

interface UserActivityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  author: string;
  createdAt: string;
  reactions: Record<string, number>;
  commentsCount: number;
}

interface UserActivityComment {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface UserActivityReaction {
  postId: string;
  postTitle: string;
  reaction: string;
}

interface ActivityState {
  posts: UserActivityPost[];
  comments: UserActivityComment[];
  reactions: UserActivityReaction[];
}

const AVATAR_PRESETS = [
  { id: 'indigo', label: 'Lavender Blossom', gradient: 'from-[#A78BFA] via-[#C4B5FD] to-[#B8D8C8]' },
  { id: 'emerald', label: 'Calm Sage', gradient: 'from-emerald-400 via-teal-300 to-cyan-200' },
  { id: 'rose', label: 'Gentle Rose', gradient: 'from-rose-400 via-pink-300 to-amber-200' },
  { id: 'amber', label: 'Warm Amber', gradient: 'from-amber-400 via-orange-300 to-yellow-200' },
  { id: 'violet', label: 'Soft Lilac', gradient: 'from-[#8B70D6] via-[#A78BFA] to-[#EDE7FA]' },
];

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

function getReactionBadge(reaction: string): { label: string; icon: string; className: string } {
  switch (reaction) {
    case 'warmth':
      return { label: 'Warmth', icon: '❤️', className: 'bg-rose-50 text-rose-700 border-rose-300' };
    case 'here':
      return { label: "I'm Here", icon: '🤝', className: 'bg-teal-50 text-teal-800 border-teal-300' };
    case 'matter':
      return { label: 'You Matter', icon: '💜', className: 'bg-[#EDE7FA] text-[#8B70D6] border-[#A78BFA]' };
    case 'proud':
      return { label: 'Proud of You', icon: '✨', className: 'bg-amber-50 text-amber-800 border-amber-300' };
    default:
      return { label: 'Support', icon: '🤍', className: 'bg-[#FAF9F6] text-[#25243A] border-[#E8E4F0]' };
  }
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<UserProfileData>({
    userId: '',
    displayName: 'Sahana V.',
    bio: 'Seeking mindfulness and quiet strength. Taking things one gentle breath at a time.',
    email: 'sahanaav2024@gmail.com',
    avatar: 'indigo',
    createdAt: new Date().toISOString(),
  });

  const [activity, setActivity] = useState<ActivityState>({
    posts: [],
    comments: [],
    reactions: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeActivityTab, setActiveActivityTab] = useState<'posts' | 'comments' | 'reactions'>('posts');

  // Edit profile modal state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('indigo');
  const [editEmail, setEditEmail] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Initialize and fetch user data
  useEffect(() => {
    let storedId = localStorage.getItem('circles_user_id');
    if (!storedId) {
      storedId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('circles_user_id', storedId);
    }

    const storedName = localStorage.getItem('circles_profile_name') || 'Sahana V.';
    const storedBio =
      localStorage.getItem('circles_profile_bio') ||
      'Seeking mindfulness and quiet strength. Taking things one gentle breath at a time.';
    const storedAvatar = localStorage.getItem('circles_profile_avatar') || 'indigo';

    setProfile((prev) => ({
      ...prev,
      userId: storedId,
      displayName: storedName,
      bio: storedBio,
      avatar: storedAvatar,
    }));

    loadProfileFromBackend(storedId, storedName, storedBio, storedAvatar);
    loadUserActivity(storedId);
  }, []);

  const loadProfileFromBackend = async (
    userId: string,
    fallbackName: string,
    fallbackBio: string,
    fallbackAvatar: string
  ) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        localStorage.setItem('circles_profile_name', data.profile.displayName);
        localStorage.setItem('circles_profile_bio', data.profile.bio);
        localStorage.setItem('circles_profile_avatar', data.profile.avatar);
      } else {
        setProfile((p) => ({
          ...p,
          userId,
          displayName: fallbackName,
          bio: fallbackBio,
          avatar: fallbackAvatar,
        }));
      }
    } catch (err) {
      console.warn('[Profile] Could not fetch remote profile, using local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserActivity = async (userId: string) => {
    try {
      const res = await fetch(`/api/profile/activity?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && data.activity) {
        setActivity(data.activity);
      }
    } catch (err) {
      console.warn('[Profile] Error loading user activity:', err);
    }
  };

  const handleOpenEdit = () => {
    setEditName(profile.displayName);
    setEditBio(profile.bio);
    setEditAvatar(profile.avatar || 'indigo');
    setEditEmail(profile.email || 'sahanaav2024@gmail.com');
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setSaveErrorMessage('Display name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.userId,
          displayName: editName.trim(),
          bio: editBio.trim(),
          avatar: editAvatar,
          email: editEmail.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        localStorage.setItem('circles_profile_name', data.profile.displayName);
        localStorage.setItem('circles_profile_bio', data.profile.bio);
        localStorage.setItem('circles_profile_avatar', data.profile.avatar);

        setSaveSuccessMessage('Your profile changes have been saved.');
        setTimeout(() => {
          setIsEditing(false);
          setSaveSuccessMessage(null);
        }, 900);
      } else {
        setSaveErrorMessage(data.error || 'Failed to save profile changes.');
      }
    } catch (err) {
      console.error('[Profile] Save failed:', err);
      const updated: UserProfileData = {
        ...profile,
        displayName: editName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar,
        email: editEmail.trim(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(updated);
      localStorage.setItem('circles_profile_name', updated.displayName);
      localStorage.setItem('circles_profile_bio', updated.bio);
      localStorage.setItem('circles_profile_avatar', updated.avatar);
      setSaveSuccessMessage('Saved locally.');
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccessMessage(null);
      }, 900);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarPreset =
    AVATAR_PRESETS.find((p) => p.id === profile.avatar) || AVATAR_PRESETS[0];

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#FAF9F6] text-[#25243A] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Breadcrumb & Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#77758A]">
              <span className="text-[#8B70D6] font-medium">Circles</span>
              <span>/</span>
              <span>Account</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#25243A] tracking-tight mt-1">
              My Profile
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E4F0] text-xs text-[#77758A] shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anonymous Posting Protected</span>
          </div>
        </div>

        {/* 1. PROFILE HEADER */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E4F0] shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EDE7FA]/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Profile Avatar */}
              <div className="relative flex-none">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr ${currentAvatarPreset.gradient} p-0.5 shadow-sm flex items-center justify-center`}
                >
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#25243A]">
                      {getInitials(profile.displayName)}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Name & Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-[#25243A]">
                    {profile.displayName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EDE7FA] border border-[#E8E4F0] text-[#8B70D6] text-[11px] font-medium">
                    Community Member
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#25243A]/85 max-w-xl leading-relaxed">
                  {profile.bio || 'No personal bio added yet.'}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#77758A] pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#77758A]" />
                    Joined {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={handleOpenEdit}
              className="flex-none inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EDE7FA] hover:bg-[#A78BFA] text-[#8B70D6] hover:text-white border border-[#E8E4F0] text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </section>

        {/* 2. PERSONAL INFORMATION */}
        <section className="p-6 rounded-2xl bg-white border border-[#E8E4F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E4F0] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#25243A] flex items-center gap-2">
                <User className="w-4 h-4 text-[#8B70D6]" />
                <span>Personal Information</span>
              </h3>
              <p className="text-xs text-[#77758A] mt-0.5">
                Your profile credentials and account configuration
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="text-xs text-[#8B70D6] hover:text-[#7C3AED] font-medium transition-colors"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] space-y-1">
              <span className="text-[11px] font-medium text-[#77758A] uppercase tracking-wider">
                Display Name
              </span>
              <p className="text-sm font-semibold text-[#25243A]">{profile.displayName}</p>
              <p className="text-[11px] text-[#77758A]">
                Visible on public posts and non-anonymous comments
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] space-y-1">
              <span className="text-[11px] font-medium text-[#77758A] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#77758A]" />
                Account Email
              </span>
              <p className="text-sm font-semibold text-[#25243A]">
                {profile.email || 'sahanaav2024@gmail.com'}
              </p>
              <p className="text-[11px] text-[#77758A]">
                Private to your account, never shared publicly
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] space-y-1">
              <span className="text-[11px] font-medium text-[#77758A] uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3 h-3 text-[#77758A]" />
                User Identifier
              </span>
              <p className="text-xs font-mono text-[#25243A] truncate font-medium">
                {profile.userId || 'Loading...'}
              </p>
              <p className="text-[11px] text-[#77758A]">
                Anonymous posts map internally without exposing your identity
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] space-y-1">
              <span className="text-[11px] font-medium text-[#77758A] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-600" />
                Privacy & Anonymity
              </span>
              <p className="text-xs font-semibold text-emerald-700">Full Peer Protection Active</p>
              <p className="text-[11px] text-[#77758A]">
                When you toggle "Share anonymously", your name is stripped
              </p>
            </div>
          </div>
        </section>

        {/* 3. MY COMMUNITY ACTIVITY */}
        <section className="p-6 rounded-2xl bg-white border border-[#E8E4F0] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4F0] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#25243A] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#8B70D6]" />
                <span>My Community Activity</span>
              </h3>
              <p className="text-xs text-[#77758A] mt-0.5">
                Posts, comments, and supportive reactions from your actual session
              </p>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1.5 bg-[#F3F0FA] p-1 rounded-xl border border-[#E8E4F0] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveActivityTab('posts')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeActivityTab === 'posts'
                    ? 'bg-white text-[#25243A] shadow-xs font-semibold'
                    : 'text-[#77758A] hover:text-[#25243A]'
                }`}
              >
                Posts ({activity.posts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveActivityTab('comments')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeActivityTab === 'comments'
                    ? 'bg-white text-[#25243A] shadow-xs font-semibold'
                    : 'text-[#77758A] hover:text-[#25243A]'
                }`}
              >
                Comments ({activity.comments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveActivityTab('reactions')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeActivityTab === 'reactions'
                    ? 'bg-white text-[#25243A] shadow-xs font-semibold'
                    : 'text-[#77758A] hover:text-[#25243A]'
                }`}
              >
                Reactions ({activity.reactions.length})
              </button>
            </div>
          </div>

          {/* Sub-tab 1: User's Posts */}
          {activeActivityTab === 'posts' && (
            <div className="space-y-3">
              {activity.posts.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FAF9F6] border border-dashed border-[#E8E4F0] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE7FA] text-[#8B70D6] flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#25243A]">No community posts yet</p>
                    <p className="text-xs text-[#77758A] mt-0.5">
                      When you share thoughts in Circles, your posts will appear here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('community')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDE7FA] hover:bg-[#A78BFA] text-[#8B70D6] hover:text-white border border-[#E8E4F0] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Visit Community Feed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                activity.posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] space-y-3 hover:bg-[#F3F0FA] transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EDE7FA] text-[#8B70D6] text-[11px] font-medium border border-[#E8E4F0]">
                          {post.category}
                        </span>
                        {/* Clear Distinction: Anonymous vs Public Attribution */}
                        {post.isAnonymous ? (
                          <span className="px-2 py-0.5 rounded-full bg-white text-[#77758A] border border-[#E8E4F0] text-[10px] font-medium inline-flex items-center gap-1">
                            <EyeOff className="w-3 h-3 text-[#77758A]" />
                            Anonymous Post
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white text-[#8B70D6] border border-[#E8E4F0] text-[10px] font-medium inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-[#8B70D6]" />
                            Public: {post.author}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#77758A] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[#25243A]">{post.title}</h4>
                      <p className="text-xs text-[#25243A]/85 mt-1 leading-relaxed line-clamp-2">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E8E4F0] flex items-center justify-between text-xs text-[#77758A]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {(post.reactions?.warmth || 0) +
                            (post.reactions?.here || 0) +
                            (post.reactions?.matter || 0) +
                            (post.reactions?.proud || 0)}{' '}
                          Reactions
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 text-[#8B70D6]" />
                          {post.commentsCount} Comments
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('community')}
                        className="text-[#8B70D6] hover:text-[#7C3AED] font-semibold inline-flex items-center gap-1"
                      >
                        <span>View thread</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sub-tab 2: User's Comments */}
          {activeActivityTab === 'comments' && (
            <div className="space-y-3">
              {activity.comments.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FAF9F6] border border-dashed border-[#E8E4F0] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE7FA] text-[#8B70D6] flex items-center justify-center mx-auto">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#25243A]">No comments made yet</p>
                    <p className="text-xs text-[#77758A] mt-0.5">
                      Your supportive words and replies to peer posts will be listed here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('community')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDE7FA] hover:bg-[#A78BFA] text-[#8B70D6] hover:text-white border border-[#E8E4F0] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Browse Community</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                activity.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] space-y-2 hover:bg-[#F3F0FA] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-[#77758A]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#77758A]">On post:</span>
                        <span className="font-semibold text-[#25243A] line-clamp-1 max-w-xs">
                          "{comment.postTitle}"
                        </span>
                        {comment.isAnonymous ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-white text-[#77758A] border border-[#E8E4F0] text-[10px] inline-flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5" /> Anon
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full bg-white text-[#8B70D6] border border-[#E8E4F0] text-[10px] inline-flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5" /> Public
                          </span>
                        )}
                      </div>
                      <span className="text-[11px]">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#25243A]/85 leading-relaxed bg-white p-2.5 rounded-lg border border-[#E8E4F0]">
                      "{comment.content}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sub-tab 3: User's Supportive Reactions */}
          {activeActivityTab === 'reactions' && (
            <div className="space-y-3">
              {activity.reactions.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FAF9F6] border border-dashed border-[#E8E4F0] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#25243A]">No reactions given yet</p>
                    <p className="text-xs text-[#77758A] mt-0.5">
                      Send warmth, presence, and encouragement to others in the Community.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('community')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDE7FA] hover:bg-[#A78BFA] text-[#8B70D6] hover:text-white border border-[#E8E4F0] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Send Support in Community</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                activity.reactions.map((rx, idx) => {
                  const badge = getReactionBadge(rx.reaction);
                  return (
                    <div
                      key={`${rx.postId}-${idx}`}
                      className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 flex-none ${badge.className}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-xs text-[#25243A]/85 truncate">
                          Sent on <span className="font-semibold text-[#25243A]">"{rx.postTitle}"</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('community')}
                        className="text-xs text-[#8B70D6] hover:text-[#7C3AED] font-semibold flex-none"
                      >
                        View Post
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* 4. MY REFLECTIONS */}
        <section className="p-6 rounded-2xl bg-white border border-[#E8E4F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E4F0] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#25243A] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8B70D6]" />
                <span>My Reflections</span>
              </h3>
              <p className="text-xs text-[#77758A] mt-0.5">
                Saved personal entries and daily thoughts
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F3F0FA] border border-[#E8E4F0] text-[#77758A] text-[11px] font-medium">
              Status: In Development
            </span>
          </div>

          {/* Genuine state reporting: No mock stats, no invented history */}
          <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EDE7FA] text-[#8B70D6] flex items-center justify-center flex-none mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-[#25243A]">
                  Personal Reflection Storage System
                </h4>
                <p className="text-xs text-[#77758A] leading-relaxed">
                  Circles currently provides daily mindful prompts on the Home page, but persistent
                  private reflection journaling is not yet integrated into the Circles database.
                </p>
                <p className="text-[11px] text-[#77758A] leading-relaxed pt-1">
                  In accordance with Circles standards, no simulated journal logs or synthetic
                  statistics are generated. As soon as personal reflection saving is added to the
                  backend, your private reflections will be safely accessible in this space.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E4F0] flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-[#77758A]">
                Want to read today's prompt?
              </span>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-xs font-semibold text-[#8B70D6] hover:text-[#7C3AED] inline-flex items-center gap-1"
              >
                <span>View Daily Reflection on Home</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25243A]/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E8E4F0] shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E4F0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EDE7FA] text-[#8B70D6] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#25243A]">Edit Profile</h3>
                  <p className="text-xs text-[#77758A]">
                    Update your public display name and personal bio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-[#77758A] hover:text-[#25243A] hover:bg-[#F3F0FA] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-none" />
                <span>{saveErrorMessage}</span>
              </div>
            )}

            {saveSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-none" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#25243A]">Avatar Palette</label>
                <div className="flex items-center gap-2.5 pt-1">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = editAvatar === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setEditAvatar(preset.id)}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                          preset.gradient
                        } flex items-center justify-center transition-all ${
                          isSelected
                            ? 'ring-2 ring-[#8B70D6] ring-offset-2 scale-110 shadow-xs'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#25243A]">
                  Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Sahana V."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] text-sm text-[#25243A] placeholder-[#77758A] focus:outline-none focus:bg-white focus:border-[#A78BFA] focus:ring-1 focus:ring-[#EDE7FA] transition-all"
                  required
                />
                <p className="text-[11px] text-[#77758A]">
                  Used when sharing public posts or non-anonymous comments.
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#25243A]">Short Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Share a short, gentle sentence about what brings you to Circles..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] text-sm text-[#25243A] placeholder-[#77758A] focus:outline-none focus:bg-white focus:border-[#A78BFA] focus:ring-1 focus:ring-[#EDE7FA] transition-all resize-none"
                />
                <div className="flex justify-between text-[11px] text-[#77758A]">
                  <span>Optional</span>
                  <span>{editBio.length}/300</span>
                </div>
              </div>

              {/* Account Email (informational / editable preference) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#25243A]">Account Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] text-sm text-[#25243A] placeholder-[#77758A] focus:outline-none focus:bg-white focus:border-[#A78BFA] focus:ring-1 focus:ring-[#EDE7FA] transition-all"
                />
                <p className="text-[11px] text-[#77758A]">
                  Used only for account identification, never displayed on the community board.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#E8E4F0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#77758A] hover:text-[#25243A] hover:bg-[#F3F0FA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#8B70D6] text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
