'use client';

import React from 'react';
import { Award, Zap, BookOpen } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  category: 'quality' | 'confidence' | 'english';
  tip?: string;
  subMetrics?: { label: string; value: string | number }[];
}

export function ScoreCard({
  title,
  score,
  maxScore = 10,
  category,
  tip,
  subMetrics,
}: ScoreCardProps) {
  const percentage = Math.min(100, Math.round((score / maxScore) * 100));

  let icon = Award;
  let colorTheme = {
    bg: 'from-blue-500/10 to-indigo-500/5',
    border: 'border-blue-200 dark:border-blue-900',
    bar: 'bg-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
  };

  if (category === 'confidence') {
    icon = Zap;
    colorTheme = {
      bg: 'from-amber-500/10 to-orange-500/5',
      border: 'border-amber-200 dark:border-amber-900',
      bar: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
    };
  } else if (category === 'english') {
    icon = BookOpen;
    colorTheme = {
      bg: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-200 dark:border-emerald-900',
      bar: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
    };
  }

  const IconComponent = icon;

  return (
    <div
      className={`rounded-2xl border ${colorTheme.border} bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${colorTheme.text}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            {title}
          </h3>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {score}
          </span>
          <span className="text-xs text-slate-400 font-medium">/{maxScore}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden my-3">
        <div
          className={`h-full rounded-full ${colorTheme.bar} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Tip or Submetrics */}
      {tip && (
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {tip}
        </p>
      )}

      {subMetrics && subMetrics.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subMetrics.map((m, idx) => (
            <div key={idx} className="text-left">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">
                {m.label}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
