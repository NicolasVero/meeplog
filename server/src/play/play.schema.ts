import { z } from 'zod';
import { playerSchema } from '../player/player.schema';
import { boardGameSchema } from '../board-game/board-game.schema';

export const createPlaySchema = z.object({
  gameNightId: z.number().int().positive(),
  boardGameId: z.number().int().positive(),
  scores: z
    .array(
      z.object({
        playerId: z.number().int().positive(),
        score: z.number().int(),
      }),
    )
    .min(1)
    .refine((scores) => new Set(scores.map((s) => s.playerId)).size === scores.length, {
      message: 'Each player can only have one score',
    }),
});

export const playSchema = z.object({
  id: z.number(),
  gameNightId: z.number(),
  createdAt: z.date(),
  boardGame: boardGameSchema,
  scores: z.array(z.object({ player: playerSchema, score: z.number() })),
});

export type CreatePlayInput = z.infer<typeof createPlaySchema>;
export type Play = z.infer<typeof playSchema>;
