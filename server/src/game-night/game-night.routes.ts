import { Router } from 'express';
import * as gameNightController from './game-night.controller';
import { validateParams, validateBody } from '../common/middlewares';
import { idParamSchema } from '../common/schemas';
import { createGameNightSchema, gameNightPlayerParamsSchema } from './game-night.schema';

const router = Router();

router.get('/', gameNightController.getAllGameNights);
router.get('/:id', validateParams(idParamSchema), gameNightController.getGameNightById);
router.post('/', validateBody(createGameNightSchema), gameNightController.postGameNight);
router.delete('/:id', validateParams(idParamSchema), gameNightController.deleteGameNight);
router.post(
  '/:id/players/:playerId',
  validateParams(gameNightPlayerParamsSchema),
  gameNightController.postGameNightPlayer,
);
router.delete(
  '/:id/players/:playerId',
  validateParams(gameNightPlayerParamsSchema),
  gameNightController.deleteGameNightPlayer,
);

export default router;
