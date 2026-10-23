'use client';

import { useCallback, useEffect, useState, useRef } from 'react';

export interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cancel = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    // Stop real HTML5 Audio if playing
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }

    // Also cancel browser SpeechSynthesis if running
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    setSpeaking(false);
  }, []);

  const fallbackToBrowserTTS = useCallback((text: string, onComplete: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onComplete();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate ?? 0.95;
      utterance.onend = () => onComplete();
      utterance.onerror = () => onComplete();
      (window as any).__currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      onComplete();
    }
  }, [options.lang, options.rate]);

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !text.trim()) {
          resolve();
          return;
        }

        // Cancel previous audio
        cancel();
        setSpeaking(true);

        let hasFinished = false;
        const finish = () => {
          if (hasFinished) return;
          hasFinished = true;
          if (watchdogTimerRef.current) {
            clearTimeout(watchdogTimerRef.current);
            watchdogTimerRef.current = null;
          }
          if (currentAudioRef.current) {
            try {
              currentAudioRef.current.pause();
            } catch {}
            currentAudioRef.current = null;
          }
          setSpeaking(false);
          resolve();
        };

        // Safety watchdog: max time allowed before opening mic
        const words = text.trim().split(/\s+/).length;
        const maxWaitMs = Math.max(4000, Math.min(14000, words * 500 + 2500));
        watchdogTimerRef.current = setTimeout(() => {
          finish();
        }, maxWaitMs);

        // 1. Primary: Stream professional real neural audio from /api/tts
        try {
          const ttsUrl = `/api/tts?text=${encodeURIComponent(text.trim())}&lang=en`;
          const audio = new Audio(ttsUrl);
          audio.preload = 'auto';
          currentAudioRef.current = audio;

          audio.onended = () => {
            setAutoplayBlocked(false);
            finish();
          };

          audio.onerror = (e) => {
            console.warn('Real voice endpoint failed, using browser TTS fallback:', e);
            fallbackToBrowserTTS(text, finish);
          };

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setAutoplayBlocked(false);
              })
              .catch((playErr: any) => {
                console.warn('Browser autoplay policy prevented audio without click:', playErr);
                // Flag that browser blocked autoplay so UI shows a 1-click "Tap to play voice"
                setAutoplayBlocked(true);
                // Do not finish immediately, give user chance to click or fallback
                fallbackToBrowserTTS(text, () => {
                  finish();
                });
              });
          }
        } catch (err) {
          console.warn('HTML5 Audio initialization exception:', err);
          fallbackToBrowserTTS(text, finish);
        }
      });
    },
    [cancel, fallbackToBrowserTTS]
  );

  return { speak, cancel, speaking, supported, autoplayBlocked, setAutoplayBlocked };
}
