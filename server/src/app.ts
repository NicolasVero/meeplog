import express from 'express';
import boardGameRoutes from './boardgame/boardgame.routes';
import playerRoutes from './player/player.routes';
import { errorHandler } from './common/middlewares';

const app = express();
app.use(express.json());

app.use('/boardgame', boardGameRoutes);
app.use('/player', playerRoutes);

app.use(errorHandler);

export default app;
