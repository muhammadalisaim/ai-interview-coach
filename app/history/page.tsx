'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { InterviewSession } from '@/types';
import { getScoreVerdict } from '@/lib/scoring';
import { Search, Filter, Calendar, Award, ChevronRight, Play } from 'lucide-react';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    async function fetchSessions() {
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
    fetchSessions();
  }, []);

  const finishedSessions = sessions.filter((s) => s.status === 'finished');
  const availableRoles = Array.from(new Set(finishedSessions.map((s) => s.role)));

  const filtered = finishedSessions.filter((s) => {
    const matchesSearch =
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.level.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Interview Session History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your past mock interviews, transcripts, and evaluation scorecards.
          </p>
        </div>

        <Link
          href="/interview/setup"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          Start New Practice
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role or level..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Roles</option>
          {availableRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Loading past sessions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No completed interview sessions match your filter.
          </p>
          <p className="text-xs text-slate-400">
            Complete a mock interview to start tracking your historical performance!
          </p>
          <Link
            href="/interview/setup"
            className="inline-block mt-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
          >
            Start First Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filtered.map((s) => {
            const verdict = getScoreVerdict(s.overallScore || 0);
            return (
              <div
                key={s.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {s.role}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 capitalize">
                      {s.level}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Quality: <strong>{s.qualityScore ?? '-'}/10</strong></span>
                    <span>Confidence: <strong>{s.confidenceScore ?? '-'}/10</strong></span>
                    <span>English: <strong>{s.englishScore ?? '-'}/10</strong></span>
                    <span>{s.questionCount} Questions</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right sm:text-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white block">
                      {s.overallScore || 0}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      / 100
                    </span>
                  </div>

                  <Link
                    href={`/report/${s.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    View Report
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
