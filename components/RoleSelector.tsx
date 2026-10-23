'use client';

import React, { useState } from 'react';
import { Search, Briefcase, Sparkles, Check, ChevronRight } from 'lucide-react';
import { Role, ExperienceLevel, InterviewMode } from '../types';

interface RoleSelectorProps {
  roles: Role[];
  selectedRole: string;
  onSelectRole: (role: string) => void;
  selectedLevel: ExperienceLevel;
  onSelectLevel: (level: ExperienceLevel) => void;
  questionCount: number;
  onSelectCount: (count: number) => void;
  mode: InterviewMode;
  onSelectMode: (mode: InterviewMode) => void;
  onStart: () => void;
  isLoading?: boolean;
}

export function RoleSelector({
  roles,
  selectedRole,
  onSelectRole,
  selectedLevel,
  onSelectLevel,
  questionCount,
  onSelectCount,
  mode,
  onSelectMode,
  onStart,
  isLoading = false,
}: RoleSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoles = roles.filter(
    (r) =>
      r.active &&
      (r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search job roles, categories, or skills (e.g. React, SQL, Full Stack)..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Role Cards Grid */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          1. Select Target Job Role
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRoles.map((role) => {
            const isSelected = selectedRole === role.name;
            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.name)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30 shadow-md shadow-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {role.category}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {role.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {role.description}
                  </p>
                </div>

                {/* Skills Chips */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {role.skills.slice(0, 3).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {role.skills.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{role.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Experience Level & Count Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Experience Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            2. Experience Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['fresher', 'junior', 'senior'] as ExperienceLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onSelectLevel(level)}
                className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-colors border ${
                  selectedLevel === level
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            3. Number of Questions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 8, 10].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onSelectCount(count)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-colors border ${
                  questionCount === count
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Interview Mode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            4. Interview Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectMode('full')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-colors border ${
                mode === 'full'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              Full Mock (Report at end)
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('practice')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-colors border ${
                mode === 'practice'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              Practice Mode
            </button>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!selectedRole || isLoading}
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          {isLoading ? (
            <span>Generating Role Questions...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Start Voice Interview Now</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
