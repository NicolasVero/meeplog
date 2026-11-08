import type { Request, Response } from 'express';
import * as playService from './play.service';

export async function getPlayById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const play = await playService.findPlayById(id);

  if (!play) {
    return res.status(404).json({ error: 'Play not found for id ' + id });
  }

  return res.json(play);
}

export async function postPlay(req: Request, res: Response) {
  const play = await playService.createPlay(req.body);
  return res.status(201).json(play);
}

export async function patchPlay(req: Request, res: Response) {
  const id = Number(req.params.id);
  const play = await playService.updatePlay(id, req.body);

  return res.json(play);
}

export async function deletePlay(req: Request, res: Response) {
  const id = Number(req.params.id);

  await playService.deletePlay(id);
  return res.sendStatus(204);
}
