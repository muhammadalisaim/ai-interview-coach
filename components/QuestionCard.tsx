'use client';

import React from 'react';
import { Volume2, Sparkles, MessageSquareQuote } from 'lucide-react';

interface QuestionCardProps {
  questionText: string;
  questionNumber: number;
  totalQuestions: number;
  role: string;
  isFollowUp?: boolean;
  isSpeaking?: boolean;
  onPlayAudio?: () => void;
}

export function QuestionCard({
  questionText,
  questionNumber,
  totalQuestions,
  role,
  isFollowUp = false,
  isSpeaking = false,
  onPlayAudio,
}: QuestionCardProps) {
  return (
    <div
      className={`relative w-full rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-sm border ${
        isSpeaking
          ? 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white dark:to-slate-900 border-indigo-500/40 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
            Question {questionNumber} of {totalQuestions}
          </span>
          {isFollowUp && (
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Follow-up Question
            </span>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
            Role: {role}
          </span>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-2">
          {onPlayAudio && (
            <button
              type="button"
              onClick={onPlayAudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors shadow-sm"
              title="Play question aloud through laptop speakers"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isSpeaking ? 'Replay Voice' : 'Listen Aloud'}</span>
            </button>
          )}

          {isSpeaking && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium animate-pulse">
              <span>Playing</span>
              <div className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-3 bg-white rounded-full animate-wave-bar" />
                <span className="w-1 h-4 bg-white rounded-full animate-wave-bar [animation-delay:0.2s]" />
                <span className="w-1 h-2 bg-white rounded-full animate-wave-bar [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Question Text */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="mt-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0">
          <MessageSquareQuote className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed tracking-tight">
            {questionText}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Speak clearly into your microphone using the STAR framework when relevant.
          </p>
        </div>
      </div>
    </div>
  );
}
