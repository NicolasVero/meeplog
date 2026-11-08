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
