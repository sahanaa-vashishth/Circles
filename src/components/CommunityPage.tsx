/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  MessageCircle,
  Heart,
  ArrowLeft,
  Filter,
  Shield,
  Award,
  Send,
  AlertCircle,
  CheckCircle2,
  PenLine,
  EyeOff,
  UserCheck,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import {
  checkAbusiveContent,
} from '../shared/moderation/abuseDetector.ts';

interface CommunityPageProps {
  onNavigate: (page: 'home' | 'orbit' | 'community' | 'profile') => void;
}

export type ReactionType = 'warmth' | 'here' | 'matter' | 'proud';

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null;
  author: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
  isOwner?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  isAnonymous: boolean;
  createdAt: string;
  reactions: Record<ReactionType, number>;
  myReaction?: ReactionType | null;
  comments: Comment[];
  isOwner?: boolean;
}

const CATEGORIES = [
  'All Circles',
  'Small Wins',
  'Need Someone to Talk To',
  'Self Reflection',
  'College & Life',
  'Just Sharing',
];

const COMPOSER_CATEGORIES = [
  'Small Wins',
  'Need Someone to Talk To',
  'Self Reflection',
  'College & Life',
  'Just Sharing',
];

const SUPPORTIVE_REACTIONS = [
  {
    type: 'warmth' as const,
    label: 'Warmth',
    tooltip: 'Sending Warmth',
    emoji: '❤️',
    icon: Heart,
    activeClass: 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200',
  },
  {
    type: 'here' as const,
    label: "I'm Here",
    tooltip: "I'm Here For You",
    emoji: '🤝',
    icon: Shield,
    activeClass: 'bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-200',
  },
  {
    type: 'matter' as const,
    label: 'You Matter',
    tooltip: 'You Matter',
    emoji: '🌟',
    icon: Sparkles,
    activeClass: 'bg-[#EDE7FA] text-[#8B70D6] border-[#A78BFA] ring-1 ring-[#EDE7FA]',
  },
  {
    type: 'proud' as const,
    label: 'Proud',
    tooltip: 'Proud of You',
    emoji: '🏆',
    icon: Award,
    activeClass: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200',
  },
];

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Circles');

  // Client user identity state
  const [userId, setUserId] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('Sahana V.');

  // Composer state
  const [showComposer, setShowComposer] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Small Wins');
  const [newIsAnonymous, setNewIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [composerSuccess, setComposerSuccess] = useState<string | null>(null);

  // Comments state: mapping postId -> boolean (expanded)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  // New comment input per post: mapping postId -> string
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  // Anonymous toggle for comment per post
  const [commentAnonymous, setCommentAnonymous] = useState<Record<string, boolean>>({});
  // Replying to comment state: mapping postId -> parentCommentId | null
  const [replyingTo, setReplyingTo] = useState<Record<string, string | null>>({});
  // Comment submission loading
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'post' | 'comment';
    postId: string;
    commentId?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Abusive language detection warning modal
  const [abuseWarningModal, setAbuseWarningModal] = useState<{
    isOpen: boolean;
    target: 'post' | 'comment';
  }>({ isOpen: false, target: 'post' });

  // Initialize userId and profile name
  useEffect(() => {
    let storedId = localStorage.getItem('circles_user_id');
    if (!storedId) {
      storedId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('circles_user_id', storedId);
    }
    setUserId(storedId);

    const storedName = localStorage.getItem('circles_profile_name');
    if (storedName) {
      setProfileName(storedName);
    }
  }, []);

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/community/posts?userId=${encodeURIComponent(userId || '')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error('[Community] Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  // Handle Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setComposerError(null);
    setComposerSuccess(null);

    const trimmedTitle = newTitle.trim();
    const trimmedContent = newContent.trim();

    if (!trimmedTitle) {
      setComposerError('Please enter a gentle heading for your post.');
      return;
    }

    if (!trimmedContent) {
      setComposerError('Please write some thoughts in your post content.');
      return;
    }

    // Abusive content pre-check
    const titleCheck = checkAbusiveContent(trimmedTitle);
    const contentCheck = checkAbusiveContent(trimmedContent);
    if (titleCheck.isAbusive || contentCheck.isAbusive) {
      setAbuseWarningModal({ isOpen: true, target: 'post' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category: newCategory,
          isAnonymous: newIsAnonymous,
          author: profileName,
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.isAbusive) {
          setAbuseWarningModal({ isOpen: true, target: 'post' });
          return;
        }
        setComposerError(result.error || 'Failed to publish post. Please try again.');
      } else {
        // Prepend new post to feed
        setPosts((prev) => [result.data, ...prev]);
        setNewTitle('');
        setNewContent('');
        setNewCategory('Small Wins');
        setNewIsAnonymous(false);
        setComposerSuccess('Your post has been shared with the community!');
        setTimeout(() => {
          setComposerSuccess(null);
          setShowComposer(false);
        }, 2000);
      }
    } catch (err) {
      console.error('[Community] Post submission error:', err);
      setComposerError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Supportive Reaction
  const handleToggleReaction = async (postId: string, reaction: ReactionType) => {
    if (!userId) return;

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const currentReaction = post.myReaction;
        const newReactions = { ...post.reactions };

        if (currentReaction === reaction) {
          // Toggle off
          newReactions[reaction] = Math.max(0, (newReactions[reaction] || 0) - 1);
          return {
            ...post,
            reactions: newReactions,
            myReaction: null,
          };
        } else {
          // Decrement previous if existed
          if (currentReaction && newReactions[currentReaction]) {
            newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
          }
          // Increment new
          newReactions[reaction] = (newReactions[reaction] || 0) + 1;
          return {
            ...post,
            reactions: newReactions,
            myReaction: reaction,
          };
        }
      })
    );

    try {
      const response = await fetch(`/api/community/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction, userId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        fetchPosts();
      }
    } catch (err) {
      console.error('[Community] Reaction error:', err);
      fetchPosts();
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text || commentSubmitting[postId] || !userId) return;

    // Abusive content pre-check
    const commentCheck = checkAbusiveContent(text);
    if (commentCheck.isAbusive) {
      setAbuseWarningModal({
        isOpen: true,
        target: 'comment',
      });
      return;
    }

    const parentId = replyingTo[postId] || null;
    const isAnon = Boolean(commentAnonymous[postId]);

    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          isAnonymous: isAnon,
          author: profileName,
          parentId,
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.isAbusive) {
          setAbuseWarningModal({
            isOpen: true,
            target: 'comment',
          });
          return;
        }
      } else if (result.data) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              comments: [...(post.comments || []), result.data],
            };
          })
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        setReplyingTo((prev) => ({ ...prev, [postId]: null }));
      }
    } catch (err) {
      console.error('[Community] Add comment error:', err);
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Handle Confirmed Deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting || !userId) return;

    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'post') {
        const response = await fetch(`/api/community/posts/${deleteTarget.postId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Immediately remove the post from state
          setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.postId));
          setDeleteTarget(null);
        } else {
          alert(result.error || 'Failed to delete post.');
        }
      } else if (deleteTarget.type === 'comment' && deleteTarget.commentId) {
        const response = await fetch(
          `/api/community/posts/${deleteTarget.postId}/comments/${deleteTarget.commentId}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          // Immediately remove comment and its nested replies from state
          setPosts((prev) =>
            prev.map((post) => {
              if (post.id !== deleteTarget.postId) return post;
              return {
                ...post,
                comments: (post.comments || []).filter(
                  (c) =>
                    c.id !== deleteTarget.commentId &&
                    c.parentId !== deleteTarget.commentId
                ),
              };
            })
          );
          setDeleteTarget(null);
        } else {
          alert(result.error || 'Failed to delete comment.');
        }
      }
    } catch (err) {
      console.error('[Community] Deletion error:', err);
      alert('Unable to delete at this moment. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter posts by category
  const filteredPosts =
    selectedCategory === 'All Circles'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 selection:bg-[#EDE7FA] selection:text-[#25243A] relative bg-[#FAF9F6]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-xs text-[#77758A] hover:text-[#25243A] inline-flex items-center gap-1 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#25243A] flex items-center gap-2">
              Circles Community
            </h1>
            <p className="text-xs sm:text-sm text-[#77758A] mt-1">
              A respectful, empathetic peer community to share reflections, small wins, and heartfelt support.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowComposer((prev) => !prev)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-2 transition-all shadow-xs ${
                showComposer
                  ? 'bg-white text-[#25243A] border border-[#E8E4F0]'
                  : 'bg-[#A78BFA] hover:bg-[#8B70D6] text-white'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>{showComposer ? 'Close Composer' : 'Create Post'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('orbit')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F0FA] border border-[#E8E4F0] text-[#25243A] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B70D6]" />
              <span>Talk to Orbit</span>
            </button>
          </div>
        </div>

        {/* Post Creation Composer */}
        {showComposer && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E4F0] shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EDE7FA] text-[#8B70D6] flex items-center justify-center">
                  <PenLine className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-[#25243A]">Create a Community Post</h2>
              </div>
              <span className="text-[11px] text-[#77758A]">
                Safe, supportive environment
              </span>
            </div>

            {composerError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-none text-rose-600" />
                <span>{composerError}</span>
              </div>
            )}

            {composerSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-none text-emerald-600" />
                <span>{composerSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-medium text-[#77758A] mb-1.5">
                  Choose a Circle / Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMPOSER_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        newCategory === cat
                          ? 'bg-[#A78BFA] text-white shadow-xs'
                          : 'bg-[#FAF9F6] border border-[#E8E4F0] text-[#77758A] hover:text-[#25243A] hover:bg-[#F3F0FA]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-xs font-medium text-[#77758A] mb-1">
                  Post Heading
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Give your thoughts a gentle heading..."
                  maxLength={120}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] text-[#25243A] placeholder-[#77758A] text-sm focus:outline-none focus:bg-white focus:border-[#A78BFA] focus:ring-1 focus:ring-[#EDE7FA]"
                />
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-xs font-medium text-[#77758A] mb-1">
                  What is on your mind?
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your thoughts, feelings, a small victory, or something you are navigating right now..."
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] text-[#25243A] placeholder-[#77758A] text-sm focus:outline-none focus:bg-white focus:border-[#A78BFA] focus:ring-1 focus:ring-[#EDE7FA] resize-none leading-relaxed"
                />
              </div>

              {/* Anonymous Posting Toggle */}
              <div className="p-3.5 rounded-xl bg-[#F3F0FA] border border-[#E8E4F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      newIsAnonymous
                        ? 'bg-[#EDE7FA] text-[#8B70D6]'
                        : 'bg-white text-[#8B70D6] border border-[#E8E4F0]'
                    }`}
                  >
                    {newIsAnonymous ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#25243A]">
                      {newIsAnonymous
                        ? 'Posting Anonymously'
                        : `Posting as ${profileName}`}
                    </p>
                    <p className="text-[11px] text-[#77758A]">
                      {newIsAnonymous
                        ? 'Your name and identity are completely hidden from the public feed.'
                        : 'Your profile name will be visible to community members.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewIsAnonymous(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !newIsAnonymous
                        ? 'bg-white text-[#25243A] border border-[#E8E4F0] shadow-xs font-semibold'
                        : 'bg-[#FAF9F6] text-[#77758A] hover:text-[#25243A]'
                    }`}
                  >
                    As {profileName.split(' ')[0]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIsAnonymous(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      newIsAnonymous
                        ? 'bg-[#A78BFA] text-white shadow-xs font-semibold'
                        : 'bg-[#FAF9F6] text-[#77758A] hover:text-[#25243A]'
                    }`}
                  >
                    Anonymously
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#77758A]">
                  Respectful guidelines apply to all community circles.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#77758A] hover:text-[#25243A] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                    className="px-5 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#8B70D6] text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-[#77758A] flex-none mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-[#25243A] border border-[#E8E4F0] shadow-xs font-semibold'
                  : 'bg-[#F3F0FA] text-[#77758A] border border-transparent hover:text-[#25243A] hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center text-[#77758A] text-sm space-y-2">
            <Sparkles className="w-6 h-6 mx-auto animate-spin-slow text-[#8B70D6]" />
            <p>Loading community circles...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="p-8 rounded-2xl bg-white border border-[#E8E4F0] text-center space-y-3 shadow-xs">
            <Users className="w-8 h-8 text-[#77758A] mx-auto" />
            <h3 className="text-sm font-semibold text-[#25243A]">No posts in this circle yet</h3>
            <p className="text-xs text-[#77758A] max-w-sm mx-auto">
              Be the first to share a warm reflection or thought in this space.
            </p>
            <button
              type="button"
              onClick={() => setShowComposer(true)}
              className="px-4 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#8B70D6] text-white text-xs font-medium shadow-xs"
            >
              Start the Conversation
            </button>
          </div>
        )}

        {/* Community Feed */}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isCommentsOpen = Boolean(expandedComments[post.id]);
            const postComments = post.comments || [];
            const commentCount = postComments.length;

            return (
              <article
                key={post.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E4F0] shadow-xs space-y-4 transition-all hover:shadow-sm"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs">
                    {post.isAnonymous ? (
                      <div className="w-7 h-7 rounded-full bg-[#EDE7FA] text-[#8B70D6] flex items-center justify-center font-semibold text-[11px] border border-[#E8E4F0]">
                        <EyeOff className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#F3F0FA] text-[#8B70D6] flex items-center justify-center font-semibold text-[11px] border border-[#E8E4F0]">
                        {post.author ? post.author[0].toUpperCase() : 'U'}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#25243A]">
                          {post.isAnonymous ? 'Anonymous Friend' : post.author}
                        </span>
                        {post.isAnonymous && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EDE7FA] text-[#8B70D6] border border-[#E8E4F0]">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#77758A]">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EDE7FA] text-[#8B70D6] border border-[#E8E4F0]">
                      {post.category}
                    </span>

                    {/* Delete Icon on My Posts */}
                    {post.isOwner && (
                      <button
                        type="button"
                        title="Delete your post"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'post',
                            postId: post.id,
                          })
                        }
                        className="p-1 rounded-lg text-[#77758A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Heading & Content */}
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-[#25243A] tracking-tight">
                    {post.title}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#25243A]/90 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Supportive Reactions Bar */}
                <div className="pt-3 border-t border-[#E8E4F0] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {SUPPORTIVE_REACTIONS.map((rx) => {
                      const count = (post.reactions && post.reactions[rx.type]) || 0;
                      const isActive = post.myReaction === rx.type;

                      return (
                        <button
                          key={rx.type}
                          type="button"
                          title={rx.tooltip}
                          onClick={() => handleToggleReaction(post.id, rx.type)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isActive
                              ? rx.activeClass
                              : 'bg-[#FAF9F6] border-[#E8E4F0] text-[#77758A] hover:text-[#25243A] hover:bg-[#F3F0FA]'
                          }`}
                        >
                          <span className="text-sm">{rx.emoji}</span>
                          <span className="hidden sm:inline">{rx.label}</span>
                          {count > 0 && (
                            <span className="font-semibold text-[11px] ml-0.5">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Comment Toggle Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-[#77758A] hover:text-[#25243A] px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] hover:bg-[#F3F0FA] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#8B70D6]" />
                    <span>
                      {commentCount} {commentCount === 1 ? 'thought' : 'thoughts'}
                    </span>
                    {isCommentsOpen ? (
                      <ChevronUp className="w-3 h-3 text-[#77758A]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#77758A]" />
                    )}
                  </button>
                </div>

                {/* Comments Section */}
                {isCommentsOpen && (
                  <div className="pt-4 border-t border-[#E8E4F0] space-y-4 animate-fade-in">
                    {/* Add Comment Input */}
                    <div className="p-3.5 rounded-xl bg-[#F3F0FA] border border-[#E8E4F0] space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#77758A]">
                        <span className="font-medium text-[#25243A]">
                          {replyingTo[post.id]
                            ? 'Replying to comment'
                            : 'Leave a supportive comment'}
                        </span>
                        {replyingTo[post.id] && (
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingTo((prev) => ({ ...prev, [post.id]: null }))
                            }
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Cancel reply
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={2}
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          replyingTo[post.id]
                            ? 'Write a gentle reply...'
                            : 'Offer words of encouragement or share a gentle perspective...'
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8E4F0] text-[#25243A] placeholder-[#77758A] text-xs focus:outline-none focus:border-[#A78BFA] resize-none"
                      />

                      <div className="flex items-center justify-between pt-1">
                        {/* Anonymous Toggle for Comment */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCommentAnonymous((prev) => ({
                                ...prev,
                                [post.id]: !prev[post.id],
                              }))
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                              commentAnonymous[post.id]
                                ? 'bg-[#EDE7FA] text-[#8B70D6] border-[#A78BFA]'
                                : 'bg-white text-[#77758A] border-[#E8E4F0] hover:text-[#25243A]'
                            }`}
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>
                              {commentAnonymous[post.id]
                                ? 'Commenting Anonymously'
                                : `As ${profileName.split(' ')[0]}`}
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          disabled={
                            !(commentInputs[post.id] || '').trim() ||
                            commentSubmitting[post.id]
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-[#A78BFA] hover:bg-[#8B70D6] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 shadow-xs transition-all"
                        >
                          <Send className="w-3 h-3" />
                          <span>
                            {commentSubmitting[post.id] ? 'Posting...' : 'Comment'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {postComments.length === 0 ? (
                      <p className="text-xs text-[#77758A] text-center py-2">
                        No thoughts shared yet. Be the first to leave words of warmth.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {postComments
                          .filter((c) => !c.parentId)
                          .map((comment) => {
                            const replies = postComments.filter(
                              (r) => r.parentId === comment.id
                            );

                            return (
                              <div key={comment.id} className="space-y-2">
                                <div className="p-3 rounded-xl bg-white border border-[#E8E4F0] space-y-1.5 shadow-2xs">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-[#25243A]">
                                        {comment.isAnonymous
                                          ? 'Anonymous Friend'
                                          : comment.author}
                                      </span>
                                      {comment.isAnonymous && (
                                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EDE7FA] text-[#8B70D6] border border-[#E8E4F0]">
                                          Anonymous
                                        </span>
                                      )}
                                      <span className="text-[#E8E4F0]">•</span>
                                      <span className="text-[11px] text-[#77758A]">
                                        {formatTimeAgo(comment.createdAt)}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyingTo((prev) => ({
                                            ...prev,
                                            [post.id]: comment.id,
                                          }));
                                        }}
                                        className="text-[11px] text-[#8B70D6] hover:text-[#7C3AED] flex items-center gap-1 font-medium"
                                      >
                                        <CornerDownRight className="w-3 h-3" />
                                        <span>Reply</span>
                                      </button>

                                      {/* Delete Icon on My Comments */}
                                      {comment.isOwner && (
                                        <button
                                          type="button"
                                          title="Delete your comment"
                                          onClick={() =>
                                            setDeleteTarget({
                                              type: 'comment',
                                              postId: post.id,
                                              commentId: comment.id,
                                            })
                                          }
                                          className="p-1 rounded-lg text-[#77758A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                          aria-label="Delete comment"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <p className="text-xs text-[#25243A]/90 leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                  </p>
                                </div>

                                {/* Nested Replies */}
                                {replies.length > 0 && (
                                  <div className="pl-6 space-y-2 border-l-2 border-[#E8E4F0] ml-3">
                                    {replies.map((reply) => (
                                      <div
                                        key={reply.id}
                                        className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] space-y-1"
                                      >
                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#25243A]">
                                              {reply.isAnonymous
                                                ? 'Anonymous Friend'
                                                : reply.author}
                                            </span>
                                            {reply.isAnonymous && (
                                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EDE7FA] text-[#8B70D6] border border-[#E8E4F0]">
                                                Anonymous
                                              </span>
                                            )}
                                            <span className="text-[#E8E4F0]">•</span>
                                            <span className="text-[11px] text-[#77758A]">
                                              {formatTimeAgo(reply.createdAt)}
                                            </span>
                                          </div>

                                          {/* Delete Icon on My Replies */}
                                          {reply.isOwner && (
                                            <button
                                              type="button"
                                              title="Delete your reply"
                                              onClick={() =>
                                                setDeleteTarget({
                                                  type: 'comment',
                                                  postId: post.id,
                                                  commentId: reply.id,
                                                })
                                              }
                                              className="p-1 rounded-lg text-[#77758A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                              aria-label="Delete reply"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        <p className="text-xs text-[#25243A]/90 leading-relaxed whitespace-pre-wrap">
                                          {reply.content}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25243A]/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E4F0] p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-none">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#25243A]">
                  {deleteTarget.type === 'post' ? 'Delete Post?' : 'Delete Comment?'}
                </h3>
                <p className="text-xs text-[#77758A] mt-0.5">
                  This will be permanently removed from the community feed.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#25243A]/85 leading-relaxed">
              {deleteTarget.type === 'post'
                ? 'Are you sure you want to delete this post? All thoughts and reactions will also be removed.'
                : 'Are you sure you want to delete this comment?'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4F0]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#77758A] hover:text-[#25243A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-40"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abusive Language Detection Friendly Warning Popup */}
      {abuseWarningModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25243A]/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E4F0] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDE7FA] border border-[#E8E4F0] flex items-center justify-center text-[#8B70D6] flex-none shadow-2xs">
                <Heart className="w-5 h-5 fill-[#8B70D6]/20 text-[#8B70D6]" />
              </div>
              <h3 className="text-base font-semibold text-[#25243A] tracking-tight">
                Let's keep Circles a safe space 💜
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-[13px] text-[#25243A]/85 leading-relaxed pt-1">
              <p>
                Some of the words in your message may be hurtful or abusive towards others. We want everyone to feel respected, supported and comfortable sharing here.
              </p>
              <p>
                Please review your wording and edit your message before posting.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E4F0]">
              <button
                type="button"
                onClick={() => setAbuseWarningModal({ isOpen: false, target: 'post' })}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#77758A] hover:text-[#25243A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setAbuseWarningModal({ isOpen: false, target: 'post' })}
                className="px-4 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#8B70D6] text-white text-xs font-semibold shadow-xs transition-colors active:scale-95"
              >
                Edit Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
