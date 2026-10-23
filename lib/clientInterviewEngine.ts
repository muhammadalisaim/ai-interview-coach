'use client';

import { STARTER_QUESTIONS } from './roles';
import { confidenceScore, overallScore, getScoreVerdict } from './scoring';
import { wordsPerMinute, countFillers, countWords } from './metrics';
import { InterviewSession, Question, AnswerRecord, SessionReport } from '../types';

const STORAGE_KEY_PREFIX = 'aic_session_';
const SESSIONS_LIST_KEY = 'aic_all_sessions';

export function saveClientSession(session: InterviewSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + session.id, JSON.stringify(session));
    const listRaw = localStorage.getItem(SESSIONS_LIST_KEY);
    const list: string[] = listRaw ? JSON.parse(listRaw) : [];
    if (!list.includes(session.id)) {
      list.unshift(session.id);
      localStorage.setItem(SESSIONS_LIST_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('localStorage save error:', e);
  }
}

export function getClientSession(sessionId: string): InterviewSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + sessionId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAllClientSessions(): InterviewSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const listRaw = localStorage.getItem(SESSIONS_LIST_KEY);
    const list: string[] = listRaw ? JSON.parse(listRaw) : [];
    return list
      .map((id) => getClientSession(id))
      .filter((s): s is InterviewSession => s !== null);
  } catch {
    return [];
  }
}

export interface CreateClientSessionParams {
  role: string;
  level: 'fresher' | 'junior' | 'senior';
  count: number;
  mode: 'full' | 'practice';
}

export function createClientSession(params: CreateClientSessionParams): {
  session: InterviewSession;
  questions: Question[];
  firstQuestion: Question;
} {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const starterBank = STARTER_QUESTIONS[params.role] || STARTER_QUESTIONS.default;
  const selectedTexts = starterBank.slice(0, params.count);

  const questions: Question[] = selectedTexts.map((text, idx) => ({
    id: `q_${sessionId}_${idx + 1}`,
    sessionId,
    text,
    position: idx + 1,
    isFollowUp: false,
  }));

  const session: InterviewSession = {
    id: sessionId,
    userId: 'guest-candidate',
    role: params.role,
    level: params.level,
    questionCount: questions.length,
    status: 'in_progress',
    createdAt: new Date().toISOString(),
  };

  saveClientSession(session);

  // Store questions on window for instant retrieval
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`aic_questions_${sessionId}`, JSON.stringify(questions));
      localStorage.setItem(`aic_answers_${sessionId}`, JSON.stringify([]));
    } catch {}
  }

  return {
    session,
    questions,
    firstQuestion: questions[0],
  };
}

export function getClientQuestions(sessionId: string): Question[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`aic_questions_${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getClientAnswers(sessionId: string): AnswerRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`aic_answers_${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveClientAnswerRecord(sessionId: string, answer: AnswerRecord) {
  if (typeof window === 'undefined') return;
  try {
    const answers = getClientAnswers(sessionId);
    answers.push(answer);
    localStorage.setItem(`aic_answers_${sessionId}`, JSON.stringify(answers));
  } catch {}
}

export interface EvaluateLocalAnswerParams {
  role: string;
  level: string;
  questionText: string;
  transcript: string;
  durationSec: number;
  wpm: number;
  fillerCount: number;
}

export function evaluateAnswerLocally(params: EvaluateLocalAnswerParams) {
  const words = params.transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isVague = wordCount < 15;
  const hasExample = /for example|project|built|worked on|implemented|created|when i/i.test(params.transcript);
  const hasSTAR = /situation|task|action|result|because of that|solved|handled/i.test(params.transcript);

  // Quality score (0-10)
  let qualityScore = 7;
  if (wordCount < 10) qualityScore = 3.5;
  else if (wordCount < 25) qualityScore = 5.5;
  else if (hasExample && hasSTAR) qualityScore = 9;
  else if (hasExample) qualityScore = 8;

  // Tone score
  let toneScore = 7;
  if (/maybe|i think|sort of|not sure|i guess/i.test(params.transcript)) {
    toneScore = 6;
  } else if (params.wpm >= 110 && params.wpm <= 165 && wordCount >= 30) {
    toneScore = 9;
  }

  // English grammar & phrasing
  let englishScore = 8;
  const mistakes: { said: string; better: string }[] = [];
  if (/\bi am like\b/i.test(params.transcript)) {
    mistakes.push({ said: 'I am like', better: 'I prefer / I chose' });
  }
  if (/\bme and my friend\b/i.test(params.transcript)) {
    mistakes.push({ said: 'me and my friend', better: 'my colleague and I' });
  }
  if (/\bhe don't\b/i.test(params.transcript)) {
    mistakes.push({ said: 'he don’t', better: 'he doesn’t' });
  }
  if (mistakes.length > 0) englishScore = 6.5;

  const strengths = [];
  const improvements = [];

  if (wordCount >= 20) strengths.push('Direct response addressed the core question');
  if (hasExample) strengths.push('Included relevant real-world project context');
  if (strengths.length === 0) strengths.push('Clear articulation and professional tone');

  if (isVague) improvements.push('Expand your response with specific technical details');
  if (params.fillerCount > 3) improvements.push(`Reduce verbal filler words (detected ${params.fillerCount})`);
  if (!hasSTAR) improvements.push('Apply the STAR framework (Situation, Task, Action, Result) for higher impact');

  let followUp: string | null = null;
  if (isVague && wordCount >= 3) {
    const qLower = params.questionText.toLowerCase();
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
    better_answer: `In my role as a ${params.role}, I encountered a similar objective. Specifically, I took responsibility for the core implementation, addressed key constraints, and achieved measurable positive results.`,
    follow_up_question: followUp,
    roman_urdu_tip: isVague
      ? 'Aapka answer thora mukhtasar tha, mazeed details aur practical example add karein.'
      : 'Bohot achi koshish thi! Confidence aur clarity bohot achi rahi.',
  };
}

export function finishClientInterview(sessionId: string): SessionReport | null {
  const session = getClientSession(sessionId);
  if (!session) return null;

  const questions = getClientQuestions(sessionId);
  const answers = getClientAnswers(sessionId);

  let sumQuality = 0;
  let sumConfidence = 0;
  let sumEnglish = 0;

  for (const ans of answers) {
    const qScore = ans.evaluation.answer_quality.score;
    const tScore = ans.evaluation.tone_score;
    const eScore = ans.evaluation.english.score;
    const wCount = countWords(ans.transcript);

    const cScore = confidenceScore({
      wpm: ans.wpm,
      fillers: ans.fillerCount,
      words: wCount,
      tone: tScore,
    });

    sumQuality += qScore;
    sumConfidence += cScore;
    sumEnglish += eScore;
  }

  const ansCount = answers.length || 1;
  const avgQuality = Number((sumQuality / ansCount).toFixed(1));
  const avgConfidence = Number((sumConfidence / ansCount).toFixed(1));
  const avgEnglish = Number((sumEnglish / ansCount).toFixed(1));
  const finalOverallScore = overallScore(avgQuality, avgConfidence, avgEnglish);
  const verdict = getScoreVerdict(finalOverallScore);

  const report: SessionReport = {
    overallScore: finalOverallScore,
    qualityScore: avgQuality,
    confidenceScore: avgConfidence,
    englishScore: avgEnglish,
    verdict: verdict.label,
    topStrengths: [
      'Authentic role knowledge and relevant technical terminology',
      'Consistent conversational flow and good responsiveness',
      'Professional tone maintained throughout the mock session',
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
    answers: answers.map((a) => {
      const q = questions.find((item) => item.id === a.questionId);
      return {
        question: q || { id: a.questionId, text: 'Interview Question', position: 1 },
        answer: a,
      };
    }),
  };

  session.status = 'finished';
  session.qualityScore = avgQuality;
  session.confidenceScore = avgConfidence;
  session.englishScore = avgEnglish;
  session.overallScore = finalOverallScore;
  session.report = report;
  session.finishedAt = new Date().toISOString();

  saveClientSession(session);

  return report;
}
