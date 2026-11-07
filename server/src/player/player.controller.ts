import type { Request, Response } from 'express';
import { z } from 'zod';
import { createPlayerSchema } from './player.schema';
import * as playerService from './player.service';

export async function getAllPlayers(req: Request, res: Response) {
  const players = await playerService.findAllPlayers();

  return res.json(players);
}

export async function getPlayerById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const player = await playerService.findPlayerById(id);

  if (!player) {
    return res.status(404).json({ error: 'Player not found for id ' + id });
  }

  return res.json(player);
}

export async function postPlayer(req: Request, res: Response) {
  const result = z.safeParse(createPlayerSchema, req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  const player = await playerService.createPlayer(result.data);
  return res.status(201).json(player);
}

export async function deletePlayer(req: Request, res: Response) {
  const id = Number(req.params.id);

  await playerService.deletePlayer(id);
  return res.sendStatus(204);
}
