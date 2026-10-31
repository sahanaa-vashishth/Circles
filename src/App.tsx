/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home, Sparkles, Users, User, Phone } from 'lucide-react';
import { HomePage } from './components/HomePage.tsx';
import { OrbitChat } from './components/OrbitChat.tsx';
import { CommunityPage } from './components/CommunityPage.tsx';
import { ProfilePage } from './components/ProfilePage.tsx';

type TabType = 'home' | 'orbit' | 'community' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  return (
    <div className="flex h-screen w-screen bg-[#FAF9F6] text-[#25243A] font-sans selection:bg-[#EDE7FA] selection:text-[#25243A] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#E8E4F0] bg-[#F3F0FA]/80 backdrop-blur-md flex-none">
        {/* Brand */}
        <div className="p-6 border-b border-[#E8E4F0] flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A78BFA] via-[#C4B5FD] to-[#B8D8C8] shadow-sm shadow-[#A78BFA]/20 flex-none">
            <Sparkles className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-[#25243A] flex items-center gap-1.5">
              Circles
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EDE7FA] text-[#8B70D6] border border-[#E8E4F0] font-medium">
                Care
              </span>
            </h1>
            <p className="text-xs text-[#77758A]">Mindful Wellbeing</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-white text-[#25243A] border border-[#E8E4F0] shadow-sm'
                : 'text-[#77758A] hover:text-[#25243A] hover:bg-white/60'
            }`}
          >
            <Home className={`w-4 h-4 flex-none ${activeTab === 'home' ? 'text-[#8B70D6]' : 'text-[#77758A]'}`} />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orbit')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'orbit'
                ? 'bg-white text-[#25243A] border border-[#E8E4F0] shadow-sm'
                : 'text-[#77758A] hover:text-[#25243A] hover:bg-white/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className={`w-4 h-4 flex-none ${activeTab === 'orbit' ? 'text-[#8B70D6]' : 'text-[#77758A]'}`} />
              <span>Orbit Chat</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'community'
                ? 'bg-white text-[#25243A] border border-[#E8E4F0] shadow-sm'
                : 'text-[#77758A] hover:text-[#25243A] hover:bg-white/60'
            }`}
          >
            <Users className={`w-4 h-4 flex-none ${activeTab === 'community' ? 'text-[#8B70D6]' : 'text-[#77758A]'}`} />
            <span>Community</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-[#25243A] border border-[#E8E4F0] shadow-sm'
                : 'text-[#77758A] hover:text-[#25243A] hover:bg-white/60'
            }`}
          >
            <User className={`w-4 h-4 flex-none ${activeTab === 'profile' ? 'text-[#8B70D6]' : 'text-[#77758A]'}`} />
            <span>My Profile</span>
          </button>
        </nav>

        {/* Bottom Support Info */}
        <div className="p-4 border-t border-[#E8E4F0]">
          <div className="p-3 rounded-xl bg-white border border-[#E8E4F0] shadow-xs space-y-1">
            <p className="text-[11px] font-medium text-[#25243A] flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#8B70D6]" />
              <span>Tele-MANAS: 14416</span>
            </p>
            <p className="text-[10px] text-[#77758A]">
              Free 24/7 national mental health helpline
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden bg-[#FAF9F6]">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[#E8E4F0] bg-white/80 backdrop-blur-md flex-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A78BFA] via-[#C4B5FD] to-[#B8D8C8] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#25243A]">Circles</span>
              <span className="text-[10px] text-[#77758A] ml-1.5">Sanctuary</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Safe Space
          </span>
        </header>

        {/* Views (preserving Orbit state when switching tabs) */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <div
            className={`flex flex-col flex-1 h-full overflow-hidden ${
              activeTab === 'home' ? 'flex' : 'hidden'
            }`}
          >
            <HomePage onNavigate={setActiveTab} />
          </div>

          <div
            className={`flex flex-col flex-1 h-full overflow-hidden ${
              activeTab === 'orbit' ? 'flex' : 'hidden'
            }`}
          >
            <OrbitChat />
          </div>

          <div
            className={`flex flex-col flex-1 h-full overflow-hidden ${
              activeTab === 'community' ? 'flex' : 'hidden'
            }`}
          >
            <CommunityPage onNavigate={setActiveTab} />
          </div>

          <div
            className={`flex flex-col flex-1 h-full overflow-hidden ${
              activeTab === 'profile' ? 'flex' : 'hidden'
            }`}
          >
            <ProfilePage onNavigate={setActiveTab} />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="flex md:hidden items-center justify-around py-2.5 px-2 border-t border-[#E8E4F0] bg-white/95 backdrop-blur-md flex-none">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'home'
                ? 'text-[#8B70D6] font-semibold'
                : 'text-[#77758A] hover:text-[#25243A]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orbit')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors relative ${
              activeTab === 'orbit'
                ? 'text-[#8B70D6] font-semibold'
                : 'text-[#77758A] hover:text-[#25243A]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Orbit</span>
            <span className="absolute top-1 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'community'
                ? 'text-[#8B70D6] font-semibold'
                : 'text-[#77758A] hover:text-[#25243A]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Community</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-[#8B70D6] font-semibold'
                : 'text-[#77758A] hover:text-[#25243A]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
