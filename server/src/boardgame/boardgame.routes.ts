import { response, Router } from 'express';
import * as gameController from './boardgame.controller';

const router = Router();

router.get('/', gameController.getAllBoardGames);
router.get('/:id', gameController.getBoardGameById);

export default router;
