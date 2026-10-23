export const clamp = (n: number, lo = 0, hi = 10): number =>
  Math.min(hi, Math.max(lo, n));

export function paceScore(wpm: number): number {
  if (wpm >= 110 && wpm <= 170) return 10;
  const gap = wpm < 110 ? 110 - wpm : wpm - 170;
  const raw = 10 - gap / 10;
  return Number(clamp(raw).toFixed(1));
}

export function fillerScore(fillers: number, words: number): number {
  const per100 = words > 0 ? (fillers / words) * 100 : 0;
  const raw = 10 - per100 * 1.5;
  return Number(clamp(raw).toFixed(1));
}

export interface ConfidenceParams {
  wpm: number;
  fillers: number;
  words: number;
  tone: number;
}

export const confidenceScore = (a: ConfidenceParams): number => {
  const pScore = paceScore(a.wpm);
  const fScore = fillerScore(a.fillers, a.words);
  const calculated = 0.35 * pScore + 0.35 * fScore + 0.3 * a.tone;
  return Number(clamp(calculated).toFixed(1));
};

export const overallScore = (quality: number, confidence: number, english: number): number => {
  const raw = (0.4 * quality + 0.3 * confidence + 0.3 * english) * 10;
  return Math.min(100, Math.max(0, Math.round(raw)));
};

export interface ScoreVerdict {
  label: string;
  badgeColor: string;
  description: string;
}

export function getScoreVerdict(score: number): ScoreVerdict {
  if (score >= 85) {
    return {
      label: 'Interview Ready',
      badgeColor: 'emerald',
      description: 'Outstanding performance! You speak clearly, answer with structured depth, and demonstrate natural confidence.',
    };
  }
  if (score >= 70) {
    return {
      label: 'Good, Polish a Few Answers',
      badgeColor: 'blue',
      description: 'Strong foundation! Work on tightening STAR structures and eliminating slight verbal fillers for peak performance.',
    };
  }
  if (score >= 50) {
    return {
      label: 'Needs More Practice',
      badgeColor: 'amber',
      description: 'You have good technical knowledge. Focus on pacing, answer conciseness, and speaking without hesitation.',
    };
  }
  return {
    label: 'Practise the Basics First',
    badgeColor: 'rose',
    description: 'Practise the basics first. Review model sample answers and retry individual questions in Practice Mode.',
  };
}
