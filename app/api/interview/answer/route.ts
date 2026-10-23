import { NextResponse } from 'next/server';
import { AnswerBody } from '@/lib/schemas';
import { EVALUATOR_SYSTEM, buildEvaluationPrompt } from '@/lib/prompts';
import { evaluateAnswerWithClaude } from '@/lib/anthropic';
import { wordsPerMinute, countFillers } from '@/lib/metrics';
import { localStore } from '@/lib/supabase/storage';
import { AnswerRecord, Question } from '@/types';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = AnswerBody.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { sessionId, questionId, transcript, durationSec } = parsed.data;

    const session = localStore.getSessionById(sessionId);
    const questions = localStore.getQuestionsBySession(sessionId);
    const existingAnswers = localStore.getAnswersBySession(sessionId);
    const currentQuestion = questions.find((q) => q.id === questionId);

    if (!session || !currentQuestion) {
      return NextResponse.json({ error: 'Session or question not found' }, { status: 404 });
    }

    const wpm = parsed.data.wpm ?? wordsPerMinute(transcript, durationSec);
    const fillerCount = parsed.data.fillerCount ?? countFillers(transcript).total;

    // Evaluate answer with Claude / evaluator engine
    const evaluationPrompt = buildEvaluationPrompt({
      role: session.role,
      level: session.level,
      question: currentQuestion.text,
      transcript,
      durationSec,
      wpm,
      fillerCount,
    });

    const evaluation = await evaluateAnswerWithClaude(EVALUATOR_SYSTEM, evaluationPrompt, {
      role: session.role,
      level: session.level,
      question: currentQuestion.text,
      transcript,
      durationSec,
      wpm,
      fillerCount,
    });

    // Save answer record
    const answerRecord: AnswerRecord = {
      id: crypto.randomUUID(),
      sessionId,
      questionId,
      transcript,
      durationSec,
      wpm,
      fillerCount,
      evaluation,
      createdAt: new Date().toISOString(),
    };
    localStore.saveAnswer(answerRecord);

    // Track all question IDs answered so far to PREVENT ANY QUESTION REPEATS
    const answeredIds = new Set(existingAnswers.map((a) => a.questionId));
    answeredIds.add(questionId);

    // Track all texts already asked to avoid duplicate phrasing
    const askedTexts = new Set(questions.map((q) => q.text.toLowerCase().trim()));

    // Total follow-ups already in session
    const followUpsCount = questions.filter((q) => q.isFollowUp).length;

    // Only allow max 1 follow-up across a 5-question interview
    const shouldAskFollowUp =
      !currentQuestion.isFollowUp &&
      evaluation.follow_up_question &&
      followUpsCount < 1 &&
      !askedTexts.has(evaluation.follow_up_question.toLowerCase().trim());

    if (shouldAskFollowUp && evaluation.follow_up_question) {
      const followUpQuestion: Question = {
        id: crypto.randomUUID(),
        sessionId,
        text: evaluation.follow_up_question,
        position: currentQuestion.position,
        isFollowUp: true,
      };
      localStore.saveQuestion(followUpQuestion);

      return NextResponse.json({
        evaluation,
        followUp: {
          id: followUpQuestion.id,
          text: followUpQuestion.text,
        },
        nextQuestion: null,
      });
    }

    // Find the next UNANSWERED scheduled main question
    const remainingQuestions = questions
      .filter((q) => !q.isFollowUp && !answeredIds.has(q.id))
      .sort((a, b) => a.position - b.position);

    const nextQuestion = remainingQuestions[0] || null;

    return NextResponse.json({
      evaluation,
      followUp: null,
      nextQuestion: nextQuestion
        ? {
            id: nextQuestion.id,
            text: nextQuestion.text,
          }
        : null,
    });
  } catch (err: any) {
    console.error('Error in /api/interview/answer:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
