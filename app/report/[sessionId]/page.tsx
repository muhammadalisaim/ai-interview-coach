'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScoreCard } from '@/components/ScoreCard';
import { FeedbackSection } from '@/components/FeedbackSection';
import { InterviewSession, SessionReport } from '@/types';
import { getScoreVerdict } from '@/lib/scoring';
import {
  Sparkles,
  RotateCcw,
  Home,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  Download,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SessionReportPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const router = useRouter();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/sessions?id=${sessionId}`);
        if (!res.ok) throw new Error('Session not found');
        const data = await res.json();
        setSession(data.session);
      } catch (err: any) {
        console.error('Failed to load report:', err);
        toast.error('Could not load report details.');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Loading comprehensive interview report...
        </p>
      </div>
    );
  }

  if (!session || !session.report) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Report Not Ready Yet
        </h2>
        <p className="text-sm text-slate-500">
          This session either has not completed or no answers were submitted.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const report: SessionReport = session.report;
  const verdict = getScoreVerdict(report.overallScore);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* 1. Top Header Banner & Overall Score Ring */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Mock Interview Results
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {session.role}
            </h1>
            <p className="text-sm text-slate-500 capitalize">
              {session.level} Level • {report.answers.length} Questions Evaluated •{' '}
              {new Date(session.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg pt-1">
              {verdict.description}
            </p>
          </div>

          {/* Animated Circular Score Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={
                    report.overallScore >= 85
                      ? 'stroke-emerald-500'
                      : report.overallScore >= 70
                      ? 'stroke-indigo-600'
                      : report.overallScore >= 50
                      ? 'stroke-amber-500'
                      : 'stroke-rose-500'
                  }
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * report.overallScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {report.overallScore}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Overall / 100
                </span>
              </div>
            </div>

            <span
              className={`mt-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                report.overallScore >= 85
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : report.overallScore >= 70
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                  : report.overallScore >= 50
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
              }`}
            >
              {verdict.label}
            </span>
          </div>
        </div>

        {/* Share / Export Action row */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Report
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/interview/setup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start Another Mock
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Three Detailed Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          title="Answer Quality"
          score={report.qualityScore}
          maxScore={10}
          category="quality"
          tip="Based on technical relevance, depth of knowledge, and STAR behavioral framework."
          subMetrics={[
            { label: 'Weight', value: '40%' },
            { label: 'Target', value: '8.0+' },
          ]}
        />
        <ScoreCard
          title="Speaking Confidence"
          score={report.confidenceScore}
          maxScore={10}
          category="confidence"
          tip="Calculated from your speaking pace (WPM), hesitation fillers, and decisive tone."
          subMetrics={[
            { label: 'Weight', value: '30%' },
            { label: 'Optimal Pace', value: '110-170 WPM' },
          ]}
        />
        <ScoreCard
          title="English Fluency"
          score={report.englishScore}
          maxScore={10}
          category="english"
          tip="Evaluates grammar precision, sentence clarity, and professional vocabulary."
          subMetrics={[
            { label: 'Weight', value: '30%' },
            { label: 'Grammar', value: 'Polished' },
          ]}
        />
      </div>

      {/* 3. Strengths & Improvements Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 sm:p-7 shadow-sm">
          <h3 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Top 3 Strengths Observed
          </h3>
          <ul className="space-y-3">
            {report.topStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  {idx + 1}
                </span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-6 sm:p-7 shadow-sm">
          <h3 className="font-extrabold text-base text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Top 3 High-Impact Improvements
          </h3>
          <ul className="space-y-3">
            {report.topImprovements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  {idx + 1}
                </span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Roman Urdu Coach Summary (If Available) */}
      {report.romanUrduSummary && (
        <div className="rounded-3xl border border-violet-200 dark:border-violet-900/70 bg-gradient-to-r from-violet-50/70 to-purple-50/70 dark:from-violet-950/30 dark:to-purple-950/30 p-6 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-violet-600 text-white shrink-0 mt-0.5">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wider">
              Urdu / Roman Urdu Coach Guidance
            </h4>
            <p className="text-xs sm:text-sm text-violet-800 dark:text-violet-300 mt-1 leading-relaxed">
              {report.romanUrduSummary}
            </p>
          </div>
        </div>
      )}

      {/* 4. Question-by-Question Detailed Breakdown */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Question-by-Question Deep Dive
          </h3>
          <p className="text-xs text-slate-500">
            Review your exact spoken transcript, detected verbal filler words, English grammar fixes, and sample answers.
          </p>
        </div>

        <FeedbackSection answers={report.answers} showRomanUrdu={true} />
      </div>

      {/* 5. 7-Day Personalized Practice Plan */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Personalized 7-Day Practice Action Plan
              </h3>
              <p className="text-xs text-slate-500">
                10-15 minute daily drills to eliminate weaknesses before your next interview.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {report.sevenDayPlan.map((plan, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {plan.day}
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {plan.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {plan.task}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-center gap-4 py-4">
        <Link
          href="/interview/setup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <RotateCcw className="w-4 h-4" />
          Practice Weak Questions
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
