import { nullable, z } from 'zod';

export const createBoardGameSchema = z.object({
  title: z.string(),
  minPlayers: z.number().min(1),
  maxPlayers: z.number().min(1),
  description: z.string().nullable(),
});

export const boardGameSchema = createBoardGameSchema.extend({
  id: z.number(),
  createdAt: z.date(),
});

export type createBoardGameInput = z.infer<typeof createBoardGameSchema>;
export type BoardGame = z.infer<typeof boardGameSchema>;
