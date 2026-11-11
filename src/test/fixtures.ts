import type { BoardGame, Play, Player } from '../api/types';

// Small builders so each test only spells out what matters to it.

export function player(id: number, name = `Joueur ${id}`): Player {
  return { id, name, createdAt: '2026-01-01T00:00:00.000Z' };
}

export function boardGame(overrides: Partial<BoardGame> = {}): BoardGame {
  return {
    id: 1,
    title: 'Azul',
    minPlayers: 2,
    maxPlayers: 4,
    description: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    bggId: null,
    yearPublished: null,
    playingTime: null,
    thumbnailUrl: null,
    imageUrl: null,
    bggRating: null,
    bggSyncedAt: null,
    ...overrides,
  };
}

let nextPlayId = 1;

/** A play of `game` where each [player, score] pair is one line of the score sheet. */
export function play(scores: [Player, number][], game: BoardGame = boardGame()): Play {
  return {
    id: nextPlayId++,
    gameNightId: 1,
    createdAt: '2026-01-01T20:00:00.000Z',
    boardGame: game,
    scores: scores.map(([p, score]) => ({ player: p, score })),
  };
}
