import { Router } from 'express';
import * as boardGameController from './board-game.controller';
import { validateParams, validateBody } from '../common/middlewares';
import { idParamSchema } from '../common/schemas';
import { createBoardGameSchema } from './board-game.schema';

const router = Router();

router.get('/', boardGameController.getAllBoardGames);
router.get('/:id', validateParams(idParamSchema), boardGameController.getBoardGameById);
router.post('/', validateBody(createBoardGameSchema), boardGameController.postBoardGame);
router.delete('/:id', validateParams(idParamSchema), boardGameController.deleteBoardGame);

export default router;
