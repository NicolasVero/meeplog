import prisma from '../prisma';
import type { BoardGame, CreateBoardGameInput } from './board-game.schema';

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
