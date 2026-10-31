/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, X, RotateCcw, CheckCircle2 } from 'lucide-react';

interface BoxBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_DETAILS: Record<
  BreathingPhase,
  { label: string; instruction: string; nextPhase: BreathingPhase; isExpanded: boolean }
> = {
  inhale: {
    label: 'Inhale',
    instruction: 'Breathe in slowly and deeply through your nose...',
    nextPhase: 'hold1',
    isExpanded: true,
  },
  hold1: {
    label: 'Hold',
    instruction: 'Gently hold your breath, keeping your shoulders relaxed...',
    nextPhase: 'exhale',
    isExpanded: true,
  },
  exhale: {
    label: 'Exhale',
    instruction: 'Slowly release your breath through your mouth...',
    nextPhase: 'hold2',
    isExpanded: false,
  },
  hold2: {
    label: 'Hold',
    instruction: 'Pause in stillness before the next gentle breath...',
    nextPhase: 'inhale',
    isExpanded: false,
  },
};

export const BoxBreathingModal: React.FC<BoxBreathingModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // Interval reference for clean timer management
  const intervalRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset all breathing states
  const resetExercise = () => {
    clearTimer();
    setStatus('idle');
    setPhase('inhale');
    setSecondsRemaining(4);
    setCompletedCycles(0);
  };

  // Handle modal closing with cleanup
  const handleClose = () => {
    resetExercise();
    onClose();
  };

  // Timer loop when running
  useEffect(() => {
    if (!isOpen) {
      resetExercise();
      return;
    }

    if (status === 'running') {
      intervalRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev > 1) {
            return prev - 1;
          }

          // Phase transition
          setPhase((currentPhase) => {
            const next = PHASE_DETAILS[currentPhase].nextPhase;
            if (currentPhase === 'hold2') {
              // Completed one full 4-phase box cycle
              setCompletedCycles((c) => c + 1);
            }
            return next;
          });
          return 4;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return () => {
      clearTimer();
    };
  }, [status, isOpen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  if (!isOpen) return null;

  const currentPhaseInfo = PHASE_DETAILS[phase];

  const handleStart = () => {
    setPhase('inhale');
    setSecondsRemaining(4);
    setStatus('running');
  };

  const handleTogglePause = () => {
    if (status === 'running') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('running');
    }
  };

  const handleEndExercise = () => {
    clearTimer();
    setStatus('completed');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25243A]/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="breathing-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#E8E4F0] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E8E4F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EDE7FA] text-[#8B70D6] flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h2 id="breathing-modal-title" className="text-base font-semibold text-[#25243A]">
                Box Breathing
              </h2>
              <p className="text-xs text-[#77758A]">4-4-4-4 mindful rhythm</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-[#77758A] hover:text-[#25243A] hover:bg-[#F3F0FA] transition-colors"
            aria-label="Close box breathing exercise"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[380px]">
          {status === 'completed' ? (
            /* Completed Screen */
            <div className="flex flex-col items-center text-center max-w-sm py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-[#B8D8C8]/30 text-emerald-800 flex items-center justify-center mb-5 ring-8 ring-[#B8D8C8]/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#25243A] mb-2">
                Well done. Take your time before continuing.
              </h3>
              <p className="text-sm text-[#77758A] mb-6 leading-relaxed">
                You completed {completedCycles} {completedCycles === 1 ? 'cycle' : 'cycles'} of box breathing. Notice how your body and mind feel right now.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={resetExercise}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E4F0] bg-white text-[#25243A] text-sm font-medium hover:bg-[#F3F0FA] transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-[#77758A]" />
                  <span>Breathe Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#A78BFA] text-white text-sm font-medium hover:bg-[#8B70D6] transition-colors shadow-xs"
                >
                  Return to Chat
                </button>
              </div>
            </div>
          ) : status === 'idle' ? (
            /* Initial / Idle Screen */
            <div className="flex flex-col items-center text-center max-w-sm py-4">
              {/* Visual preview shape */}
              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-3xl bg-[#EDE7FA]/60 border border-[#A78BFA]/20 animate-pulse" />
                <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#A78BFA]/30 to-[#B8D8C8]/30 backdrop-blur-xs flex items-center justify-center border border-[#A78BFA]/30 shadow-inner">
                  <Wind className="w-10 h-10 text-[#8B70D6]" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#25243A] mb-2">
                Take a moment for yourself. Let's breathe together.
              </h3>
              <p className="text-xs text-[#77758A] mb-6 leading-relaxed">
                Box breathing is a gentle technique to regulate your nervous system. Inhale for 4s, hold for 4s, exhale for 4s, and hold for 4s.
              </p>

              <button
                type="button"
                onClick={handleStart}
                className="w-full max-w-xs py-3 px-6 rounded-2xl bg-[#A78BFA] text-white text-sm font-medium hover:bg-[#8B70D6] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#A78BFA]/25"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Exercise</span>
              </button>
            </div>
          ) : (
            /* Running / Paused State */
            <div className="flex flex-col items-center text-center w-full max-w-sm py-2">
              {/* Cycle indicator */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs px-3 py-1 rounded-full bg-[#EDE7FA] text-[#8B70D6] font-medium border border-[#E8E4F0]">
                  Cycle {completedCycles + 1}
                </span>
                {status === 'paused' && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">
                    Paused
                  </span>
                )}
              </div>

              {/* Expanding & Contracting Animated Box / Circle */}
              <div className="relative w-52 h-52 flex items-center justify-center mb-6">
                {/* Outer gentle glow rings */}
                <div
                  className={`absolute inset-0 rounded-3xl transition-all duration-1000 ease-in-out ${
                    currentPhaseInfo.isExpanded
                      ? 'scale-100 bg-[#EDE7FA]/50 border border-[#A78BFA]/30'
                      : 'scale-75 bg-[#EDE7FA]/20 border border-transparent'
                  }`}
                />
                <div
                  className={`absolute inset-4 rounded-3xl transition-all duration-1000 ease-in-out ${
                    currentPhaseInfo.isExpanded
                      ? 'scale-100 bg-[#B8D8C8]/25'
                      : 'scale-80 bg-[#B8D8C8]/10'
                  }`}
                />

                {/* Main animated pulsing center */}
                <div
                  className={`relative w-36 h-36 rounded-2xl flex flex-col items-center justify-center transition-all duration-1000 ease-in-out shadow-sm ${
                    currentPhaseInfo.isExpanded
                      ? 'scale-105 bg-gradient-to-tr from-[#A78BFA] to-[#C4B5FD] text-white shadow-md shadow-[#A78BFA]/30 ring-4 ring-[#EDE7FA]'
                      : 'scale-85 bg-gradient-to-tr from-[#F3F0FA] to-[#EDE7FA] text-[#25243A] border border-[#E8E4F0]'
                  }`}
                >
                  <span
                    className={`text-3xl font-bold tracking-tight mb-0.5 ${
                      currentPhaseInfo.isExpanded ? 'text-white' : 'text-[#8B70D6]'
                    }`}
                  >
                    {secondsRemaining}s
                  </span>
                  <span
                    className={`text-xs uppercase font-semibold tracking-wider ${
                      currentPhaseInfo.isExpanded ? 'text-white/90' : 'text-[#77758A]'
                    }`}
                  >
                    {currentPhaseInfo.label}
                  </span>
                </div>
              </div>

              {/* Instructions text */}
              <p className="text-sm font-medium text-[#25243A] mb-1 min-h-[20px]">
                {currentPhaseInfo.label}
              </p>
              <p className="text-xs text-[#77758A] mb-6 max-w-xs leading-relaxed min-h-[32px]">
                {currentPhaseInfo.instruction}
              </p>

              {/* Exercise Controls */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E4F0] bg-white text-[#25243A] text-sm font-medium hover:bg-[#F3F0FA] active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {status === 'running' ? (
                    <>
                      <Pause className="w-4 h-4 text-[#77758A]" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-[#8B70D6] text-[#8B70D6]" />
                      <span>Resume</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleEndExercise}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#F3F0FA] text-[#25243A] text-sm font-medium hover:bg-[#EDE7FA] hover:text-[#8B70D6] active:scale-98 transition-all"
                >
                  End Exercise
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
