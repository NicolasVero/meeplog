// Mirrors the server Zod schemas. Dates are ISO strings once serialized to JSON.

// How the winner of a play is decided from the scores
export type ScoringMode = 'HIGHEST_WINS' | 'LOWEST_WINS' | 'WINNER_ONLY' | 'COOPERATIVE';

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
  scoringMode: ScoringMode;
};

export type CreateBoardGameInput = {
  title: string;
  minPlayers: number;
  maxPlayers: number;
  description?: string | null;
  scoringMode?: ScoringMode;
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

// score is null for games without scores; won is only meaningful for winner-only and cooperative games.
export type PlayScore = { player: Player; score: number | null; won: boolean };

export type Play = {
  id: number;
  gameNightId: number;
  createdAt: string;
  boardGame: BoardGame;
  scores: PlayScore[];
};

export type ScoreInput = { playerId: number; score?: number | null; won?: boolean };
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

// A player's personal rating of a board game, from 1 to 10
export type Rating = { value: number; updatedAt: string; boardGame: BoardGame };

export type PlayedGame = { boardGame: BoardGame; plays: number; wins: number; lastPlayedAt: string };

export type LeaderboardEntry = { player: Player; plays: number; wins: number; winRate: number };

// Head-to-head record against one opponent: plays shared, finished ahead, behind or level.
export type Rival = { opponent: Player; plays: number; wins: number; losses: number; ties: number };

export type BoardGameStats = {
  averageRating: number | null;
  ratings: { value: number; updatedAt: string; player: Player }[];
  // Cooperative games only: plays won by the team (null otherwise).
  teamWins: number | null;
  gameNights: { id: number; date: string; location: string | null; playCount: number }[];
  players: { player: Player; plays: number; wins: number }[];
};
