import prisma from '../prisma';
import { HttpError } from '../common/errors';
import { playInclude } from '../play/play.service';
import type { GameNight, CreateGameNightInput } from './game-night.schema';

const includePlayers = {
  players: {
    include: { player: true },
    orderBy: { player: { name: 'asc' } },
  },
  plays: {
    include: playInclude,
    orderBy: { createdAt: 'asc' },
  },
} as const;

type GameNightWithPlayers = NonNullable<Awaited<ReturnType<typeof findRawGameNightById>>>;

function findRawGameNightById(id: number) {
  return prisma.gameNight.findUnique({
    where: { id },
    include: includePlayers,
  });
}

function toGameNight({ players, plays, ...gameNight }: GameNightWithPlayers): GameNight {
  return {
    ...gameNight,
    players: players.map((p) => p.player),
    plays: plays.map(({ boardGameId, ...play }) => play),
  };
}

export async function findAllGameNights(limit?: number): Promise<GameNight[]> {
  const gameNights = await prisma.gameNight.findMany({
    orderBy: [{ date: 'desc' }],
    take: limit,
    include: includePlayers,
  });

  return gameNights.map(toGameNight);
}

export async function findGameNightById(id: number): Promise<GameNight | null> {
  const gameNight = await findRawGameNightById(id);

  return gameNight ? toGameNight(gameNight) : null;
}

export async function createGameNight({ playerIds, ...data }: CreateGameNightInput): Promise<GameNight> {
  const gameNight = await prisma.gameNight.create({
    data: {
      ...data,
      players: {
        create: playerIds.map((playerId) => ({ playerId })),
      },
    },
    include: includePlayers,
  });

  return toGameNight(gameNight);
}

export async function deleteGameNight(id: number) {
  await prisma.gameNight.delete({
    where: { id },
  });
}

export async function addPlayerToGameNight(gameNightId: number, playerId: number) {
  await prisma.gameNightPlayer.create({
    data: { gameNightId, playerId },
  });
}

export async function removePlayerFromGameNight(gameNightId: number, playerId: number) {
  const scoreCount = await prisma.playScore.count({
    where: { playerId, play: { gameNightId } },
  });

  if (scoreCount > 0) {
    throw new HttpError(409, 'Player has scores in this game night');
  }

  await prisma.gameNightPlayer.delete({
    where: { gameNightId_playerId: { gameNightId, playerId } },
  });
}
