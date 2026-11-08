import { z } from 'zod';
import { nonEmpty } from '../common/schemas';

export const createPlayerSchema = z.object({
  name: z.string().trim().min(1),
});

export const playerSchema = createPlayerSchema.extend({
  id: z.number(),
  createdAt: z.date(),
});

export const updatePlayerSchema = nonEmpty(createPlayerSchema.partial());

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type Player = z.infer<typeof playerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
