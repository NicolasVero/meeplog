import prisma from '../prisma';
import { HttpError } from '../common/errors';
import { compareScores, winningScore } from '../common/scoring';
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
    if (score === winningScore(play.scores.map((s) => s.score), play.boardGame.scoringMode)) entry.wins++;
    if (play.gameNight.date > entry.lastPlayedAt) entry.lastPlayedAt = play.gameNight.date;
    games.set(play.boardGame.id, entry);
  }

  return [...games.values()].sort((a, b) => b.plays - a.plays || a.boardGame.title.localeCompare(b.boardGame.title));
}

export type LeaderboardEntry = { player: Player; plays: number; wins: number; winRate: number };

/** Plays and wins of every player who played at least once, best first. */
export async function findLeaderboard(): Promise<LeaderboardEntry[]> {
  const plays = await prisma.play.findMany({
    select: {
      boardGame: { select: { scoringMode: true } },
      scores: { select: { score: true, player: true } },
    },
  });

  const byPlayer = new Map<number, LeaderboardEntry>();
  for (const play of plays) {
    const best = winningScore(play.scores.map((s) => s.score), play.boardGame.scoringMode);
    for (const { player, score } of play.scores) {
      const entry = byPlayer.get(player.id) ?? { player, plays: 0, wins: 0, winRate: 0 };
      entry.plays++;
      if (score === best) entry.wins++;
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

/** Head-to-head record against each opponent met in a play: who finished ahead of whom. */
export async function findRivals(id: number): Promise<Rival[]> {
  if (!(await findPlayerById(id))) {
    throw new HttpError(404, 'Player not found for id ' + id);
  }

  const plays = await prisma.play.findMany({
    where: { scores: { some: { playerId: id } } },
    select: {
      boardGame: { select: { scoringMode: true } },
      scores: { select: { score: true, player: true } },
    },
  });

  const rivals = new Map<number, Rival>();
  for (const play of plays) {
    const mine = play.scores.find((s) => s.player.id === id)!.score;
    for (const { player, score } of play.scores) {
      if (player.id === id) continue;
      const rival = rivals.get(player.id) ?? { opponent: player, plays: 0, wins: 0, losses: 0, ties: 0 };
      rival.plays++;
      const result = compareScores(mine, score, play.boardGame.scoringMode);
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
