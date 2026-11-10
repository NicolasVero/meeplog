import express from 'express';
import cors from 'cors';
import boardGameRoutes from './board-game/board-game.routes';
import playerRoutes from './player/player.routes';
import gameNightRoutes from './game-night/game-night.routes';
import playRoutes from './play/play.routes';
import bggRoutes from './bgg/bgg.routes';
import { errorHandler } from './common/middlewares';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/board-games', boardGameRoutes);
app.use('/players', playerRoutes);
app.use('/game-nights', gameNightRoutes);
app.use('/plays', playRoutes);
app.use('/bgg', bggRoutes);

app.use(errorHandler);

export default app;
