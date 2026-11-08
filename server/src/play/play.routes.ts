import { Router } from 'express';
import * as playController from './play.controller';
import { validateParams, validateBody } from '../common/middlewares';
import { idParamSchema } from '../common/schemas';
import { createPlaySchema, updatePlaySchema } from './play.schema';

const router = Router();

router.get('/:id', validateParams(idParamSchema), playController.getPlayById);
router.post('/', validateBody(createPlaySchema), playController.postPlay);
router.patch('/:id', validateParams(idParamSchema), validateBody(updatePlaySchema), playController.patchPlay);
router.delete('/:id', validateParams(idParamSchema), playController.deletePlay);

export default router;
