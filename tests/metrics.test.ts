import { describe, it, expect } from 'vitest';
import { countFillers, wordsPerMinute, countWords } from '../lib/metrics';
import { paceScore, fillerScore, confidenceScore, overallScore } from '../lib/scoring';

describe('metrics & scoring', () => {
  it('counts filler words', () => {
    const result = countFillers('Um I think, you know, it was basically fine');
    expect(result.total).toBe(3);
    expect(result.detail['um']).toBe(1);
    expect(result.detail['you know']).toBe(1);
    expect(result.detail['basically']).toBe(1);
  });

  it('calculates words per minute', () => {
    expect(wordsPerMinute('one two three four five six', 3)).toBe(120);
    expect(wordsPerMinute('', 10)).toBe(0);
    expect(wordsPerMinute('hello world', 0)).toBe(0);
  });

  it('gives full pace score in the normal range', () => {
    expect(paceScore(140)).toBe(10);
    expect(paceScore(110)).toBe(10);
    expect(paceScore(170)).toBe(10);
    expect(paceScore(60)).toBe(5);
  });

  it('calculates filler score properly', () => {
    // 0 fillers in 100 words -> 10
    expect(fillerScore(0, 100)).toBe(10);
    // 2 fillers in 100 words -> 10 - 3 = 7
    expect(fillerScore(2, 100)).toBe(7);
  });

  it('computes confidence score and overall score accurately', () => {
    // wpm = 140 (paceScore 10), fillers = 0 (fillerScore 10), words = 100, tone = 8
    // confidence = 0.35 * 10 + 0.35 * 10 + 0.3 * 8 = 3.5 + 3.5 + 2.4 = 9.4
    const conf = confidenceScore({ wpm: 140, fillers: 0, words: 100, tone: 8 });
    expect(conf).toBe(9.4);

    // overallScore: 0.4 * 8 + 0.3 * 9.4 + 0.3 * 9 = 3.2 + 2.82 + 2.7 = 8.72 * 10 = 87
    const finalScore = overallScore(8, 9.4, 9);
    expect(finalScore).toBe(87);
  });
});
