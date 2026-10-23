'use client';

import React, { useState } from 'react';
import { Settings, Globe, Volume2, MessageSquare, Moon, Sun, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [accent, setAccent] = useState('en-US');
  const [voiceSpeed, setVoiceSpeed] = useState('normal');
  const [romanUrduTips, setRomanUrduTips] = useState(true);
  const [theme, setTheme] = useState('system');

  const handleSave = () => {
    toast.success('Preferences saved successfully!');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to reset demo history and sessions?')) {
      toast.success('Session data reset.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Coach Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize speech recognition accents, AI voice playback, and Roman Urdu tips.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Accent Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Speech Recognition Accent
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Optimizes speech-to-text accuracy for your region.
            </p>
          </div>
          <select
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-IN">English (India / Pakistan)</option>
          </select>
        </div>

        {/* AI Voice Speed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-600" />
              AI Voice Question Speed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pace at which questions are read aloud.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['slow', 'normal', 'fast'].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setVoiceSpeed(spd)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors border ${
                  voiceSpeed === spd
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>
        </div>

        {/* Roman Urdu Tips Feature F12 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Feedback Tips in Roman Urdu (Feature F12)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Shows bilingual coaching notes and motivational tips in Roman Urdu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRomanUrduTips(!romanUrduTips)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              romanUrduTips ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                romanUrduTips ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reset Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h3 className="font-bold text-sm text-rose-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Reset Local Sessions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear all locally saved mock interviews and answers.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearData}
            className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100"
          >
            Clear Data
          </button>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
