import { z } from 'zod';

export const GrammarMistakeSchema = z.object({
  said: z.string(),
  better: z.string(),
});

export const EvaluationSchema = z.object({
  answer_quality: z.object({
    score: z.number().min(0).max(10),
    strengths: z.array(z.string()).max(5),
    improvements: z.array(z.string()).max(5),
    used_star: z.boolean().default(false),
  }),
  tone_score: z.number().min(0).max(10),
  english: z.object({
    score: z.number().min(0).max(10),
    mistakes: z.array(GrammarMistakeSchema).max(5).default([]),
    vocabulary_tip: z.string().default('Focus on concise vocabulary and confident phrasing.'),
  }),
  better_answer: z.string(),
  follow_up_question: z.string().nullable().default(null),
  roman_urdu_tip: z.string().optional(),
});

export const StartInterviewBody = z.object({
  role: z.string().min(1, 'Please select or enter a role'),
  level: z.enum(['fresher', 'junior', 'senior']).default('fresher'),
  count: z.number().min(1).max(10).default(5),
  mode: z.enum(['full', 'practice']).default('full'),
});

export const AnswerBody = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  transcript: z.string(),
  durationSec: z.number().default(0),
  wpm: z.number().optional(),
  fillerCount: z.number().optional(),
});

export const FinishInterviewBody = z.object({
  sessionId: z.string().min(1),
});

export const SummarySchema = z.object({
  overallSummary: z.string(),
  topStrengths: z.array(z.string()).min(1).max(5),
  topImprovements: z.array(z.string()).min(1).max(5),
  sevenDayPlan: z.array(
    z.object({
      day: z.string(),
      title: z.string(),
      task: z.string(),
    })
  ).min(3),
  romanUrduSummary: z.string().optional(),
});

/**
 * Extracts JSON block from model response safely
 */
export function extractJson(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}
