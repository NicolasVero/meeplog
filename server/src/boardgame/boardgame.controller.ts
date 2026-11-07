import type { Request, Response } from 'express';
import { findAllBoardGames, findBoardGameById } from './boardgame.service';

export async function getAllBoardGames(req: Request, res: Response) {
  const boardGames = await findAllBoardGames();

  return res.json(boardGames);
}

export async function getBoardGameById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const boardGame = await findBoardGameById(id);

  if (!boardGame) {
    return res.status(404).json({ error: 'Board game not found for id ' + id });
  }

  return res.json(boardGame);
}
