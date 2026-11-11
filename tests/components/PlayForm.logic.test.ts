import { describe, expect, it } from 'vitest';
import { boardGame, play, player } from '../fixtures';
import { playedScores, toFormValues, toInput, validate } from '../../src/components/PlayForm.logic';

const azul = boardGame({ id: 7, title: 'Azul', minPlayers: 2, maxPlayers: 4 });

describe('playedScores', () => {
  it('ignores players whose score was left empty', () => {
    expect(playedScores({ boardGameId: '7', scores: { 1: 12, 2: '', 3: 0 } })).toEqual([
      { playerId: 1, score: 12 },
      { playerId: 3, score: 0 }, // 0 is a real score, not an empty field
    ]);
  });
});

describe('validate', () => {
  it('requires a game and at least one score', () => {
    expect(validate({ boardGameId: null, scores: {} }, undefined)).toEqual({
      boardGameId: 'Choisissez un jeu',
      scores: 'Saisissez le score d’au moins un joueur',
    });
  });

  it('accepts a valid play', () => {
    expect(validate({ boardGameId: '7', scores: { 1: 10, 2: 8 } }, azul)).toEqual({});
  });

  it('rejects a player count outside the game limits', () => {
    expect(validate({ boardGameId: '7', scores: { 1: 10 } }, azul).scores).toBe('Azul se joue de 2 à 4 joueurs (1 saisis)');
    expect(validate({ boardGameId: '7', scores: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 } }, azul).scores).toMatch(/5 saisis/);
  });

  it('skips the player count check while the game is unknown', () => {
    expect(validate({ boardGameId: '7', scores: { 1: 10 } }, undefined)).toEqual({});
  });
});

describe('toFormValues / toInput', () => {
  it('starts empty when creating a play', () => {
    expect(toFormValues()).toEqual({ boardGameId: null, scores: {} });
  });

  it('round-trips an existing play', () => {
    const existing = play(
      [
        [player(1), 15],
        [player(2), 9],
      ],
      azul,
    );
    const values = toFormValues(existing);

    expect(values).toEqual({ boardGameId: '7', scores: { 1: 15, 2: 9 } });
    expect(toInput(42, values)).toEqual({
      gameNightId: 42,
      boardGameId: 7,
      scores: [
        { playerId: 1, score: 15 },
        { playerId: 2, score: 9 },
      ],
    });
  });
});
