'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mic,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart2,
  ShieldCheck,
  Award,
  Globe,
  Play,
  Clock,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>New: AI Spoken Voice Simulation + STAR Method Analysis</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Practice Realistic Job Interviews by{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Speaking Out Loud
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The AI interviewer asks role-based questions aloud, listens to your spoken answers, and delivers immediate scores for <strong>Answer Quality</strong>, <strong>Confidence</strong>, and <strong>English Fluency</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/interview/setup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
          >
            <Mic className="w-5 h-5" />
            Start Voice Mock Interview
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all"
          >
            Explore Dashboard
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>100% Free & Private in Browser</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Pace & Filler Word Detection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>English Grammar Corrections</span>
          </div>
        </div>
      </section>

      {/* Interactive Sample Report Card Preview */}
      <section className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Sample Candidate Feedback Report
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                Frontend Developer (Fresher)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Completed in 4 mins • 5 Questions Evaluated
              </p>
            </div>

            {/* Circular Score Preview */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-sm">
                <span className="text-2xl font-black text-slate-900 dark:text-white">88</span>
                <span className="text-[10px] text-slate-400 font-semibold">/100</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Verdict
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  Interview Ready
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">Top 10% speaking pace & STAR structure</p>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
              <span className="text-xs font-bold uppercase text-blue-700 dark:text-blue-300">
                Answer Quality
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                8.5<span className="text-xs font-normal text-slate-400">/10</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Structured explanations with practical project examples.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
                Speaking Confidence
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                8.9<span className="text-xs font-normal text-slate-400">/10</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                135 WPM pace with only 2 filler words detected.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                English Fluency
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                9.0<span className="text-xs font-normal text-slate-400">/10</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Crisp grammatical sentence flow and vocabulary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works (Section 17.2) */}
      <section className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Simple 3-Step Flow
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            How AI Mock Interview Coach Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Engineered specifically for final-year students and fresh graduates who want to overcome interview fear before real job drives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Select Your Role & Level
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose from Frontend, Backend, Fullstack, Data Analyst, Product Manager, HR, and more. Set your level from Fresher to Senior.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-black text-lg flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Speak Into Your Mic
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The AI speaks questions aloud. Answer naturally. The browser captures your voice live, tracking your pace and filler words.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-black text-lg flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Instant Scoring & 7-Day Plan
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Get an overall score out of 100, specific grammar corrections (said vs. better), sample answers, and a personalized 7-day practice plan.
            </p>
          </div>
        </div>
      </section>

      {/* Ready to Practice Call to Action */}
      <section className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-2xl">
        <h2 className="text-3xl sm:text-4xl font-black">
          Ace Your Next Real-World Interview
        </h2>
        <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto">
          Start your free voice interview in under 30 seconds. No costly human coaches needed.
        </p>
        <div>
          <Link
            href="/interview/setup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-900 font-extrabold text-base hover:bg-indigo-50 shadow-lg hover:scale-105 transition-all"
          >
            <Play className="w-5 h-5 fill-indigo-900" />
            Start Interview Simulator
          </Link>
        </div>
      </section>
    </div>
  );
}
