'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProgressChart, ProgressDataPoint } from '@/components/ProgressChart';
import { InterviewSession } from '@/types';
import { TrendingUp, Award, Zap, BookOpen, Play } from 'lucide-react';

export default function ProgressPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');

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

  const finishedSessions = sessions
    .filter((s) => s.status === 'finished')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const availableRoles = Array.from(new Set(finishedSessions.map((s) => s.role)));

  const filteredSessions = finishedSessions.filter((s) => {
    if (selectedRole === 'all') return true;
    return s.role === selectedRole;
  });

  const chartData: ProgressDataPoint[] = filteredSessions.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    role: s.role,
    quality: s.qualityScore || 0,
    confidence: s.confidenceScore || 0,
    english: s.englishScore || 0,
    overall: s.overallScore || 0,
  }));

  const avgQuality =
    filteredSessions.length > 0
      ? (filteredSessions.reduce((acc, s) => acc + (s.qualityScore || 0), 0) / filteredSessions.length).toFixed(1)
      : '0.0';

  const avgConfidence =
    filteredSessions.length > 0
      ? (filteredSessions.reduce((acc, s) => acc + (s.confidenceScore || 0), 0) / filteredSessions.length).toFixed(1)
      : '0.0';

  const avgEnglish =
    filteredSessions.length > 0
      ? (filteredSessions.reduce((acc, s) => acc + (s.englishScore || 0), 0) / filteredSessions.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Score Progression & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyze your score improvements across Answer Quality, Speaking Confidence, and English Fluency.
          </p>
        </div>

        {/* Filter by role */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm shadow-sm"
          >
            <option value="all">All Job Roles</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Average Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Quality
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {avgQuality}/10
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Confidence
            </span>
            <div className="text-2xl font-black text-amber-500 mt-0.5">
              {avgConfidence}/10
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg English
            </span>
            <div className="text-2xl font-black text-emerald-500 mt-0.5">
              {avgEnglish}/10
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-500">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recharts Line Graph Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Score Trend Over Sessions
          </h3>
          <p className="text-xs text-slate-500">
            Track how your speaking pace, filler count reduction, and STAR answers evolve over multiple interviews.
          </p>
        </div>

        <ProgressChart data={chartData} />
      </div>
    </div>
  );
}
