import type { Request, Response } from 'express';
import * as ratingService from './rating.service';

export async function getPlayerRatings(req: Request, res: Response) {
  const ratings = await ratingService.findRatingsByPlayer(Number(req.params.id));
  return res.json(ratings);
}

export async function putRating(req: Request, res: Response) {
  const rating = await ratingService.upsertRating(Number(req.params.id), Number(req.params.boardGameId), req.body.value);
  return res.json(rating);
}

export async function deleteRating(req: Request, res: Response) {
  await ratingService.deleteRating(Number(req.params.id), Number(req.params.boardGameId));
  return res.sendStatus(204);
}
