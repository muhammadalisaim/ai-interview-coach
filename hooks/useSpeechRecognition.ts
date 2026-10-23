'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useSpeechRecognition(lang = 'en-US') {
  const recRef = useRef<any>(null);
  const startedAt = useRef<number>(0);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isExplicitlyStoppedRef = useRef(false);

  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [durationSec, setDurationSec] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setSupported(false);
      return;
    }

    try {
      const rec = new SR();
      rec.lang = lang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (e: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const result = e.results[i];
          if (result.isFinal) {
            finalChunk += result[0].transcript + ' ';
          } else {
            interimChunk += result[0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => (prev ? prev.trim() + ' ' + finalChunk.trim() : finalChunk.trim()));
        }
        setInterim(interimChunk);
      };

      rec.onstart = () => {
        setListening(true);
        setPermissionDenied(false);
      };

      rec.onend = () => {
        setListening(false);
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
          durationTimerRef.current = null;
        }
        if (startedAt.current > 0) {
          setDurationSec(Math.round((Date.now() - startedAt.current) / 1000));
        }

        // Auto restart if continuous listening was interrupted without user click
        if (!isExplicitlyStoppedRef.current && recRef.current) {
          try {
            // Give 200ms breath before auto-restart
            setTimeout(() => {
              if (!isExplicitlyStoppedRef.current && recRef.current) {
                try {
                  recRef.current.start();
                  setListening(true);
                } catch {}
              }
            }, 200);
          } catch {}
        }
      };

      rec.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setPermissionDenied(true);
        }
        setListening(false);
      };

      recRef.current = rec;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      setSupported(false);
    }

    return () => {
      isExplicitlyStoppedRef.current = true;
      try {
        recRef.current?.abort();
      } catch {}
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [lang]);

  const start = useCallback(() => {
    isExplicitlyStoppedRef.current = false;
    if (!recRef.current) return;
    try {
      setTranscript('');
      setInterim('');
      setDurationSec(0);
      startedAt.current = Date.now();

      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      durationTimerRef.current = setInterval(() => {
        setDurationSec(Math.round((Date.now() - startedAt.current) / 1000));
      }, 500);

      try {
        recRef.current.stop();
      } catch {}

      setTimeout(() => {
        try {
          recRef.current.start();
          setListening(true);
        } catch (e) {
          console.warn('SpeechRecognition start failed (might already be active):', e);
        }
      }, 50);
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
    }
  }, []);

  const stop = useCallback(() => {
    isExplicitlyStoppedRef.current = true;
    try {
      recRef.current?.stop();
    } catch {}
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setDurationSec(0);
  }, []);

  return {
    transcript,
    setTranscript,
    interim,
    listening,
    supported,
    permissionDenied,
    durationSec,
    start,
    stop,
    reset,
  };
}
