import app from './app.ts';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer un nouveau jeu de société
  const game = await prisma.boardGame.create({
    data: {
      title: 'Les Aventuriers du Rail',
      minPlayers: 2,
      maxPlayers: 5,
      description: 'Un jeu de plateau ferroviaire stratégique et accessible.',
    },
  });

  console.log('Jeu créé avec succès :', game);

  // Récupérer tous les jeux
  const allGames = await prisma.boardGame.findMany();
  console.log('Liste des jeux en base :', allGames);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
