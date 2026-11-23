import { z } from 'zod';
import { nonEmpty } from '../common/schemas';
import { playerSchema } from '../player/player.schema';
import { boardGameSchema } from '../board-game/board-game.schema';

const scoresSchema = z
  .array(
    z.object({
      playerId: z.number().int().positive(),
      // Required for scored games, ignored otherwise.
      score: z.number().int().nullish(),
      // Winner flag for winner-only and cooperative games, ignored for scored games.
      won: z.boolean().optional(),
    }),
  )
  .min(1)
  .refine((scores) => new Set(scores.map((s) => s.playerId)).size === scores.length, {
    message: 'Each player can only have one score',
  });

export const createPlaySchema = z.object({
  gameNightId: z.number().int().positive(),
  boardGameId: z.number().int().positive(),
  scores: scoresSchema,
});

export const updatePlaySchema = nonEmpty(createPlaySchema.omit({ gameNightId: true }).partial());

export const playSchema = z.object({
  id: z.number(),
  gameNightId: z.number(),
  createdAt: z.date(),
  boardGame: boardGameSchema,
  scores: z.array(z.object({ player: playerSchema, score: z.number().nullable(), won: z.boolean() })),
});

export type CreatePlayInput = z.infer<typeof createPlaySchema>;
export type Play = z.infer<typeof playSchema>;
export type UpdatePlayInput = z.infer<typeof updatePlaySchema>;
