import prisma from '../prisma';
import { HttpError } from '../common/errors';
import { compareResults, toResults, winnerIds } from '../common/scoring';
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
          play: {
            select: {
              boardGame: true,
              gameNight: { select: { date: true } },
              scores: { select: { score: true, won: true, player: { select: { id: true } } } },
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

  for (const { play } of player.scores) {
    const entry = games.get(play.boardGame.id) ?? {
      boardGame: play.boardGame,
      plays: 0,
      wins: 0,
      lastPlayedAt: play.gameNight.date,
    };
    entry.plays++;
    if (winnerIds(toResults(play.scores), play.boardGame.scoringMode).has(id)) entry.wins++;
    if (play.gameNight.date > entry.lastPlayedAt) entry.lastPlayedAt = play.gameNight.date;
    games.set(play.boardGame.id, entry);
  }

  return [...games.values()].sort((a, b) => b.plays - a.plays || a.boardGame.title.localeCompare(b.boardGame.title));
}

export type LeaderboardEntry = { player: Player; plays: number; wins: number; winRate: number };

/** Plays and wins of every player in competitive games (cooperative ones are left out), best first. */
export async function findLeaderboard(): Promise<LeaderboardEntry[]> {
  const plays = await prisma.play.findMany({
    where: { boardGame: { scoringMode: { not: 'COOPERATIVE' } } },
    select: {
      boardGame: { select: { scoringMode: true } },
      scores: { select: { score: true, won: true, player: true } },
    },
  });

  const byPlayer = new Map<number, LeaderboardEntry>();
  for (const play of plays) {
    const winners = winnerIds(toResults(play.scores), play.boardGame.scoringMode);
    for (const { player } of play.scores) {
      const entry = byPlayer.get(player.id) ?? { player, plays: 0, wins: 0, winRate: 0 };
      entry.plays++;
      if (winners.has(player.id)) entry.wins++;
      byPlayer.set(player.id, entry);
    }
  }

  return [...byPlayer.values()]
    .map((entry) => ({ ...entry, winRate: entry.wins / entry.plays }))
    .sort(
      (a, b) => b.wins - a.wins || b.winRate - a.winRate || a.player.name.localeCompare(b.player.name),
    );
}

export type Rival = { opponent: Player; plays: number; wins: number; losses: number; ties: number };

/** Head-to-head record against each opponent met in a competitive play: who finished ahead of whom. */
export async function findRivals(id: number): Promise<Rival[]> {
  if (!(await findPlayerById(id))) {
    throw new HttpError(404, 'Player not found for id ' + id);
  }

  const plays = await prisma.play.findMany({
    where: { scores: { some: { playerId: id } }, boardGame: { scoringMode: { not: 'COOPERATIVE' } } },
    select: {
      boardGame: { select: { scoringMode: true } },
      scores: { select: { score: true, won: true, player: true } },
    },
  });

  const rivals = new Map<number, Rival>();
  for (const play of plays) {
    const results = toResults(play.scores);
    const mine = results.find((r) => r.playerId === id)!;
    for (const [i, { player }] of play.scores.entries()) {
      if (player.id === id) continue;
      const rival = rivals.get(player.id) ?? { opponent: player, plays: 0, wins: 0, losses: 0, ties: 0 };
      rival.plays++;
      const result = compareResults(mine, results[i], play.boardGame.scoringMode);
      if (result > 0) rival.wins++;
      else if (result < 0) rival.losses++;
      else rival.ties++;
      rivals.set(player.id, rival);
    }
  }

  return [...rivals.values()].sort(
    (a, b) => b.plays - a.plays || a.opponent.name.localeCompare(b.opponent.name),
  );
}
