export type ExperienceLevel = 'fresher' | 'junior' | 'senior';

export type InterviewStatus = 'idle' | 'asking' | 'listening' | 'evaluating' | 'finished';

export type InterviewMode = 'full' | 'practice';

export interface Role {
  id: string | number;
  name: string;
  category: string;
  description: string;
  skills: string[];
  active: boolean;
}

export interface Question {
  id: string;
  sessionId?: string;
  text: string;
  position: number;
  isFollowUp?: boolean;
}

export interface GrammarMistake {
  said: string;
  better: string;
}

export interface AnswerEvaluation {
  answer_quality: {
    score: number;
    strengths: string[];
    improvements: string[];
    used_star: boolean;
  };
  tone_score: number;
  english: {
    score: number;
    mistakes: GrammarMistake[];
    vocabulary_tip: string;
  };
  better_answer: string;
  follow_up_question: string | null;
  roman_urdu_tip?: string;
}

export interface AnswerRecord {
  id: string;
  sessionId: string;
  questionId: string;
  transcript: string;
  durationSec: number;
  wpm: number;
  fillerCount: number;
  evaluation: AnswerEvaluation;
  createdAt: string;
}

export interface DayPlan {
  day: string;
  title: string;
  task: string;
}

export interface SessionReport {
  overallScore: number;
  qualityScore: number;
  confidenceScore: number;
  englishScore: number;
  verdict: string;
  topStrengths: string[];
  topImprovements: string[];
  sevenDayPlan: DayPlan[];
  romanUrduSummary?: string;
  answers: {
    question: Question;
    answer: AnswerRecord;
  }[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  level: ExperienceLevel;
  questionCount: number;
  status: 'in_progress' | 'finished';
  qualityScore?: number;
  confidenceScore?: number;
  englishScore?: number;
  overallScore?: number;
  report?: SessionReport;
  createdAt: string;
  finishedAt?: string;
}

export interface AudioMetrics {
  wpm: number;
  durationSec: number;
  fillerCount: number;
  fillerBreakdown: Record<string, number>;
}
