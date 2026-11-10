import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { idParamSchema } from '../common/schemas';
import { HttpError } from '../common/errors';
import { validateParams } from '../common/middlewares';
import * as bggService from './bgg.service';

const router = Router();

const searchQuerySchema = z.object({ q: z.string().trim().min(2) });

router.get('/search', async (req: Request, res: Response) => {
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Query parameter q must have at least 2 characters' });
  }
  return res.json(await bggService.searchGames(parsed.data.q));
});

router.get('/games/:id', validateParams(idParamSchema), async (req: Request, res: Response) => {
  return res.json(await bggService.fetchGame(Number(req.params.id)));
});

// Lets the front end show whose collection will be synced.
router.get('/config', (req: Request, res: Response) => {
  return res.json({ username: process.env.BGG_USERNAME ?? null });
});

router.post('/sync', async (req: Request, res: Response) => {
  const username = process.env.BGG_USERNAME;
  if (!username) throw new HttpError(503, 'BGG_USERNAME is not configured on the server');
  return res.json(await bggService.syncCollection(username));
});

export default router;
