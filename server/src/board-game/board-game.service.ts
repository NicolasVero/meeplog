import prisma from '../prisma';
import { HttpError } from '../common/errors';
import { isCompetitive, toResults, usesScores, winnerIds, type ScoringMode } from '../common/scoring';
import type { BoardGame, CreateBoardGameInput, UpdateBoardGameInput } from './board-game.schema';

export async function findAllBoardGames(limit?: number): Promise<BoardGame[]> {
  const boardGames = await prisma.boardGame.findMany({
    orderBy: [{ title: 'asc' }],
    take: limit,
  });

  return boardGames;
}

export async function findBoardGameById(id: number): Promise<BoardGame | null> {
  const boardGame = await prisma.boardGame.findUnique({
    where: { id },
  });

  return boardGame;
}

export async function createBoardGame(boardGame: CreateBoardGameInput): Promise<BoardGame> {
  return await prisma.boardGame.create({
    data: boardGame,
  });
}

export async function deleteBoardGame(id: number) {
  await prisma.boardGame.delete({
    where: {
      id: id,
    },
  });
}

export async function updateBoardGame(id: number, data: UpdateBoardGameInput): Promise<BoardGame> {
  const existing = await findBoardGameById(id);

  if (!existing) {
    throw new HttpError(404, 'Board game not found for id ' + id);
  }

  const minPlayers = data.minPlayers ?? existing.minPlayers;
  const maxPlayers = data.maxPlayers ?? existing.maxPlayers;

  if (maxPlayers < minPlayers) {
    throw new HttpError(400, 'maxPlayers must be greater than or equal to minPlayers');
  }

  if (data.scoringMode && data.scoringMode !== existing.scoringMode) {
    return await changeScoringMode(existing.id, existing.scoringMode, data);
  }

  return await prisma.boardGame.update({
    where: { id },
    data,
  });
}

/**
 * Switching rule on a game that was already played: plays without scores cannot become scored,
 * and plays moving to a rule without scores keep their winners as winner flags.
 */
async function changeScoringMode(id: number, from: ScoringMode, data: UpdateBoardGameInput): Promise<BoardGame> {
  const to = data.scoringMode!;
  const plays = await prisma.play.findMany({
    where: { boardGameId: id },
    select: { id: true, scores: { select: { score: true, won: true, player: { select: { id: true } } } } },
  });

  if (usesScores(to)) {
    if (plays.some((play) => play.scores.some((s) => s.score === null))) {
      throw new HttpError(409, 'Some plays of this game have no score: they cannot switch to a scored rule');
    }
    return await prisma.boardGame.update({ where: { id }, data });
  }

  const updates = plays.flatMap((play) => {
    const winners = winnerIds(toResults(play.scores), from);
    // A cooperative team only wins if everybody was a winner before.
    const teamWon = winners.size === play.scores.length;
    return play.scores.map((s) =>
      prisma.playScore.update({
        where: { playId_playerId: { playId: play.id, playerId: s.player.id } },
        data: { won: to === 'COOPERATIVE' ? teamWon : winners.has(s.player.id) },
      }),
    );
  });

  const [boardGame] = await prisma.$transaction([prisma.boardGame.update({ where: { id }, data }), ...updates]);
  return boardGame;
}

/** Ratings, game nights and players linked to a board game, for its detail page. */
export async function findBoardGameStats(id: number) {
  const boardGame = await prisma.boardGame.findUnique({
    where: { id },
    select: {
      scoringMode: true,
      ratings: {
        select: { value: true, updatedAt: true, player: true },
        orderBy: [{ value: 'desc' }, { player: { name: 'asc' } }],
      },
      plays: {
        select: {
          gameNight: { select: { id: true, date: true, location: true } },
          scores: { select: { score: true, won: true, player: true } },
        },
      },
    },
  });

  if (!boardGame) {
    throw new HttpError(404, 'Board game not found for id ' + id);
  }

  const { ratings, plays } = boardGame;
  const averageRating = ratings.length ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length : null;

  type NightEntry = (typeof plays)[number]['gameNight'] & { playCount: number };
  const nights = new Map<number, NightEntry>();
  type PlayerEntry = { player: (typeof plays)[number]['scores'][number]['player']; plays: number; wins: number };
  const players = new Map<number, PlayerEntry>();
  let teamWins = 0;

  for (const play of plays) {
    const night = nights.get(play.gameNight.id) ?? { ...play.gameNight, playCount: 0 };
    night.playCount++;
    nights.set(night.id, night);

    const winners = winnerIds(toResults(play.scores), boardGame.scoringMode);
    if (winners.size > 0) teamWins++;
    for (const { player } of play.scores) {
      const entry = players.get(player.id) ?? { player, plays: 0, wins: 0 };
      entry.plays++;
      if (winners.has(player.id)) entry.wins++;
      players.set(player.id, entry);
    }
  }

  return {
    averageRating,
    ratings,
    // Cooperative games: plays won by the team (null for competitive games).
    teamWins: isCompetitive(boardGame.scoringMode) ? null : teamWins,
    gameNights: [...nights.values()].sort((a, b) => b.date.getTime() - a.date.getTime()),
    players: [...players.values()].sort(
      (a, b) => b.plays - a.plays || b.wins - a.wins || a.player.name.localeCompare(b.player.name),
    ),
  };
}
