'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '../store/interviewStore';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useSpeechRecognition } from './useSpeechRecognition';
import { wordsPerMinute, countFillers } from '../lib/metrics';
import toast from 'react-hot-toast';

export function useInterview(accent = 'en-US') {
  const store = useInterviewStore();
  const router = useRouter();
  const {
    speak,
    cancel: cancelSpeech,
    speaking,
    autoplayBlocked,
    setAutoplayBlocked,
  } = useSpeechSynthesis({ lang: accent });
  const rec = useSpeechRecognition(accent);
  const isSubmittingRef = useRef(false);

  // Directly start listening and cancel any ongoing speech
  const skipSpeechAndListen = useCallback(() => {
    cancelSpeech();
    store.set({ status: 'listening', error: null });
    try {
      rec.start();
    } catch {}
  }, [cancelSpeech, rec, store]);

  // Play question audio explicitly
  const playQuestionAudio = useCallback(async () => {
    if (!store.currentQuestion) return;
    setAutoplayBlocked(false);
    store.set({ status: 'asking', error: null });
    rec.stop();
    try {
      await speak(store.currentQuestion.text);
    } catch (err) {
      console.warn('Speech completed or interrupted:', err);
    }
    store.set({ status: 'listening' });
    try {
      rec.start();
    } catch {}
  }, [cancelSpeech, rec, setAutoplayBlocked, speak, store]);

  // Ask question aloud, then open microphone
  const askCurrentQuestion = useCallback(async () => {
    if (!store.currentQuestion) return;

    store.set({ status: 'asking', error: null });
    rec.stop();

    try {
      await speak(store.currentQuestion.text);
    } catch (err) {
      console.warn('Speech finished or interrupted:', err);
    }

    // Now open microphone for candidate
    store.set({ status: 'listening' });
    try {
      rec.start();
    } catch {}
  }, [speak, store, rec]);

  // Submit candidate answer
  const submitAnswer = useCallback(
    async (manualTranscript?: string, manualDuration?: number) => {
      if (isSubmittingRef.current || !store.sessionId || !store.currentQuestion) return;
      isSubmittingRef.current = true;

      const finalTranscript = (manualTranscript ?? rec.transcript).trim();
      const finalDuration = manualDuration ?? (rec.durationSec || 5);

      rec.stop();
      cancelSpeech();

      if (!finalTranscript) {
        isSubmittingRef.current = false;
        toast.error('Did not catch your voice. Please try answering again or use Type Answer.');
        store.set({ status: 'listening' });
        rec.start();
        return;
      }

      store.set({ status: 'evaluating' });

      try {
        const wpm = wordsPerMinute(finalTranscript, finalDuration);
        const { total: fillerCount } = countFillers(finalTranscript);

        const res = await fetch('/api/interview/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: store.sessionId,
            questionId: store.currentQuestion.id,
            transcript: finalTranscript,
            durationSec: finalDuration,
            wpm,
            fillerCount,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to evaluate answer');
        }

        const data = await res.json();
        rec.reset();

        // Check if follow-up or next question exists
        const next = data.followUp ?? data.nextQuestion;

        if (next) {
          toast.success(data.followUp ? 'Follow-up question based on your answer!' : 'Answer saved! Next question...');
          store.set({
            currentQuestion: next,
            questionIndex: store.questionIndex + 1,
            status: 'asking',
          });
          isSubmittingRef.current = false;
          await speak(next.text);
          store.set({ status: 'listening' });
          rec.start();
        } else {
          // Final question answered, finish session
          toast.loading('Analyzing complete interview and preparing feedback report...');
          const finishRes = await fetch('/api/interview/finish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: store.sessionId }),
          });

          if (!finishRes.ok) {
            throw new Error('Failed to finish interview');
          }

          toast.dismiss();
          toast.success('Interview complete! Viewing your feedback report.');
          store.set({ status: 'finished' });
          router.push(`/report/${store.sessionId}`);
        }
      } catch (err: any) {
        console.error('Error during answer submission:', err);
        toast.error(err.message || 'Error evaluating answer. Please retry.');
        store.set({ status: 'listening', error: err.message });
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [cancelSpeech, rec, router, speak, store]
  );

  // Repeat current question
  const repeatQuestion = useCallback(async () => {
    if (!store.currentQuestion) return;
    playQuestionAudio();
  }, [playQuestionAudio, store.currentQuestion]);

  // Skip current question
  const skipQuestion = useCallback(async () => {
    await submitAnswer('Skipped question by candidate.', 1);
  }, [submitAnswer]);

  // End interview early
  const endInterview = useCallback(async () => {
    if (!store.sessionId) return;
    rec.stop();
    cancelSpeech();
    toast.loading('Finalizing interview report...');
    try {
      await fetch('/api/interview/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: store.sessionId }),
      });
      toast.dismiss();
      toast.success('Interview ended. Generating report...');
      store.set({ status: 'finished' });
      router.push(`/report/${store.sessionId}`);
    } catch (err: any) {
      toast.error('Failed to end interview.');
    }
  }, [cancelSpeech, rec, router, store]);

  return {
    ...store,
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
  };
}
