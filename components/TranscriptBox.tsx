'use client';

import React, { useState } from 'react';
import { Type, Mic, Send, AlertCircle } from 'lucide-react';
import { countWords, wordsPerMinute, countFillers, highlightFillersInText } from '../lib/metrics';

interface TranscriptBoxProps {
  transcript: string;
  interimText: string;
  isListening: boolean;
  durationSec: number;
  onSubmitTypedAnswer: (text: string) => void;
  isEvaluating: boolean;
}

export function TranscriptBox({
  transcript,
  interimText,
  isListening,
  durationSec,
  onSubmitTypedAnswer,
  isEvaluating,
}: TranscriptBoxProps) {
  const [typedMode, setTypedMode] = useState(false);
  const [manualText, setManualText] = useState('');

  const wordCount = countWords(transcript);
  const wpm = wordsPerMinute(transcript, durationSec);
  const { total: fillers } = countFillers(transcript);
  const segments = highlightFillersInText(transcript);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim() && !isEvaluating) {
      onSubmitTypedAnswer(manualText.trim());
      setManualText('');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Box Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Live Speech Transcript
          </span>
          {isListening && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Recording Voice
            </span>
          )}
        </div>

        {/* Live Audio Metrics Pill */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Words: <strong className="text-slate-900 dark:text-white">{wordCount}</strong>
          </div>
          <div>
            Pace: <strong className={`font-semibold ${wpm >= 110 && wpm <= 170 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{wpm} WPM</strong>
          </div>
          <div>
            Fillers: <strong className={fillers > 2 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}>{fillers}</strong>
          </div>
          <button
            type="button"
            onClick={() => setTypedMode(!typedMode)}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700"
          >
            {typedMode ? <Mic className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
            {typedMode ? 'Use Voice' : 'Type Answer'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {typedMode ? (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isEvaluating}
            placeholder="Type your answer here if your microphone is unavailable or you prefer keyboard input..."
            rows={4}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!manualText.trim() || isEvaluating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit Typed Answer
            </button>
          </div>
        </form>
      ) : (
        <div className="min-h-[90px] max-h-[160px] overflow-y-auto p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
          {transcript || interimText ? (
            <div>
              {segments.map((seg, idx) =>
                seg.isFiller ? (
                  <span
                    key={idx}
                    title="Filler word detected"
                    className="bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 px-1 py-0.5 rounded font-medium mx-0.5"
                  >
                    {seg.text}
                  </span>
                ) : (
                  <span key={idx}>{seg.text}</span>
                )
              )}
              {interimText && (
                <span className="text-slate-400 dark:text-slate-500 italic ml-1">
                  {interimText}
                </span>
              )}
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 italic flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Your spoken answer will appear here in real time as you speak...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
