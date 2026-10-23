'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, Volume2, ArrowRight } from 'lucide-react';
import { InterviewStatus } from '../types';

interface MicButtonProps {
  status: InterviewStatus;
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
  audioLevel?: number;
}

export function MicButton({
  status,
  isListening,
  onToggle,
  disabled = false,
  audioLevel = 0,
}: MicButtonProps) {
  let label = 'Tap to Start Speaking';
  let subLabel = 'Click when ready to record your answer';

  if (status === 'asking') {
    label = 'AI Interviewer is Speaking...';
    subLabel = 'Tap here to skip audio & speak now';
  } else if (status === 'listening' && isListening) {
    label = 'Listening to your Answer...';
    subLabel = 'Tap button when finished to submit';
  } else if (status === 'listening' && !isListening) {
    label = 'Microphone Ready';
    subLabel = 'Tap to speak your answer';
  } else if (status === 'evaluating') {
    label = 'Evaluating your answer...';
    subLabel = 'Scoring content, pace & grammar';
  } else if (status === 'finished') {
    label = 'Interview Finished!';
    subLabel = 'View your report below';
  }

  const isMicActive = status === 'listening' && isListening;
  const isAsking = status === 'asking';
  const isEvaluating = status === 'evaluating';

  return (
    <div className="flex flex-col items-center justify-center gap-3 select-none">
      {/* Central Pulsing Button */}
      <div className="relative flex items-center justify-center">
        {/* Animated Radial Waves when listening */}
        <AnimatePresence>
          {isMicActive && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: [1, 1.4, 1.6], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-emerald-500/30 -z-10"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.4 }}
                animate={{ scale: [1, 1.25, 1.45], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-indigo-500/25 -z-10"
              />
            </>
          )}

          {isAsking && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: [1, 1.2, 1.3], opacity: [0.5, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-indigo-500/30 -z-10"
            />
          )}
        </AnimatePresence>

        {/* The Main Round Button */}
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled || isEvaluating}
          title={isAsking ? 'Click to skip audio and answer now' : label}
          aria-label={label}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
            isMicActive
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30 scale-105 ring-4 ring-emerald-400/50'
              : isAsking
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 ring-4 ring-indigo-400/30 hover:scale-105 animate-pulse'
              : isEvaluating
              ? 'bg-indigo-800 text-white shadow-indigo-600/30 cursor-wait'
              : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/30 hover:scale-105'
          }`}
        >
          {isEvaluating ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isAsking ? (
            <div className="flex flex-col items-center">
              <Volume2 className="w-8 h-8 animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-90">Skip</span>
            </div>
          ) : isMicActive ? (
            <Mic className="w-10 h-10 animate-bounce" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      {/* Status Label & Sublabel */}
      <div className="text-center space-y-0.5">
        <p className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
          {isMicActive && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          )}
          {label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {subLabel}
        </p>
      </div>
    </div>
  );
}
