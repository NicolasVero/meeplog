import { Router } from 'express';
import * as playerController from './player.controller';
import { validateParams, validateBody } from '../common/middlewares';
import { idParamSchema } from '../common/schemas';
import { createPlayerSchema, updatePlayerSchema } from './player.schema';
import * as ratingController from '../rating/rating.controller';
import { ratingParamsSchema, upsertRatingSchema } from '../rating/rating.schema';

const router = Router();

router.get('/', playerController.getAllPlayers);
router.get('/:id', validateParams(idParamSchema), playerController.getPlayerById);
router.post('/', validateBody(createPlayerSchema), playerController.postPlayer);
router.patch('/:id', validateParams(idParamSchema), validateBody(updatePlayerSchema), playerController.patchPlayer);
router.delete('/:id', validateParams(idParamSchema), playerController.deletePlayer);

router.get('/:id/games', validateParams(idParamSchema), playerController.getPlayedGames);
router.get('/:id/ratings', validateParams(idParamSchema), ratingController.getPlayerRatings);
router.put(
  '/:id/ratings/:boardGameId',
  validateParams(ratingParamsSchema),
  validateBody(upsertRatingSchema),
  ratingController.putRating,
);
router.delete('/:id/ratings/:boardGameId', validateParams(ratingParamsSchema), ratingController.deleteRating);

export default router;
