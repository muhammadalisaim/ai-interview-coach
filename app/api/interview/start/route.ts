import { NextResponse } from 'next/server';
import { StartInterviewBody } from '@/lib/schemas';
import { QUESTIONS_SYSTEM, buildQuestionsPrompt } from '@/lib/prompts';
import { generateQuestionsWithClaude } from '@/lib/anthropic';
import { localStore } from '@/lib/supabase/storage';
import { Question, InterviewSession } from '@/types';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = StartInterviewBody.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { role, level, count, mode } = parsed.data;
    const sessionId = crypto.randomUUID();

    // Generate questions using Claude or intelligent fallback
    const prompt = buildQuestionsPrompt(role, level, count);
    const questionTexts = await generateQuestionsWithClaude(QUESTIONS_SYSTEM, prompt, {
      role,
      level,
      count,
    });

    // Save session
    const session: InterviewSession = {
      id: sessionId,
      userId: 'default-user',
      role,
      level,
      questionCount: questionTexts.length,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };
    localStore.saveSession(session);

    // Save questions
    const questionRecords: Question[] = questionTexts.map((text, idx) => ({
      id: crypto.randomUUID(),
      sessionId,
      text,
      position: idx + 1,
      isFollowUp: false,
    }));
    localStore.saveQuestions(questionRecords);

    // Return the first question
    const firstQuestion = questionRecords[0];

    return NextResponse.json({
      sessionId,
      totalQuestions: questionRecords.length,
      question: {
        id: firstQuestion.id,
        text: firstQuestion.text,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/interview/start:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
