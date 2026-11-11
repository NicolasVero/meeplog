import { z } from 'zod';

export const ratingParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  boardGameId: z.coerce.number().int().positive(),
});

export const upsertRatingSchema = z.object({
  value: z.number().int().min(1).max(10),
});

export type UpsertRatingInput = z.infer<typeof upsertRatingSchema>;
