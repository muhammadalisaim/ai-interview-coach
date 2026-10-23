'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSelector } from '@/components/RoleSelector';
import { useInterviewStore } from '@/store/interviewStore';
import { DEFAULT_ROLES } from '@/lib/roles';
import { Role, ExperienceLevel, InterviewMode } from '@/types';
import toast from 'react-hot-toast';

export default function InterviewSetupPage() {
  const router = useRouter();
  const store = useInterviewStore();

  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState(store.role || 'Frontend Developer');
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>(store.level || 'fresher');
  const [questionCount, setQuestionCount] = useState<number>(store.totalQuestions || 5);
  const [mode, setMode] = useState<InterviewMode>(store.mode || 'full');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch('/api/admin/roles');
        const data = await res.json();
        if (data.roles && Array.isArray(data.roles)) {
          setRoles(data.roles);
        }
      } catch (err) {
        console.warn('Using default roles list');
      }
    }
    fetchRoles();
  }, []);

  const handleStart = async () => {
    if (!selectedRole) {
      toast.error('Please select an interview role first');
      return;
    }

    setIsLoading(true);
    toast.loading('AI is crafting role questions for your interview...');

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          level: selectedLevel,
          count: questionCount,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate interview questions');
      }

      const data = await res.json();
      toast.dismiss();
      toast.success('Interview session initialized! Preparing audio...');

      // Store in Zustand
      store.set({
        sessionId: data.sessionId,
        role: selectedRole,
        level: selectedLevel,
        mode,
        currentQuestion: data.question,
        totalQuestions: data.totalQuestions,
        questionIndex: 1,
        status: 'asking',
        error: null,
      });

      router.push(`/interview/${data.sessionId}`);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error starting interview. Please retry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Configure Your Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select your target role and career stage. The AI will customize questions specifically to your profile.
        </p>
      </div>

      <RoleSelector
        roles={roles}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        questionCount={questionCount}
        onSelectCount={setQuestionCount}
        mode={mode}
        onSelectMode={setMode}
        onStart={handleStart}
        isLoading={isLoading}
      />
    </div>
  );
}
