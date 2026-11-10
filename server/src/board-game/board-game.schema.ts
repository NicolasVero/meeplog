import { z } from 'zod';
import { nonEmpty } from '../common/schemas';

const boardGameBaseSchema = z.object({
  title: z.string().trim().min(1),
  minPlayers: z.number().int().min(1),
  maxPlayers: z.number().int().min(1),
  description: z.string().nullish(),

  // BoardGameGeek data (optional: games can still be entered by hand)
  bggId: z.number().int().positive().nullish(),
  yearPublished: z.number().int().nullish(),
  playingTime: z.number().int().min(0).nullish(),
  thumbnailUrl: z.url().nullish(),
  imageUrl: z.url().nullish(),
  bggRating: z.number().min(0).max(10).nullish(),
});

export const createBoardGameSchema = boardGameBaseSchema.refine((data) => data.maxPlayers >= data.minPlayers, {
  message: 'maxPlayers must be greater than or equal to minPlayers',
  path: ['maxPlayers'],
});

export const updateBoardGameSchema = nonEmpty(boardGameBaseSchema.partial());

export const boardGameSchema = boardGameBaseSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  description: z.string().nullable(),
  bggId: z.number().nullable(),
  yearPublished: z.number().nullable(),
  playingTime: z.number().nullable(),
  thumbnailUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
  bggRating: z.number().nullable(),
  bggSyncedAt: z.date().nullable(),
});

export type CreateBoardGameInput = z.infer<typeof boardGameBaseSchema>;
export type BoardGame = z.infer<typeof boardGameSchema>;
export type UpdateBoardGameInput = z.infer<typeof updateBoardGameSchema>;
