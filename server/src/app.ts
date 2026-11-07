import express from 'express';
import boardGameRoutes from './board-game/board-game.routes';
import playerRoutes from './player/player.routes';
import { errorHandler } from './common/middlewares';

const app = express();
app.use(express.json());

app.use('/board-games', boardGameRoutes);
app.use('/players', playerRoutes);

app.use(errorHandler);

export default app;
