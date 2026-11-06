-- CreateTable
CREATE TABLE "BoardGame" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardGame_pkey" PRIMARY KEY ("id")
);
