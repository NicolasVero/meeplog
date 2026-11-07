import prisma from '../prisma';
import type { BoardGame } from './boardgame.schema';

export async function findAllBoardGames(limit?: number): Promise<BoardGame[]> {
  const boardGames = await prisma.boardGame.findMany({
    orderBy: [{ title: 'desc' }],
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
