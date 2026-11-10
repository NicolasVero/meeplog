// Mirrors the server Zod schemas. Dates are ISO strings once serialized to JSON.

export type BoardGame = {
  id: number;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  description: string | null;
  createdAt: string;
  // BoardGameGeek data, null for games entered by hand
  bggId: number | null;
  yearPublished: number | null;
  playingTime: number | null; // minutes
  thumbnailUrl: string | null;
  imageUrl: string | null;
  bggRating: number | null;
  bggSyncedAt: string | null;
};

export type CreateBoardGameInput = {
  title: string;
  minPlayers: number;
  maxPlayers: number;
  description?: string | null;
  bggId?: number | null;
  yearPublished?: number | null;
  playingTime?: number | null;
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  bggRating?: number | null;
};
export type UpdateBoardGameInput = Partial<CreateBoardGameInput>;

export type Player = {
  id: number;
  name: string;
  createdAt: string;
};

export type CreatePlayerInput = { name: string };
export type UpdatePlayerInput = Partial<CreatePlayerInput>;

export type PlayScore = { player: Player; score: number };

export type Play = {
  id: number;
  gameNightId: number;
  createdAt: string;
  boardGame: BoardGame;
  scores: PlayScore[];
};

export type ScoreInput = { playerId: number; score: number };
export type CreatePlayInput = { gameNightId: number; boardGameId: number; scores: ScoreInput[] };
export type UpdatePlayInput = Partial<Omit<CreatePlayInput, 'gameNightId'>>;

export type GameNight = {
  id: number;
  date: string;
  location: string | null;
  notes: string | null;
  createdAt: string;
  players: Player[];
  plays: Play[];
};

export type GameNightSummary = Omit<GameNight, 'plays'> & { playCount: number };

export type CreateGameNightInput = {
  date: string;
  location?: string | null;
  notes?: string | null;
  playerIds: number[];
};
export type UpdateGameNightInput = Partial<Omit<CreateGameNightInput, 'playerIds'>>;
