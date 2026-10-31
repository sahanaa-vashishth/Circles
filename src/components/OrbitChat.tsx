/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Phone, ShieldAlert, RotateCcw, Wind, X } from 'lucide-react';
import type { HelplineResource } from '../shared/constants/orbitResources.ts';
import { BoxBreathingModal } from './BoxBreathingModal.tsx';

export interface CrisisCard {
  heading: string;
  steps: string[];
  helplines: HelplineResource[];
}

export interface GuardianSession {
  active: boolean;
  highestLevel: 1 | 2 | 3;
  cardShown: boolean;
  safetyConfirmed: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'orbit';
  text: string;
  card?: CrisisCard | null;
}

export const OrbitChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'orbit',
      text: "Hello, I'm Orbit. I'm here to listen without judgment. How are you feeling today?",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [guardianSession, setGuardianSession] = useState<GuardianSession | null>(null);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirmNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'orbit',
        text: "Hello, I'm Orbit. I'm here to listen without judgment. How are you feeling today?",
      },
    ]);
    setInputText('');
    setErrorMessage(null);
    setGuardianSession(null);
    setShowNewChatModal(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, errorMessage]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    // Keep the last 6 messages as { role, text }
    const historyPayload = messages
      .filter((m) => m.role === 'user' || m.role === 'orbit')
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/orbit/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmed,
          history: historyPayload,
          session: guardianSession,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        const errorText =
          result.text ||
          result.data?.text ||
          result.error ||
          'I am having trouble responding right now. Please try again in a moment.';
        setErrorMessage(errorText);
      } else {
        // Update guardian session state from server
        if (result.data?.guardianSession) {
          setGuardianSession(result.data.guardianSession);
        }

        const replyText = result.data?.text || result.text;
        if (replyText) {
          const orbitMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'orbit',
            text: replyText,
            card: result.data?.card || null,
          };
          setMessages((prev) => [...prev, orbitMessage]);
        }
      }
    } catch (err) {
      console.error('[Orbit] Send message error:', err);
      setErrorMessage(
        'I am having trouble responding right now. Please try again in a moment.'
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#FAF9F6] text-[#25243A] font-sans selection:bg-[#EDE7FA] selection:text-[#25243A]">
      {/* Top Header */}
      <header className="flex-none px-6 py-4 border-b border-[#E8E4F0] bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A78BFA] via-[#C4B5FD] to-[#B8D8C8] shadow-sm shadow-[#A78BFA]/20">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#25243A] flex items-center gap-2">
                Orbit
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-[#EDE7FA] text-[#8B70D6] border border-[#E8E4F0]">
                  Mindful Companion
                </span>
              </h1>
              <p className="text-xs text-[#77758A]">
                A calm, warm, non-judgmental listener
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBreathingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#77758A] hover:text-[#8B70D6] bg-white hover:bg-[#EDE7FA]/60 border border-[#E8E4F0] transition-all shadow-xs"
              title="Box Breathing exercise"
              aria-label="Open box breathing exercise"
            >
              <Wind className="w-3.5 h-3.5 text-[#8B70D6]" />
              <span className="hidden sm:inline">Box Breathing</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#77758A] hover:text-[#25243A] bg-white hover:bg-[#EDE7FA]/60 border border-[#E8E4F0] transition-all shadow-xs"
              title="Start a new conversation"
              aria-label="Start a new conversation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#77758A]" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 ml-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => {
            const isOrbit = message.role === 'orbit';
            return (
              <div
                key={message.id}
                className={`flex gap-3 items-end ${
                  isOrbit ? 'justify-start' : 'justify-end'
                }`}
              >
                {isOrbit && (
                  <div className="flex-none w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A78BFA] to-[#8B70D6] flex items-center justify-center text-white shadow-xs ring-1 ring-white/30 mb-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] transition-all ${
                    isOrbit ? 'text-[#25243A]' : 'text-white'
                  }`}
                >
                  {/* Crisis Card rendered once above reply if present */}
                  {message.card && (
                    <div className="mb-3 p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-[#25243A] shadow-sm">
                      <div className="flex items-center gap-2 mb-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-700 flex-none" />
                        <h3 className="font-semibold text-sm tracking-tight text-[#25243A]">
                          {message.card.heading}
                        </h3>
                      </div>

                      {/* 3 Short Steps */}
                      <div className="mb-3.5 space-y-1.5 pl-1">
                        {message.card.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#25243A]/90">
                            <span className="flex-none font-bold text-amber-700">
                              {idx + 1}.
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>

                      {/* Helplines list with clickable tel: links */}
                      <div className="pt-2.5 border-t border-amber-200 space-y-2">
                        <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                          Free, Confidential Helplines
                        </p>
                        <div className="grid gap-2">
                          {message.card.helplines.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                            >
                              <div>
                                <p className="text-xs font-semibold text-[#25243A]">{item.name}</p>
                                <p className="text-[11px] text-[#77758A]">{item.description}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.numbers.map((num, nIdx) => (
                                  <a
                                    key={nIdx}
                                    href={`tel:${num}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EDE7FA] hover:bg-[#A78BFA] text-[#8B70D6] hover:text-white border border-[#E8E4F0] text-xs font-semibold tracking-wide transition-colors"
                                  >
                                    <Phone className="w-3 h-3 text-[#8B70D6]" />
                                    <span>
                                      {num === '+919999666555'
                                        ? '+91 9999 666 555'
                                        : num === '18005990019'
                                        ? '1800-599-0019'
                                        : num}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-xs ${
                      isOrbit
                        ? 'bg-white border border-[#E8E4F0] text-[#25243A] rounded-bl-sm'
                        : 'bg-[#8B70D6] text-white rounded-br-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-end justify-start animate-fade-in">
              <div className="flex-none w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A78BFA] to-[#8B70D6] flex items-center justify-center text-white shadow-xs ring-1 ring-white/30 mb-0.5">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-[#E8E4F0] text-[#77758A] text-sm flex items-center gap-2 shadow-xs">
                <span className="text-xs text-[#8B70D6] font-medium">Orbit is reflecting</span>
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-bounce" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Section */}
      <footer className="flex-none px-4 pb-6 pt-2 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent">
        <div className="max-w-3xl mx-auto">
          {/* Error Message Displayed Above Input */}
          {errorMessage && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-none text-rose-600" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-xs text-rose-700 hover:text-rose-900 underline font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="relative flex items-center bg-white border border-[#E8E4F0] rounded-2xl shadow-sm focus-within:border-[#A78BFA] focus-within:ring-2 focus-within:ring-[#EDE7FA] transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Share what's on your mind..."
              disabled={isLoading}
              className="flex-1 py-3.5 pl-4 pr-12 bg-transparent text-[#25243A] placeholder-[#77758A] text-sm focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="absolute right-2 p-2 rounded-xl bg-[#A78BFA] text-white hover:bg-[#8B70D6] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-center">
            <span className="text-[11px] text-[#77758A]">
              Orbit offers supportive conversation and does not provide medical advice or diagnoses.
            </span>
          </div>
        </div>
      </footer>

      {/* New Chat Confirmation Dialog */}
      {showNewChatModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25243A]/40 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-chat-dialog-title"
        >
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#E8E4F0] animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE7FA] text-[#8B70D6] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 rounded-xl text-[#77758A] hover:text-[#25243A] hover:bg-[#F3F0FA] transition-colors"
                aria-label="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 id="new-chat-dialog-title" className="text-base font-semibold text-[#25243A] mb-1.5">
              Start a new conversation?
            </h3>
            <p className="text-xs text-[#77758A] leading-relaxed mb-6">
              Your current conversation will be cleared. You can start fresh whenever you're ready.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E4F0] bg-white text-[#25243A] text-xs font-medium hover:bg-[#F3F0FA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmNewChat}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#A78BFA] text-white text-xs font-medium hover:bg-[#8B70D6] transition-colors shadow-xs"
              >
                Start New Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Box Breathing Modal */}
      <BoxBreathingModal
        isOpen={showBreathingModal}
        onClose={() => setShowBreathingModal(false)}
      />
    </div>
  );
};
