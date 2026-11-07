import { response, Router } from 'express';
import * as boardGameController from './boardgame.controller';

const router = Router();

router.get('/', boardGameController.getAllBoardGames);
router.get('/:id', boardGameController.getBoardGameById);
router.post('/', boardGameController.postBoardGame);
router.delete('/:id', boardGameController.deleteBoardGame);

export default router;
