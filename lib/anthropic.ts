import Anthropic from '@anthropic-ai/sdk';
import { extractJson, EvaluationSchema, SummarySchema } from './schemas';
import { STARTER_QUESTIONS } from './roles';

const apiKey = process.env.ANTHROPIC_API_KEY;

export const anthropic = apiKey
  ? new Anthropic({ apiKey })
  : null;

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

export interface GenerationParams {
  role: string;
  level: string;
  count: number;
}

export interface EvaluationParams {
  role: string;
  level: string;
  question: string;
  transcript: string;
  durationSec: number;
  wpm: number;
  fillerCount: number;
}

/**
 * Generate interview questions using Claude (or intelligent starter generator fallback)
 */
export async function generateQuestionsWithClaude(
  systemPrompt: string,
  userPrompt: string,
  params: GenerationParams
): Promise<string[]> {
  if (anthropic && process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        const rawJson = extractJson(textBlock.text);
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed.questions.slice(0, params.count);
        }
      }
    } catch (err) {
      console.warn('Anthropic API call failed or not configured, using fallback question generator:', err);
    }
  }

  // Fallback intelligent question bank based on role and level
  const roleBank = STARTER_QUESTIONS[params.role] || STARTER_QUESTIONS.default;
  const count = params.count || 5;

  // Add level-specific flavor if needed
  if (params.level === 'senior') {
    return [
      `Introduce your experience as a Senior ${params.role} and leadership philosophy.`,
      `How do you design scalable architectures and review critical pull requests?`,
      `Describe a time you resolved a major stakeholder disagreement on engineering direction.`,
      `How do you mentor juniors and elevate technical standards across your team?`,
      `What is the most complex system challenge you have tackled in production?`,
    ].slice(0, count);
  }

  return roleBank.slice(0, count);
}

/**
 * Evaluate student answer using Claude (or intelligent rubric engine fallback)
 */
export async function evaluateAnswerWithClaude(
  systemPrompt: string,
  userPrompt: string,
  params: EvaluationParams
) {
  if (anthropic && process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        const rawJson = extractJson(textBlock.text);
        const parsed = JSON.parse(rawJson);
        const validated = EvaluationSchema.parse(parsed);
        return validated;
      }
    } catch (err) {
      console.warn('Anthropic evaluation error, using fallback evaluator:', err);
    }
  }

  // Intelligent fallback evaluator based on real transcript analysis
  const words = params.transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isVague = wordCount < 15;
  const hasExample = /for example|project|built|worked on|implemented|created|when i/i.test(params.transcript);
  const hasSTAR = /situation|task|action|result|because of that|solved|handled/i.test(params.transcript);

  // Scoring rubric approximation
  let qualityScore = 7;
  if (wordCount < 10) qualityScore = 3;
  else if (wordCount < 25) qualityScore = 5;
  else if (hasExample && hasSTAR) qualityScore = 9;
  else if (hasExample) qualityScore = 8;

  let toneScore = 7;
  if (/maybe|i think|sort of|not sure|i guess/i.test(params.transcript)) {
    toneScore = 6;
  } else if (params.wpm >= 110 && params.wpm <= 165 && wordCount >= 30) {
    toneScore = 9;
  }

  let englishScore = 8;
  const mistakes: { said: string; better: string }[] = [];
  if (/\bi am like\b/i.test(params.transcript)) {
    mistakes.push({ said: 'I am like', better: 'I enjoy / I prefer' });
  }
  if (/\bme and my friend\b/i.test(params.transcript)) {
    mistakes.push({ said: 'me and my friend', better: 'my friend and I' });
  }
  if (/\bhe don't\b/i.test(params.transcript)) {
    mistakes.push({ said: 'he don’t', better: 'he doesn’t' });
  }
  if (mistakes.length > 0) englishScore = 6.5;

  const strengths = [];
  const improvements = [];

  if (wordCount >= 20) strengths.push('Clear articulation and logical flow');
  if (hasExample) strengths.push('Included relevant real-world project context');
  if (strengths.length === 0) strengths.push('Direct response addressed the question');

  if (isVague) improvements.push('Expand your response with specific technical details');
  if (params.fillerCount > 3) improvements.push(`Reduce verbal filler words (detected ${params.fillerCount})`);
  if (!hasSTAR) improvements.push('Apply the STAR framework (Situation, Task, Action, Result) for stronger impact');

  let followUp: string | null = null;
  if (isVague && wordCount >= 3) {
    const qLower = params.question.toLowerCase();
    if (qLower.includes('customer') || qLower.includes('support')) {
      followUp = 'Could you describe how you managed the customer communication step-by-step?';
    } else if (qLower.includes('bug') || qLower.includes('challenge')) {
      followUp = 'What specific troubleshooting steps or tools did you use to diagnose that?';
    } else if (qLower.includes('state') || qLower.includes('code') || qLower.includes('api')) {
      followUp = 'Can you share a specific technical decision or library you chose and why?';
    } else {
      followUp = 'Could you provide a concrete example of how you put that into practice?';
    }
  }

  return {
    answer_quality: {
      score: qualityScore,
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
      used_star: hasSTAR,
    },
    tone_score: toneScore,
    english: {
      score: englishScore,
      mistakes,
      vocabulary_tip: hasExample
        ? "Use decisive action verbs like 'architected', 'spearheaded', or 'streamlined'."
        : "Connect your ideas with crisp transition phrases like 'Specifically' and 'Consequently'.",
    },
    better_answer: `In my previous work as a ${params.role}, I encountered a similar objective. Specifically, I took responsibility for the core implementation, addressed key technical constraints, and delivered measurable positive impact.`,
    follow_up_question: followUp,
    roman_urdu_tip: isVague
      ? 'Aapka answer thora mukhtasar tha, mazeed details aur example add karein.'
      : 'Bohot achi koshish thi! Confidence aur clarity bohot achi rahi.',
  };
}

/**
 * Generate final report synthesis using Claude (or intelligent summary generator)
 */
export async function summarizeSessionWithClaude(
  systemPrompt: string,
  userPrompt: string,
  params: any
) {
  if (anthropic && process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        const rawJson = extractJson(textBlock.text);
        const parsed = JSON.parse(rawJson);
        return SummarySchema.parse(parsed);
      }
    } catch (err) {
      console.warn('Anthropic summary error, using fallback summary:', err);
    }
  }

  return {
    overallSummary: `You completed the ${params.role} (${params.level}) mock interview with an overall score of ${params.overallScore}/100. Your technical comprehension was evident, and your delivery pace averaged solidly. Continuing structured practice will make your answers crisp and memorable.`,
    topStrengths: [
      'Authentic role knowledge and relevant technical terminology',
      'Consistent conversational flow and good responsiveness',
      'Positive, professional attitude throughout the session',
    ],
    topImprovements: [
      'Incorporate concrete metrics and outcomes (e.g. % improvements, user counts)',
      'Structure behavioral answers using the STAR method (Situation, Task, Action, Result)',
      'Pause intentionally instead of relying on filler words during thinking pauses',
    ],
    sevenDayPlan: [
      { day: 'Day 1', title: 'Self-Introduction Mastery', task: 'Practice a 60-second elevator pitch highlighting your top project without using "um" or "like".' },
      { day: 'Day 2', title: 'STAR Method Drills', task: 'Write down 3 challenging situations from your past work and frame them into Situation, Task, Action, Result.' },
      { day: 'Day 3', title: 'Pace & Breath Control', task: 'Record yourself speaking for 2 minutes while maintaining a steady 130-150 words-per-minute pace.' },
      { day: 'Day 4', title: 'Role Deep Dive', task: 'Review core architecture patterns and standard interview questions for your chosen role.' },
      { day: 'Day 5', title: 'Vocabulary Enhancement', task: 'Replace passive phrases with strong action verbs (e.g., spearheaded, architected, diagnosed).' },
      { day: 'Day 6', title: 'Practice Mode Weak Spot Review', task: 'Retry the specific questions where your score was below 7/10 using our instant practice mode.' },
      { day: 'Day 7', title: 'Full Simulated Mock Interview', task: 'Complete a full 5-question mock interview in one continuous sitting under realistic conditions.' },
    ],
    romanUrduSummary: 'Shabash! Aapka interview bohot acha raha. Agar aap har answer me 1 practical example aur STAR formula add karein to real interview me selection ke chances 90%+ ho jayenge!',
  };
}
