import { z } from 'zod';

export const createPlayerSchema = z.object({
  name: z.string().trim().min(1),
});

export const playerSchema = createPlayerSchema.extend({
  id: z.number(),
  createdAt: z.date(),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type Player = z.infer<typeof playerSchema>;
