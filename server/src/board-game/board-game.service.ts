import prisma from '../prisma';
import { HttpError } from '../common/errors';
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

  return await prisma.boardGame.update({
    where: { id },
    data,
  });
}

/** Ratings, game nights and players linked to a board game, for its detail page. */
export async function findBoardGameStats(id: number) {
  const boardGame = await prisma.boardGame.findUnique({
    where: { id },
    select: {
      ratings: {
        select: { value: true, updatedAt: true, player: true },
        orderBy: [{ value: 'desc' }, { player: { name: 'asc' } }],
      },
      plays: {
        select: {
          gameNight: { select: { id: true, date: true, location: true } },
          scores: { select: { score: true, player: true } },
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

  for (const play of plays) {
    const night = nights.get(play.gameNight.id) ?? { ...play.gameNight, playCount: 0 };
    night.playCount++;
    nights.set(night.id, night);

    const best = Math.max(...play.scores.map((s) => s.score));
    for (const { player, score } of play.scores) {
      const entry = players.get(player.id) ?? { player, plays: 0, wins: 0 };
      entry.plays++;
      if (score === best) entry.wins++;
      players.set(player.id, entry);
    }
  }

  return {
    averageRating,
    ratings,
    gameNights: [...nights.values()].sort((a, b) => b.date.getTime() - a.date.getTime()),
    players: [...players.values()].sort(
      (a, b) => b.plays - a.plays || b.wins - a.wins || a.player.name.localeCompare(b.player.name),
    ),
  };
}
