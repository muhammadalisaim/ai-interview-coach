import { NextResponse } from 'next/server';
import { FinishInterviewBody } from '@/lib/schemas';
import { SUMMARY_SYSTEM, buildSummaryPrompt } from '@/lib/prompts';
import { summarizeSessionWithClaude } from '@/lib/anthropic';
import { confidenceScore, overallScore, getScoreVerdict } from '@/lib/scoring';
import { countWords } from '@/lib/metrics';
import { localStore } from '@/lib/supabase/storage';
import { SessionReport } from '@/types';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = FinishInterviewBody.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { sessionId } = parsed.data;
    const session = localStore.getSessionById(sessionId);
    const questions = localStore.getQuestionsBySession(sessionId);
    const answers = localStore.getAnswersBySession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (answers.length === 0) {
      // Finished with 0 answers
      session.status = 'finished';
      session.finishedAt = new Date().toISOString();
      session.overallScore = 0;
      localStore.saveSession(session);
      return NextResponse.json({ ok: true, sessionId, overallScore: 0 });
    }

    // Calculate aggregated scores from all answers
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

    const avgQuality = Number((sumQuality / answers.length).toFixed(1));
    const avgConfidence = Number((sumConfidence / answers.length).toFixed(1));
    const avgEnglish = Number((sumEnglish / answers.length).toFixed(1));
    const finalOverallScore = overallScore(avgQuality, avgConfidence, avgEnglish);
    const verdict = getScoreVerdict(finalOverallScore);

    // Call Claude for synthesis
    const summaryPrompt = buildSummaryPrompt({
      role: session.role,
      level: session.level,
      overallScore: finalOverallScore,
      qualityScore: avgQuality,
      confidenceScore: avgConfidence,
      englishScore: avgEnglish,
      answers: answers.map((a) => {
        const q = questions.find((item) => item.id === a.questionId);
        return {
          question: q?.text || 'Question',
          transcript: a.transcript,
          score: a.evaluation.answer_quality.score,
        };
      }),
    });

    const aiSummary = await summarizeSessionWithClaude(SUMMARY_SYSTEM, summaryPrompt, {
      role: session.role,
      level: session.level,
      overallScore: finalOverallScore,
    });

    const report: SessionReport = {
      overallScore: finalOverallScore,
      qualityScore: avgQuality,
      confidenceScore: avgConfidence,
      englishScore: avgEnglish,
      verdict: verdict.label,
      topStrengths: aiSummary.topStrengths,
      topImprovements: aiSummary.topImprovements,
      sevenDayPlan: aiSummary.sevenDayPlan,
      romanUrduSummary: aiSummary.romanUrduSummary,
      answers: answers.map((a) => {
        const q = questions.find((item) => item.id === a.questionId);
        return {
          question: q || { id: a.questionId, text: 'Interview Question', position: 1 },
          answer: a,
        };
      }),
    };

    // Update and persist session
    session.status = 'finished';
    session.qualityScore = avgQuality;
    session.confidenceScore = avgConfidence;
    session.englishScore = avgEnglish;
    session.overallScore = finalOverallScore;
    session.report = report;
    session.finishedAt = new Date().toISOString();

    localStore.saveSession(session);

    return NextResponse.json({
      ok: true,
      sessionId,
      overallScore: finalOverallScore,
      report,
    });
  } catch (err: any) {
    console.error('Error in /api/interview/finish:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
