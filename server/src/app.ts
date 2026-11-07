import express from 'express';
import boardgameRoutes from './boardgame/boardgame.routes';

const app = express();
app.use(express.json());

app.use('/boardgame', boardgameRoutes);

export default app;
