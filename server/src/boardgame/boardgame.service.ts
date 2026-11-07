import prisma from '../prisma';

export async function findAllBoardGames(limit?: number) {
  const boardGames = await prisma.boardGame.findMany({
    orderBy: [{ title: 'desc' }],
  });

  return boardGames;
}

export async function findBoardGameById(id: number) {
  const boardGame = await prisma.boardGame.findUnique({
    where: { id },
  });

  return boardGame;
}
