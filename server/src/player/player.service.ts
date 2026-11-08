import prisma from '../prisma';
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
