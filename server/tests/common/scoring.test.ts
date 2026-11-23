import { describe, expect, it } from 'vitest';
import { compareResults, winnerIds, winningScore, type PlayResult } from '../../src/common/scoring';

const result = (playerId: number, score: number | null, won = false): PlayResult => ({ playerId, score, won });

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

describe('winnerIds', () => {
  const sheet = [result(1, 10), result(2, 7), result(3, 10)];

  it('returns every player tied on the best score', () => {
    expect([...winnerIds(sheet, 'HIGHEST_WINS')]).toEqual([1, 3]);
    expect([...winnerIds(sheet, 'LOWEST_WINS')]).toEqual([2]);
  });

  it('uses the winner flags for games without scores', () => {
    expect([...winnerIds([result(1, null, false), result(2, null, true)], 'WINNER_ONLY')]).toEqual([2]);
  });

  it('makes the whole team win or lose in a cooperative game', () => {
    expect(winnerIds([result(1, null, true), result(2, null, true)], 'COOPERATIVE').size).toBe(2);
    expect(winnerIds([result(1, null, false), result(2, null, false)], 'COOPERATIVE').size).toBe(0);
  });
});

describe('compareResults', () => {
  it('tells who finished ahead, depending on the rule', () => {
    expect(compareResults(result(1, 10), result(2, 7), 'HIGHEST_WINS')).toBeGreaterThan(0);
    expect(compareResults(result(1, 10), result(2, 7), 'LOWEST_WINS')).toBeLessThan(0);
    expect(compareResults(result(1, 5), result(2, 5), 'LOWEST_WINS')).toBe(0);
  });

  it('puts a winner ahead of a loser, and two losers level, without scores', () => {
    expect(compareResults(result(1, null, true), result(2, null), 'WINNER_ONLY')).toBeGreaterThan(0);
    expect(compareResults(result(1, null), result(2, null), 'WINNER_ONLY')).toBe(0);
  });
});
