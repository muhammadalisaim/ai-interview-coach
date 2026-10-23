'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';
import { QuestionCard } from '@/components/QuestionCard';
import { MicButton } from '@/components/MicButton';
import { TranscriptBox } from '@/components/TranscriptBox';
import { InterviewTimer } from '@/components/InterviewTimer';
import {
  RotateCcw,
  SkipForward,
  StopCircle,
  AlertCircle,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LiveInterviewPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const router = useRouter();

  const {
    sessionId: storeSessionId,
    role,
    level,
    currentQuestion,
    questionIndex,
    totalQuestions,
    status,
    rec,
    speaking,
    autoplayBlocked,
    playQuestionAudio,
    askCurrentQuestion,
    skipSpeechAndListen,
    cancelSpeech,
    submitAnswer,
    repeatQuestion,
    skipQuestion,
    endInterview,
    set: setStore,
  } = useInterview();

  const [hasStarted, setHasStarted] = useState(false);

  // Resume or restore if reloaded directly on this URL
  useEffect(() => {
    async function initSession() {
      if (!storeSessionId || storeSessionId !== sessionId) {
        try {
          const res = await fetch(`/api/sessions?id=${sessionId}`);
          const data = await res.json();
          if (data.session) {
            setStore({
              sessionId: data.session.id,
              role: data.session.role,
              level: data.session.level,
              totalQuestions: data.session.questionCount,
            });
          }
        } catch (err) {
          console.error('Failed to restore session from API:', err);
        }
      }
    }
    initSession();
  }, [sessionId, storeSessionId, setStore]);

  // Initial trigger: ask first question once ready
  useEffect(() => {
    if (currentQuestion && !hasStarted) {
      setHasStarted(true);
      const timer = setTimeout(() => {
        askCurrentQuestion();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, hasStarted, askCurrentQuestion]);

  // Handle central button tap
  const handleMicToggle = () => {
    if (autoplayBlocked) {
      // User tapped button when browser had blocked audio -> Play audio through speaker!
      toast.success('Playing audio through laptop speakers...');
      playQuestionAudio();
      return;
    }

    if (status === 'asking') {
      // User tapped while AI was asking -> Skip waiting for audio and start recording now!
      toast.success('Ready! Speak your answer now.');
      skipSpeechAndListen();
    } else if (status === 'listening') {
      if (rec.listening) {
        // Candidate stops speaking manually -> Submit answer
        rec.stop();
        submitAnswer();
      } else {
        // Start listening
        rec.start();
      }
    } else if (status === 'idle') {
      playQuestionAudio();
    }
  };

  const handleTypedSubmit = (text: string) => {
    submitAnswer(text, 15);
  };

  const isAsking = status === 'asking' || speaking;
  const isListening = status === 'listening' && rec.listening;
  const isEvaluating = status === 'evaluating';

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2 sm:py-4">
      {/* Autoplay banner if browser restricted background audio */}
      {autoplayBlocked && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Laptop Audio Restricted by Browser</p>
              <p className="text-xs text-indigo-100">Click below to hear the interviewer speak the question through your speakers.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={playQuestionAudio}
            className="px-4 py-2 rounded-xl bg-white text-indigo-900 font-extrabold text-xs shadow-md hover:bg-indigo-50 shrink-0"
          >
            🔊 Play Audio Now
          </button>
        </div>
      )}

      {/* 1. Header Bar: Progress & Timer */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {role} Mock Interview
            </h1>
            <p className="text-xs text-slate-400 capitalize">
              {level} Level • Session {sessionId.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <InterviewTimer durationSec={rec.durationSec} maxLimitSec={180} />
          {/* Status Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {isAsking && <Volume2 className="w-3.5 h-3.5 animate-bounce" />}
            {isListening && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            {isEvaluating && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            <span className="capitalize">{status}...</span>
          </div>
        </div>
      </div>

      {/* Progress Bar (Question count) */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-500"
          style={{
            width: `${Math.min(100, (Math.max(1, questionIndex) / totalQuestions) * 100)}%`,
          }}
        />
      </div>

      {/* Permission warning if user blocked mic */}
      {rec.permissionDenied && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Microphone permission needed:</strong> Please allow microphone access in your browser address bar, or use the "Type Answer" button below.
          </div>
        </div>
      )}

      {/* 2. Question Card with Listen Aloud Button */}
      {currentQuestion ? (
        <div className="space-y-2">
          <QuestionCard
            questionText={currentQuestion.text}
            questionNumber={questionIndex || 1}
            totalQuestions={totalQuestions || 5}
            role={role}
            isFollowUp={currentQuestion.isFollowUp}
            isSpeaking={isAsking}
            onPlayAudio={playQuestionAudio}
          />
          {isAsking && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={skipSpeechAndListen}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
              >
                <span>Ready to answer? Skip audio & speak now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border text-center text-slate-500">
          Loading interview questions...
        </div>
      )}

      {/* 3. Central Interactive Button & Status */}
      <div className="py-2">
        <MicButton
          status={status}
          isListening={rec.listening}
          onToggle={handleMicToggle}
          disabled={isEvaluating}
        />
      </div>

      {/* 4. Live Speech Transcript Box */}
      <TranscriptBox
        transcript={rec.transcript}
        interimText={rec.interim}
        isListening={rec.listening}
        durationSec={rec.durationSec}
        onSubmitTypedAnswer={handleTypedSubmit}
        isEvaluating={isEvaluating}
      />

      {/* 5. Actions Footer (Repeat, Skip, End Interview) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={repeatQuestion}
            disabled={isEvaluating}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Repeat Question
          </button>

          <button
            type="button"
            onClick={skipQuestion}
            disabled={isEvaluating}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        </div>

        <button
          type="button"
          onClick={endInterview}
          disabled={isEvaluating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 disabled:opacity-40 transition-colors"
        >
          <StopCircle className="w-3.5 h-3.5" />
          End Interview & View Report
        </button>
      </div>
    </div>
  );
}
