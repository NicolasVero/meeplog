import prisma from '../prisma';
import { HttpError } from '../common/errors';

const ratingSelect = { value: true, updatedAt: true, boardGame: true } as const;

async function assertPlayerExists(playerId: number) {
  const player = await prisma.player.findUnique({ where: { id: playerId }, select: { id: true } });
  if (!player) throw new HttpError(404, 'Player not found for id ' + playerId);
}

export async function findRatingsByPlayer(playerId: number) {
  await assertPlayerExists(playerId);
  return prisma.rating.findMany({
    where: { playerId },
    select: ratingSelect,
    orderBy: [{ value: 'desc' }, { boardGame: { title: 'asc' } }],
  });
}

export async function upsertRating(playerId: number, boardGameId: number, value: number) {
  return prisma.rating.upsert({
    where: { playerId_boardGameId: { playerId, boardGameId } },
    create: { playerId, boardGameId, value },
    update: { value },
    select: ratingSelect,
  });
}

export async function deleteRating(playerId: number, boardGameId: number) {
  await prisma.rating.delete({
    where: { playerId_boardGameId: { playerId, boardGameId } },
  });
}
