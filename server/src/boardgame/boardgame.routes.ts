import { Router } from 'express';
import * as boardGameController from './boardgame.controller';
import { validateParams, validateBody } from '../common/middlewares';
import { idParamSchema } from '../common/schemas';
import { createBoardGameSchema } from './boardgame.schema';

const router = Router();

router.get('/', boardGameController.getAllBoardGames);
router.get('/:id', validateParams(idParamSchema), boardGameController.getBoardGameById);
router.post('/', validateBody(createBoardGameSchema), boardGameController.postBoardGame);
router.delete('/:id', validateParams(idParamSchema), boardGameController.deleteBoardGame);

export default router;
