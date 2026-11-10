import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { idParamSchema } from '../common/schemas';
import { HttpError } from '../common/errors';
import { validateBody, validateParams } from '../common/middlewares';
import * as bggService from './bgg.service';

const router = Router();

const searchQuerySchema = z.object({ q: z.string().trim().min(2) });
const syncBodySchema = z.object({ username: z.string().trim().min(1).optional() }).optional();

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

router.post('/sync', validateBody(syncBodySchema), async (req: Request, res: Response) => {
  const username = req.body?.username ?? process.env.BGG_USERNAME;
  if (!username) throw new HttpError(400, 'No BGG username given and BGG_USERNAME is not configured');
  return res.json(await bggService.syncCollection(username));
});

export default router;
