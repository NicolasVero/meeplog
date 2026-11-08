import prisma from '../prisma';
import { HttpError } from '../common/errors';
import type { Play, CreatePlayInput } from './play.schema';

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

export async function createPlay(input: CreatePlayInput): Promise<Play> {
  const gameNight = await prisma.gameNight.findUnique({
    where: { id: input.gameNightId },
    select: { players: { select: { playerId: true } } },
  });

  if (!gameNight) {
    throw new HttpError(404, 'Game night not found for id ' + input.gameNightId);
  }

  const nightPlayerIds = new Set(gameNight.players.map((p) => p.playerId));
  const outsiders = input.scores.filter((s) => !nightPlayerIds.has(s.playerId)).map((s) => s.playerId);

  if (outsiders.length > 0) {
    throw new HttpError(400, 'Players not part of the game night: ' + outsiders.join(', '));
  }

  return toPlay(await createRawPlay(input));
}

export async function deletePlay(id: number) {
  await prisma.play.delete({
    where: { id },
  });
}
