// Données de test pour les fichiers requests/*.http.
// À lancer sur une base vide (npm run db:reset) pour avoir des ids prévisibles :
//   Joueurs : 1 Alice, 2 Bob, 3 Charlie, 4 Intrus
//   Jeux    : 1 Catan, 2 Azul
//   Soirée  : 1 avec Alice, Bob et Charlie
//   Partie  : 1 de Catan dans la soirée 1 (Alice 10, Bob 7, Charlie 8)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.player.createMany({
    data: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }, { name: 'Intrus' }],
  });

  await prisma.boardGame.createMany({
    data: [
      { title: 'Catan', minPlayers: 3, maxPlayers: 4 },
      { title: 'Azul', minPlayers: 2, maxPlayers: 4 },
    ],
  });

  await prisma.gameNight.create({
    data: {
      date: new Date('2026-11-01T20:00:00Z'),
      location: 'Chez Nico',
      players: { create: [{ playerId: 1 }, { playerId: 2 }, { playerId: 3 }] },
    },
  });

  await prisma.play.create({
    data: {
      gameNightId: 1,
      boardGameId: 1,
      scores: {
        create: [
          { playerId: 1, score: 10 },
          { playerId: 2, score: 7 },
          { playerId: 3, score: 8 },
        ],
      },
    },
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
