import type { Request, Response } from 'express';
import { z } from 'zod';
import { boardGameSchema, createBoardGameSchema } from './boardgame.schema';
import * as boardGameService from './boardgame.service';

export async function getAllBoardGames(req: Request, res: Response) {
  const boardGames = await boardGameService.findAllBoardGames();

  return res.json(boardGames);
}

export async function getBoardGameById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const boardGame = await boardGameService.findBoardGameById(id);

  if (!boardGame) {
    return res.status(404).json({ error: 'Board game not found for id ' + id });
  }

  return res.json(boardGame);
}

export async function postBoardGame(req: Request, res: Response) {
  const result = z.safeParse(createBoardGameSchema, req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  const boardGame = await boardGameService.createBoardGame(result.data);
  return res.status(201).json(boardGame);
}

export async function deleteBoardGame(req: Request, res: Response) {
  const id = Number(req.params.id);

  await boardGameService.deleteBoardGame(id);
  return res.sendStatus(204);
}
