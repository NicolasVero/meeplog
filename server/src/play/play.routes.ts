import { Router } from 'express';
import * as playController from './play.controller';
import { validateParams, validateBody } from '../common/middlewares';
import { idParamSchema } from '../common/schemas';
import { createPlaySchema } from './play.schema';

const router = Router();

router.get('/:id', validateParams(idParamSchema), playController.getPlayById);
router.post('/', validateBody(createPlaySchema), playController.postPlay);
router.delete('/:id', validateParams(idParamSchema), playController.deletePlay);

export default router;
