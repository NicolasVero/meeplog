import { Router } from 'express';
import * as playerController from './player.controller';
import { validateParams, validateBody } from '../common/middlewares';
import { idParamSchema } from '../common/schemas';
import { createPlayerSchema, updatePlayerSchema } from './player.schema';

const router = Router();

router.get('/', playerController.getAllPlayers);
router.get('/:id', validateParams(idParamSchema), playerController.getPlayerById);
router.post('/', validateBody(createPlayerSchema), playerController.postPlayer);
router.patch('/:id', validateParams(idParamSchema), validateBody(updatePlayerSchema), playerController.patchPlayer);
router.delete('/:id', validateParams(idParamSchema), playerController.deletePlayer);

export default router;
