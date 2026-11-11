import prisma from '../prisma';
import { HttpError } from '../common/errors';
import type { Player, CreatePlayerInput, UpdatePlayerInput } from './player.schema';

export async function findAllPlayers(limit?: number): Promise<Player[]> {
  const players = await prisma.player.findMany({
    orderBy: [{ name: 'asc' }],
    take: limit,
  });

  return players;
}

export async function findPlayerById(id: number): Promise<Player | null> {
  const player = await prisma.player.findUnique({
    where: { id },
  });

  return player;
}

export async function createPlayer(player: CreatePlayerInput): Promise<Player> {
  return await prisma.player.create({
    data: player,
  });
}

export async function deletePlayer(id: number) {
  await prisma.player.delete({
    where: {
      id: id,
    },
  });
}

export async function updatePlayer(id: number, data: UpdatePlayerInput): Promise<Player> {
  return await prisma.player.update({
    where: { id },
    data,
  });
}

/** Board games the player has played, with play and win counts. */
export async function findPlayedGames(id: number) {
  const player = await prisma.player.findUnique({
    where: { id },
    select: {
      scores: {
        select: {
          score: true,
          play: {
            select: {
              boardGame: true,
              gameNight: { select: { date: true } },
              scores: { select: { score: true } },
            },
          },
        },
      },
    },
  });

  if (!player) {
    throw new HttpError(404, 'Player not found for id ' + id);
  }

  type Entry = {
    boardGame: (typeof player.scores)[number]['play']['boardGame'];
    plays: number;
    wins: number;
    lastPlayedAt: Date;
  };
  const games = new Map<number, Entry>();

  for (const { score, play } of player.scores) {
    const entry = games.get(play.boardGame.id) ?? {
      boardGame: play.boardGame,
      plays: 0,
      wins: 0,
      lastPlayedAt: play.gameNight.date,
    };
    entry.plays++;
    if (score === Math.max(...play.scores.map((s) => s.score))) entry.wins++;
    if (play.gameNight.date > entry.lastPlayedAt) entry.lastPlayedAt = play.gameNight.date;
    games.set(play.boardGame.id, entry);
  }

  return [...games.values()].sort((a, b) => b.plays - a.plays || a.boardGame.title.localeCompare(b.boardGame.title));
}
