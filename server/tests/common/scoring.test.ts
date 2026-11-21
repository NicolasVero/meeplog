import { describe, expect, it } from 'vitest';
import { compareScores, winningScore } from '../../src/common/scoring';

describe('winningScore', () => {
  it('picks the highest score by default rule', () => {
    expect(winningScore([10, 7, 12], 'HIGHEST_WINS')).toBe(12);
  });

  it('picks the lowest score for games where the lowest wins', () => {
    expect(winningScore([10, 7, 12], 'LOWEST_WINS')).toBe(7);
  });

  it('returns null without scores', () => {
    expect(winningScore([], 'HIGHEST_WINS')).toBeNull();
  });
});

describe('compareScores', () => {
  it('tells who finished ahead, depending on the rule', () => {
    expect(compareScores(10, 7, 'HIGHEST_WINS')).toBeGreaterThan(0);
    expect(compareScores(10, 7, 'LOWEST_WINS')).toBeLessThan(0);
    expect(compareScores(5, 5, 'LOWEST_WINS')).toBe(0);
  });
});
