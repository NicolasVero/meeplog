import type { Request, Response } from 'express';
import * as gameNightService from './game-night.service';

export async function getAllGameNights(req: Request, res: Response) {
  const gameNights = await gameNightService.findAllGameNights();

  return res.json(gameNights);
}

export async function getGameNightById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const gameNight = await gameNightService.findGameNightById(id);

  if (!gameNight) {
    return res.status(404).json({ error: 'Game night not found for id ' + id });
  }

  return res.json(gameNight);
}

export async function postGameNight(req: Request, res: Response) {
  const gameNight = await gameNightService.createGameNight(req.body);
  return res.status(201).json(gameNight);
}

export async function deleteGameNight(req: Request, res: Response) {
  const id = Number(req.params.id);

  await gameNightService.deleteGameNight(id);
  return res.sendStatus(204);
}

export async function postGameNightPlayer(req: Request, res: Response) {
  const id = Number(req.params.id);
  const playerId = Number(req.params.playerId);

  await gameNightService.addPlayerToGameNight(id, playerId);
  return res.sendStatus(204);
}

export async function deleteGameNightPlayer(req: Request, res: Response) {
  const id = Number(req.params.id);
  const playerId = Number(req.params.playerId);

  await gameNightService.removePlayerFromGameNight(id, playerId);
  return res.sendStatus(204);
}
