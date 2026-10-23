'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface InterviewTimerProps {
  durationSec: number;
  maxLimitSec?: number;
}

export function InterviewTimer({ durationSec, maxLimitSec = 180 }: InterviewTimerProps) {
  const remaining = Math.max(0, maxLimitSec - durationSec);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isCloseToLimit = remaining <= 30;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
        isCloseToLimit
          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>Time: {formatted}</span>
      {maxLimitSec && (
        <span className="text-slate-400 font-normal">/ {Math.floor(maxLimitSec / 60)}m</span>
      )}
    </div>
  );
}
