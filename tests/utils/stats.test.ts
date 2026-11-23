import { describe, expect, it } from 'vitest';
import { boardGame, play, player } from '../fixtures';
import { mostPlayedGames, standings, winnersOf } from '../../src/utils/stats';

const alice = player(1, 'Alice');
const bob = player(2, 'Bob');
const chloe = player(3, 'Chloé');

describe('winnersOf', () => {
  it('returns the player with the highest score', () => {
    expect(
      winnersOf(
        play([
          [alice, 12],
          [bob, 30],
          [chloe, 7],
        ]),
      ),
    ).toEqual([bob.id]);
  });

  it('returns the player with the lowest score when the lowest score wins', () => {
    expect(
      winnersOf(
        play(
          [
            [alice, 12],
            [bob, 30],
            [chloe, 7],
          ],
          boardGame({ scoringMode: 'LOWEST_WINS' }),
        ),
      ),
    ).toEqual([chloe.id]);
  });

  it('returns every player tied for first place', () => {
    expect(
      winnersOf(
        play([
          [alice, 20],
          [bob, 20],
          [chloe, 3],
        ]),
      ),
    ).toEqual([alice.id, bob.id]);
  });

  it('handles negative scores', () => {
    expect(
      winnersOf(
        play([
          [alice, -5],
          [bob, -2],
        ]),
      ),
    ).toEqual([bob.id]);
  });

  it('returns nobody for a play without scores', () => {
    expect(winnersOf(play([]))).toEqual([]);
  });
});

describe('winnersOf without scores', () => {
  const marked = (game: Parameters<typeof play>[1], wonIds: number[]) => {
    const p = play(
      [
        [alice, 0],
        [bob, 0],
        [chloe, 0],
      ],
      game,
    );
    return { ...p, scores: p.scores.map((s) => ({ ...s, score: null, won: wonIds.includes(s.player.id) })) };
  };

  it('returns the players marked as winners', () => {
    expect(winnersOf(marked(boardGame({ scoringMode: 'WINNER_ONLY' }), [bob.id]))).toEqual([bob.id]);
  });

  it('returns the whole team of a won cooperative game, nobody when lost', () => {
    const coop = boardGame({ scoringMode: 'COOPERATIVE' });
    expect(winnersOf(marked(coop, [alice.id, bob.id, chloe.id]))).toHaveLength(3);
    expect(winnersOf(marked(coop, []))).toEqual([]);
  });

  it('leaves cooperative games out of the standings', () => {
    expect(standings([marked(boardGame({ scoringMode: 'COOPERATIVE' }), [alice.id, bob.id, chloe.id])])).toEqual([]);
  });
});

describe('standings', () => {
  it('counts wins and plays per player, best first', () => {
    const result = standings([
      play([
        [alice, 10],
        [bob, 5],
      ]),
      play([
        [alice, 10],
        [bob, 5],
        [chloe, 1],
      ]),
      play([
        [bob, 9],
        [chloe, 2],
      ]),
    ]);

    expect(result.map((s) => [s.player.name, s.wins, s.plays])).toEqual([
      ['Alice', 2, 2],
      ['Bob', 1, 3],
      ['Chloé', 0, 2],
    ]);
  });

  it('counts a tie as a win for each tied player', () => {
    const result = standings([
      play([
        [alice, 4],
        [bob, 4],
      ]),
    ]);
    expect(result.every((s) => s.wins === 1)).toBe(true);
  });

  it('breaks equal wins by win rate, then by name', () => {
    const result = standings([
      play([
        [bob, 1],
        [alice, 0],
      ]), // Bob 1/1
      play([
        [chloe, 1],
        [alice, 0],
      ]), // Chloé 1/1, Alice 0/2
      play([
        [alice, 1],
        [player(4, 'David'), 0],
      ]), // Alice 1/3
    ]);

    expect(result.map((s) => s.player.name)).toEqual(['Bob', 'Chloé', 'Alice', 'David']);
  });

  it('returns an empty list without plays', () => {
    expect(standings([])).toEqual([]);
  });
});

describe('mostPlayedGames', () => {
  it('counts plays per game, most played first, then by title', () => {
    const azul = boardGame({ id: 1, title: 'Azul' });
    const catan = boardGame({ id: 2, title: 'Catan' });
    const dixit = boardGame({ id: 3, title: 'Dixit' });

    const result = mostPlayedGames([
      play([[alice, 1]], dixit),
      play([[alice, 1]], catan),
      play([[alice, 1]], dixit),
      play([[alice, 1]], azul),
    ]);

    expect(result).toEqual([
      { title: 'Dixit', plays: 2 },
      { title: 'Azul', plays: 1 },
      { title: 'Catan', plays: 1 },
    ]);
  });
});
