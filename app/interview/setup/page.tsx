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
      let sessionId = '';
      let currentQuestion: { id: string; text: string } | null = null;
      let totalQ = questionCount;

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

        if (res.ok) {
          const data = await res.json();
          sessionId = data.sessionId;
          currentQuestion = data.question;
          totalQ = data.totalQuestions || questionCount;
        }
      } catch (networkErr) {
        console.warn('Network or API route unavailable, using instant local engine:', networkErr);
      }

      // If server API route failed or returned non-ok (e.g. Netlify/Vercel serverless cold start),
      // seamlessly initialize via client interview engine so candidate NEVER gets blocked!
      if (!sessionId || !currentQuestion) {
        const { createClientSession } = await import('@/lib/clientInterviewEngine');
        const local = createClientSession({
          role: selectedRole,
          level: selectedLevel as any,
          count: questionCount,
          mode: mode as any,
        });
        sessionId = local.session.id;
        currentQuestion = {
          id: local.firstQuestion.id,
          text: local.firstQuestion.text,
        };
        totalQ = local.questions.length;
      }

      toast.dismiss();
      toast.success('Interview session initialized! Preparing audio...');

      // Store in Zustand
      store.set({
        sessionId,
        role: selectedRole,
        level: selectedLevel,
        mode,
        currentQuestion,
        totalQuestions: totalQ,
        questionIndex: 1,
        status: 'asking',
        error: null,
      });

      router.push(`/interview/${sessionId}`);
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
