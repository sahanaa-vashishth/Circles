/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  ArrowRight,
  Sun,
  Smile,
  Meh,
  CloudRain,
  Heart,
  Quote,
  MessageCircle,
  Compass,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'home' | 'orbit' | 'community' | 'profile') => void;
}

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  icon: React.ReactNode;
  affirmation: string;
}

const MOODS: MoodOption[] = [
  {
    id: 'great',
    label: 'Great',
    emoji: '😊',
    icon: <Sun className="w-5 h-5 text-amber-500" />,
    affirmation: 'Wonderful to hear. May this gentle energy stay with you through your day.',
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '😌',
    icon: <Smile className="w-5 h-5 text-emerald-500" />,
    affirmation: 'A peaceful mind is a gift. Notice and savor these quiet moments.',
  },
  {
    id: 'okay',
    label: 'Okay',
    emoji: '😐',
    icon: <Meh className="w-5 h-5 text-slate-500" />,
    affirmation: 'Being okay is more than enough. Move at whatever pace feels comfortable today.',
  },
  {
    id: 'stressed',
    label: 'Stressed',
    emoji: '😰',
    icon: <CloudRain className="w-5 h-5 text-[#8B70D6]" />,
    affirmation: 'It takes courage to acknowledge stress. Remember to pause and take a slow, deep breath.',
  },
  {
    id: 'down',
    label: 'Down',
    emoji: '😔',
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    affirmation: 'Whatever you are feeling is valid. You do not have to carry everything alone.',
  },
];

interface CommunityPostPreview {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  timeAgo: string;
}

const SAMPLE_POSTS: CommunityPostPreview[] = [
  {
    id: '1',
    category: 'Exam Support',
    title: 'Taking pauses when the mind feels full',
    excerpt: 'I used to feel guilty for stepping away from my notes. Today I realized my thoughts settle much better when I give myself permission to breathe.',
    author: 'Priya S.',
    timeAgo: '2h ago',
  },
  {
    id: '2',
    category: 'Mindful Moments',
    title: 'Evening tea without any screens',
    excerpt: 'Sat by the window with warm chamomile and just watched the dusk settle in. The simplest grounding ritual after a chaotic week.',
    author: 'Arun K.',
    timeAgo: '5h ago',
  },
  {
    id: '3',
    category: 'Daily Wins',
    title: 'Reached out to a friend after weeks of isolation',
    excerpt: 'My self-doubt kept insisting they were too busy, but we ended up laughing for an hour. Sometimes the hardest part is just pressing send.',
    author: 'Maya R.',
    timeAgo: 'Yesterday',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

  const selectedMood = MOODS.find((m) => m.id === selectedMoodId);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 selection:bg-[#EDE7FA] selection:text-[#25243A]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 1. Welcome Section */}
        <section className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#EDE7FA] text-[#8B70D6] border border-[#E8E4F0]">
            <Compass className="w-3.5 h-3.5 text-[#8B70D6]" />
            <span>Circles Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#25243A]">
            Welcome back, friend
          </h1>
          <p className="text-[#77758A] text-sm sm:text-base max-w-2xl leading-relaxed">
            Take a gentle breath. This is your safe, quiet corner to pause, reflect on how you feel, and connect with caring support.
          </p>
        </section>

        {/* 2. Daily Mood Check-in */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E4F0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-base font-semibold text-[#25243A]">
                How are you feeling today?
              </h2>
              <p className="text-xs text-[#77758A]">
                A simple check-in with yourself. There are no right or wrong answers.
              </p>
            </div>
            {selectedMood && (
              <span className="text-xs text-[#8B70D6] font-medium self-start sm:self-auto bg-[#EDE7FA] px-2.5 py-0.5 rounded-full border border-[#E8E4F0]">
                Selected: {selectedMood.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            {MOODS.map((mood) => {
              const isSelected = selectedMoodId === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMoodId(mood.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#EDE7FA] border-2 border-[#A78BFA] text-[#25243A] shadow-xs'
                      : 'bg-[#FAF9F6] border-[#E8E4F0] text-[#25243A] hover:border-[#D8D2E7] hover:bg-[#F3F0FA]'
                  }`}
                >
                  <span className="text-2xl mb-1.5" role="img" aria-label={mood.label}>
                    {mood.emoji}
                  </span>
                  <span className="text-xs font-medium tracking-wide">
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <div className="p-3.5 rounded-xl bg-[#F3F0FA] border border-[#E8E4F0] text-xs text-[#25243A] flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#A78BFA] flex-none" />
                <p className="leading-relaxed">{selectedMood.affirmation}</p>
              </div>
              {(selectedMood.id === 'stressed' || selectedMood.id === 'down') && (
                <button
                  type="button"
                  onClick={() => onNavigate('orbit')}
                  className="flex-none text-[#8B70D6] hover:text-[#7C3AED] font-medium underline inline-flex items-center gap-1"
                >
                  <span>Talk with Orbit</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* 3. Quick Actions */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#77758A]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card: Talk to Orbit */}
            <div
              onClick={() => onNavigate('orbit')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onNavigate('orbit');
              }}
              className="group p-5 rounded-2xl bg-white border border-[#E8E4F0] hover:border-[#A78BFA]/50 hover:bg-[#FAF9F6]/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#A78BFA] via-[#C4B5FD] to-[#B8D8C8] flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Online 24/7
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#25243A] group-hover:text-[#8B70D6] transition-colors">
                    Talk to Orbit
                  </h3>
                  <p className="text-xs text-[#77758A] mt-1 leading-relaxed">
                    A calm, warm, non-judgmental space to share whatever is on your mind.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B70D6] group-hover:text-[#7C3AED] transition-colors pt-2 border-t border-[#E8E4F0]">
                <span>Start conversation</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card: Visit Community */}
            <div
              onClick={() => onNavigate('community')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onNavigate('community');
              }}
              className="group p-5 rounded-2xl bg-white border border-[#E8E4F0] hover:border-[#A78BFA]/50 hover:bg-[#FAF9F6]/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE7FA] border border-[#E8E4F0] flex items-center justify-center text-[#8B70D6] shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EDE7FA] text-[#8B70D6] border border-[#E8E4F0]">
                    Peer Circles
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#25243A] group-hover:text-[#8B70D6] transition-colors">
                    Visit Community
                  </h3>
                  <p className="text-xs text-[#77758A] mt-1 leading-relaxed">
                    Connect with supportive peer circles, share daily reflections, and read shared experiences.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B70D6] group-hover:text-[#7C3AED] transition-colors pt-2 border-t border-[#E8E4F0]">
                <span>Explore circles</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Community Preview */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E4F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#25243A]">
                From the Community
              </h2>
              <p className="text-xs text-[#77758A]">
                Gentle insights and thoughts shared by fellow members
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('community')}
              className="text-xs font-medium text-[#8B70D6] hover:text-[#7C3AED] inline-flex items-center gap-1 transition-colors"
            >
              <span>View full Community</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_POSTS.map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigate('community')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onNavigate('community');
                }}
                className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E4F0] hover:border-[#D8D2E7] hover:bg-[#F3F0FA] transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-[#EDE7FA] text-[#8B70D6] font-medium border border-[#E8E4F0]">
                      {post.category}
                    </span>
                    <span className="text-[#77758A]">{post.timeAgo}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#25243A] line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-[#77758A] leading-relaxed line-clamp-3">
                    "{post.excerpt}"
                  </p>
                </div>
                <div className="text-[11px] text-[#77758A] pt-2 border-t border-[#E8E4F0] flex items-center justify-between">
                  <span>{post.author}</span>
                  <span className="text-[#8B70D6] font-medium flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> Read
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Daily Reflection */}
        <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#F3F0FA] via-white to-[#EDE7FA]/60 border border-[#E8E4F0] shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex-none w-9 h-9 rounded-xl bg-[#EDE7FA] border border-[#E8E4F0] flex items-center justify-center text-[#8B70D6] mt-0.5 shadow-xs">
              <Quote className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#8B70D6]">
                  Thought for Today
                </span>
                <span className="text-[#E8E4F0]">•</span>
                <span className="text-[11px] text-[#77758A]">Daily Reflection</span>
              </div>
              <h3 className="text-sm sm:text-base font-medium text-[#25243A] leading-relaxed italic">
                "What is one kind, forgiving sentence you can offer yourself today that you would easily say to a dear friend?"
              </h3>
              <p className="text-xs text-[#77758A] leading-relaxed pt-1">
                You don't need to resolve everything all at once. Just this present moment, and one gentle breath at a time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
