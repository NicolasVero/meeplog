-- CreateEnum
CREATE TYPE "ScoringMode" AS ENUM ('HIGHEST_WINS', 'LOWEST_WINS');

-- AlterTable
ALTER TABLE "BoardGame" ADD COLUMN "scoringMode" "ScoringMode" NOT NULL DEFAULT 'HIGHEST_WINS';
