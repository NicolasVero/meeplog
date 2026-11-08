import prisma from '../prisma';
import { HttpError } from '../common/errors';
import type { Play, CreatePlayInput, UpdatePlayInput } from './play.schema';

export const playInclude = {
  boardGame: true,
  scores: {
    select: { score: true, player: true },
    orderBy: { score: 'desc' },
  },
} as const;

function toPlay({ boardGameId, ...play }: Awaited<ReturnType<typeof createRawPlay>>): Play {
  return play;
}

function createRawPlay({ gameNightId, boardGameId, scores }: CreatePlayInput) {
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

  return toPlay(await createRawPlay(input));
}

export async function updatePlay(id: number, { boardGameId, scores }: UpdatePlayInput): Promise<Play> {
  const existing = await prisma.play.findUnique({
    where: { id },
    select: { gameNightId: true },
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

  // Scores remplacés en bloc : suppression puis recréation dans la même requête (atomique)
  const play = await prisma.play.update({
    where: { id },
    data: {
      boardGameId,
      scores: scores ? { deleteMany: {}, create: scores } : undefined,
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
