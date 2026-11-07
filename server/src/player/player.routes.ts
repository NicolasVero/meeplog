import { response, Router } from 'express';
import * as playerController from './player.controller';

const router = Router();

router.get('/', playerController.getAllPlayers);
router.get('/:id', playerController.getPlayerById);
router.post('/', playerController.postPlayer);
router.delete('/:id', playerController.deletePlayer);

export default router;
