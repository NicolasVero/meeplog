import { describe, expect, it } from 'vitest';
import { boardGame, play, player } from '../fixtures';
import {
  playedScores,
  scoreSheet,
  toFormValues,
  toInput,
  validate,
  type FormValues,
} from '../../src/components/PlayForm.logic';

const azul = boardGame({ id: 7, title: 'Azul', minPlayers: 2, maxPlayers: 4 });
const codenames = boardGame({ id: 8, title: 'Codenames', minPlayers: 2, maxPlayers: 8, scoringMode: 'WINNER_ONLY' });
const pandemic = boardGame({ id: 9, title: 'Pandemic', minPlayers: 2, maxPlayers: 4, scoringMode: 'COOPERATIVE' });

const values = (overrides: Partial<FormValues> = {}): FormValues => ({
  boardGameId: '7',
  scores: {},
  played: [],
  winners: [],
  teamWon: false,
  ...overrides,
});

describe('playedScores', () => {
  it('ignores players whose score was left empty', () => {
    expect(playedScores(values({ scores: { 1: 12, 2: '', 3: 0 } }))).toEqual([
      { playerId: 1, score: 12 },
      { playerId: 3, score: 0 }, // 0 is a real score, not an empty field
    ]);
  });
});

describe('scoreSheet', () => {
  it('sends the winners of a winner-only game', () => {
    expect(scoreSheet(values({ played: [1, 2, 3], winners: [2] }), 'WINNER_ONLY')).toEqual([
      { playerId: 1, won: false },
      { playerId: 2, won: true },
      { playerId: 3, won: false },
    ]);
  });

  it('gives every player the team result in a cooperative game', () => {
    expect(scoreSheet(values({ played: [1, 2], teamWon: true }), 'COOPERATIVE')).toEqual([
      { playerId: 1, won: true },
      { playerId: 2, won: true },
    ]);
  });
});

describe('validate', () => {
  it('requires a game and at least one score', () => {
    expect(validate(values({ boardGameId: null }), undefined)).toEqual({
      boardGameId: 'Choisissez un jeu',
      scores: 'Saisissez le score d’au moins un joueur',
    });
  });

  it('accepts a valid play', () => {
    expect(validate(values({ scores: { 1: 10, 2: 8 } }), azul)).toEqual({});
  });

  it('rejects a player count outside the game limits', () => {
    expect(validate(values({ scores: { 1: 10 } }), azul).scores).toBe('Azul se joue de 2 à 4 joueurs (1 saisis)');
    expect(validate(values({ scores: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 } }), azul).scores).toMatch(/5 saisis/);
  });

  it('skips the player count check while the game is unknown', () => {
    expect(validate(values({ scores: { 1: 10 } }), undefined)).toEqual({});
  });

  it('requires a winner in a winner-only game', () => {
    expect(validate(values({ boardGameId: '8', played: [1, 2] }), codenames).scores).toBe('Désignez au moins un gagnant');
    expect(validate(values({ boardGameId: '8', played: [1, 2], winners: [1] }), codenames)).toEqual({});
  });

  it('accepts a lost cooperative game', () => {
    expect(validate(values({ boardGameId: '9', played: [1, 2] }), pandemic)).toEqual({});
  });
});

describe('toFormValues / toInput', () => {
  it('starts with every player of the night when creating a play', () => {
    expect(toFormValues(undefined, [1, 2])).toEqual(values({ boardGameId: null, played: [1, 2] }));
  });

  it('round-trips an existing play', () => {
    const existing = play(
      [
        [player(1), 15],
        [player(2), 9],
      ],
      azul,
    );
    const formValues = toFormValues(existing);

    expect(formValues).toEqual(values({ scores: { 1: 15, 2: 9 }, played: [1, 2] }));
    expect(toInput(42, formValues, 'HIGHEST_WINS')).toEqual({
      gameNightId: 42,
      boardGameId: 7,
      scores: [
        { playerId: 1, score: 15 },
        { playerId: 2, score: 9 },
      ],
    });
  });
});
