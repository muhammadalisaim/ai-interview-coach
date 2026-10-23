'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { InterviewSession } from '@/types';
import { getScoreVerdict } from '@/lib/scoring';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch('/api/sessions');
        const data = await res.json();
        if (data.sessions) {
          setSessions(data.sessions);
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const finishedSessions = sessions.filter((s) => s.status === 'finished');
  const lastSession = finishedSessions[0];

  const avgScore =
    finishedSessions.length > 0
      ? Math.round(
          finishedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) /
            finishedSessions.length
        )
      : 0;

  const bestScore =
    finishedSessions.length > 0
      ? Math.max(...finishedSessions.map((s) => s.overallScore || 0))
      : 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Candidate Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your interview speaking confidence, answer quality, and English progress over time.
          </p>
        </div>

        <Link
          href="/interview/setup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          Start New Interview
        </Link>
      </div>

      {/* Main Grid: Start New Card + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Card */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-7 sm:p-9 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Role-Based Voice Simulation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black max-w-md">
              Ready for your next mock interview round?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-lg leading-relaxed">
              Choose your target role (Frontend, Backend, Data Analyst, HR) and level. Answer via microphone and get instant feedback on STAR method, speaking pace, and grammar.
            </p>
          </div>

          <div className="pt-6 relative z-10 flex flex-wrap gap-3">
            <Link
              href="/interview/setup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-indigo-900 font-extrabold text-sm hover:bg-indigo-50 shadow-md transition-all"
            >
              Configure & Start
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 border border-white/20 text-white font-semibold text-sm transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              View Score Charts
            </Link>
          </div>

          {/* Decorative background shape */}
          <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
        </div>

        {/* Last Interview Summary Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Last Interview
              </span>
              {lastSession && (
                <span className="text-xs text-slate-400">
                  {new Date(lastSession.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {lastSession ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {lastSession.role}
                  </h3>
                  <span className="text-xs text-slate-500 capitalize">
                    {lastSession.level} Level • {lastSession.questionCount} Questions
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center font-black text-xl text-slate-900 dark:text-white">
                    {lastSession.overallScore || 0}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Verdict
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {getScoreVerdict(lastSession.overallScore || 0).label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 block">Quality</span>
                    <strong className="text-xs text-slate-800 dark:text-slate-200">{lastSession.qualityScore ?? '-'}/10</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 block">Confidence</span>
                    <strong className="text-xs text-slate-800 dark:text-slate-200">{lastSession.confidenceScore ?? '-'}/10</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 block">English</span>
                    <strong className="text-xs text-slate-800 dark:text-slate-200">{lastSession.englishScore ?? '-'}/10</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                No past interview sessions yet. Start your first session!
              </div>
            )}
          </div>

          {lastSession && (
            <Link
              href={`/report/${lastSession.id}`}
              className="mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Open Full Report
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Aggregate Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Sessions
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {finishedSessions.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Average Score
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {avgScore}/100
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Best Score
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {bestScore}/100
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Interview Readiness
          </span>
          <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            {avgScore >= 70 ? 'High' : avgScore >= 50 ? 'Moderate' : 'Developing'}
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Recent Practice Sessions
          </h3>
          <Link
            href="/history"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All ({finishedSessions.length})
          </Link>
        </div>

        {finishedSessions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No completed sessions found. Click "Start New Interview" to begin your mock practice!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Level</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Quality</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">English</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {finishedSessions.slice(0, 5).map((s) => {
                  const verdict = getScoreVerdict(s.overallScore || 0);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        {s.role}
                      </td>
                      <td className="py-3.5 capitalize text-xs text-slate-500">
                        {s.level}
                      </td>
                      <td className="py-3.5 text-xs text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {s.qualityScore ?? '-'}/10
                      </td>
                      <td className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {s.confidenceScore ?? '-'}/10
                      </td>
                      <td className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {s.englishScore ?? '-'}/10
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {s.overallScore || 0}/100
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/report/${s.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
