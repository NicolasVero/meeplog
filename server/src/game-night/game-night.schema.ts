import { z } from 'zod';
import { nonEmpty } from '../common/schemas';
import { playerSchema } from '../player/player.schema';
import { playSchema } from '../play/play.schema';

export const createGameNightSchema = z.object({
  date: z.coerce.date(),
  location: z.string().trim().min(1).nullish(),
  notes: z.string().nullish(),
  playerIds: z
    .array(z.number().int().positive())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, { message: 'playerIds must be unique' }),
});

export const updateGameNightSchema = nonEmpty(createGameNightSchema.omit({ playerIds: true }).partial());

export const gameNightPlayerParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  playerId: z.coerce.number().int().positive(),
});

export const gameNightSchema = z.object({
  id: z.number(),
  date: z.date(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  players: z.array(playerSchema),
  plays: z.array(playSchema),
});

export const gameNightSummarySchema = gameNightSchema.omit({ plays: true }).extend({
  playCount: z.number(),
});

export type CreateGameNightInput = z.infer<typeof createGameNightSchema>;
export type GameNight = z.infer<typeof gameNightSchema>;
export type GameNightSummary = z.infer<typeof gameNightSummarySchema>;
export type UpdateGameNightInput = z.infer<typeof updateGameNightSchema>;
