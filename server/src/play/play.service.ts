import type { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { HttpError } from '../common/errors';
import { usesScores, type ScoringMode } from '../common/scoring';
import type { Play, CreatePlayInput, UpdatePlayInput } from './play.schema';

// Winners first, then best scores (cooperative and winner-only plays have no score).
const scoreOrder: Prisma.PlayScoreOrderByWithRelationInput[] = [{ won: 'desc' }, { score: { sort: 'desc', nulls: 'last' } }];

export const playInclude = {
  boardGame: true,
  scores: {
    select: { score: true, won: true, player: true },
    orderBy: scoreOrder,
  },
} as const;

function toPlay({ boardGameId, ...play }: Awaited<ReturnType<typeof createRawPlay>>): Play {
  return play;
}

type ScoreInput = CreatePlayInput['scores'][number];
type StoredScore = { playerId: number; score: number | null; won: boolean };

/**
 * Checks the score sheet against the game's scoring rule and keeps only what that rule uses:
 * scores for scored games, winner flags otherwise. A cooperative team wins or loses as a whole.
 */
async function normalizeScores(boardGameId: number, scores: ScoreInput[]): Promise<StoredScore[]> {
  const boardGame = await prisma.boardGame.findUnique({ where: { id: boardGameId }, select: { scoringMode: true } });
  if (!boardGame) {
    throw new HttpError(404, 'Board game not found for id ' + boardGameId);
  }
  const mode: ScoringMode = boardGame.scoringMode;

  if (usesScores(mode)) {
    if (scores.some((s) => s.score === null || s.score === undefined)) {
      throw new HttpError(400, 'Every player needs a score for this game');
    }
    return scores.map((s) => ({ playerId: s.playerId, score: s.score!, won: false }));
  }

  if (mode === 'COOPERATIVE' && new Set(scores.map((s) => Boolean(s.won))).size > 1) {
    throw new HttpError(400, 'In a cooperative game, the whole team wins or loses together');
  }
  return scores.map((s) => ({ playerId: s.playerId, score: null, won: Boolean(s.won) }));
}

function createRawPlay({ gameNightId, boardGameId, scores }: Omit<CreatePlayInput, 'scores'> & { scores: StoredScore[] }) {
  return prisma.play.create({
    data: {
      gameNightId,
      boardGameId,
      scores: { create: scores },
    },
    include: playInclude,
  });
}

export async function findPlayById(id: number): Promise<Play | null> {
  const play = await prisma.play.findUnique({
    where: { id },
    include: playInclude,
  });

  return play ? toPlay(play) : null;
}

async function assertPlayersInGameNight(gameNightId: number, playerIds: number[]) {
  const gameNight = await prisma.gameNight.findUnique({
    where: { id: gameNightId },
    select: { players: { select: { playerId: true } } },
  });

  if (!gameNight) {
    throw new HttpError(404, 'Game night not found for id ' + gameNightId);
  }

  const nightPlayerIds = new Set(gameNight.players.map((p) => p.playerId));
  const outsiders = playerIds.filter((id) => !nightPlayerIds.has(id));

  if (outsiders.length > 0) {
    throw new HttpError(400, 'Players not part of the game night: ' + outsiders.join(', '));
  }
}

export async function createPlay(input: CreatePlayInput): Promise<Play> {
  await assertPlayersInGameNight(
    input.gameNightId,
    input.scores.map((s) => s.playerId),
  );

  const scores = await normalizeScores(input.boardGameId, input.scores);
  return toPlay(await createRawPlay({ ...input, scores }));
}

export async function updatePlay(id: number, { boardGameId, scores }: UpdatePlayInput): Promise<Play> {
  const existing = await prisma.play.findUnique({
    where: { id },
    select: { gameNightId: true, boardGameId: true, scores: { select: { playerId: true, score: true, won: true } } },
  });

  if (!existing) {
    throw new HttpError(404, 'Play not found for id ' + id);
  }

  if (scores) {
    await assertPlayersInGameNight(
      existing.gameNightId,
      scores.map((s) => s.playerId),
    );
  }

  // A new game may use another scoring rule: the existing sheet is checked against it too.
  const newScores =
    scores || boardGameId
      ? await normalizeScores(
          boardGameId ?? existing.boardGameId,
          scores ?? existing.scores.map((s) => ({ ...s, score: s.score })),
        )
      : undefined;

  // Scores remplacés en bloc : suppression puis recréation dans la même requête (atomique)
  const play = await prisma.play.update({
    where: { id },
    data: {
      boardGameId,
      scores: newScores ? { deleteMany: {}, create: newScores } : undefined,
    },
    include: playInclude,
  });

  return toPlay(play);
}

export async function deletePlay(id: number) {
  await prisma.play.delete({
    where: { id },
  });
}
