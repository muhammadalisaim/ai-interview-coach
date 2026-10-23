'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Star, Sparkles, MessageCircle } from 'lucide-react';
import { Question, AnswerRecord } from '../types';
import { highlightFillersInText } from '../lib/metrics';

interface FeedbackSectionProps {
  answers: {
    question: Question;
    answer: AnswerRecord;
  }[];
  showRomanUrdu?: boolean;
}

export function FeedbackSection({ answers, showRomanUrdu = true }: FeedbackSectionProps) {
  if (!answers || answers.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No answers recorded for this session.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {answers.map((item, idx) => {
        const { question, answer } = item;
        const evalData = answer.evaluation;
        const segments = highlightFillersInText(answer.transcript);

        return (
          <div
            key={answer.id || idx}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5"
          >
            {/* Header: Question + Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Question {idx + 1}
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {question.text}
                </h4>
              </div>

              {/* Score Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  Quality: {evalData.answer_quality?.score ?? '-'}/10
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  Tone: {evalData.tone_score ?? '-'}/10
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  English: {evalData.english?.score ?? '-'}/10
                </span>
                {evalData.answer_quality?.used_star && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-purple-500" />
                    STAR Used
                  </span>
                )}
              </div>
            </div>

            {/* Candidate Spoken Transcript with Highlighted Fillers */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  What You Spoke (Verbatim Transcript):
                </span>
                <span className="text-xs text-slate-400">
                  {answer.wpm} WPM • {answer.fillerCount} fillers ({answer.durationSec}s)
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {segments.map((seg, sIdx) =>
                  seg.isFiller ? (
                    <span
                      key={sIdx}
                      title="Filler word"
                      className="bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 px-1 py-0.5 rounded font-medium mx-0.5"
                    >
                      {seg.text}
                    </span>
                  ) : (
                    <span key={sIdx}>{seg.text}</span>
                  )
                )}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What Went Well
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {evalData.answer_quality?.strengths?.map((str, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Areas to Polish
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {evalData.answer_quality?.improvements?.map((imp, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* English Grammar Corrections */}
            {evalData.english?.mistakes && evalData.english.mistakes.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                  English Corrections (Said ❌ vs Better ✅)
                </span>
                <div className="space-y-2">
                  {evalData.english.mistakes.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex items-center gap-2 text-xs flex-wrap bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800"
                    >
                      <span className="line-through text-rose-500 font-medium">
                        "{m.said}"
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        "{m.better}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Model Sample Better Answer */}
            {evalData.better_answer && (
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Model Recommended Answer
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  "{evalData.better_answer}"
                </p>
              </div>
            )}

            {/* Optional Roman Urdu Tip */}
            {showRomanUrdu && evalData.roman_urdu_tip && (
              <div className="p-3.5 rounded-xl bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60 text-xs text-violet-900 dark:text-violet-200 flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Coach Note (Roman Urdu): </span>
                  <span>{evalData.roman_urdu_tip}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
