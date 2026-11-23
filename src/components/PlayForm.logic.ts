import type { FormErrors } from '@mantine/form';
import type { BoardGame, CreatePlayInput, Play, ScoreInput, ScoringMode } from '../api/types';
import { usesScores } from '../utils/scoring';

export type FormValues = {
  boardGameId: string | null;
  /** Scored games: one score per player, empty for a player who did not play. */
  scores: Record<number, number | ''>;
  /** Games without scores: ids of the players who played. */
  played: number[];
  /** Winner-only games: ids of the winners. */
  winners: number[];
  /** Cooperative games: did the team win? */
  teamWon: boolean;
};

export function playedScores(values: FormValues) {
  return Object.entries(values.scores)
    .filter(([, score]) => score !== '')
    .map(([playerId, score]) => ({ playerId: Number(playerId), score: Number(score) }));
}

/** The score sheet sent to the API, shaped by the game's scoring rule. */
export function scoreSheet(values: FormValues, mode: ScoringMode): ScoreInput[] {
  if (usesScores(mode)) return playedScores(values);
  return values.played.map((playerId) => ({
    playerId,
    won: mode === 'COOPERATIVE' ? values.teamWon : values.winners.includes(playerId),
  }));
}

export function validate(values: FormValues, boardGame: BoardGame | undefined): FormErrors {
  const errors: FormErrors = {};
  if (!values.boardGameId) errors.boardGameId = 'Choisissez un jeu';

  const mode = boardGame?.scoringMode ?? 'HIGHEST_WINS';
  const sheet = scoreSheet(values, mode);
  const count = sheet.length;
  if (count === 0) {
    errors.scores = usesScores(mode) ? 'Saisissez le score d’au moins un joueur' : 'Cochez au moins un joueur';
  } else if (boardGame && (count < boardGame.minPlayers || count > boardGame.maxPlayers)) {
    errors.scores = `${boardGame.title} se joue de ${boardGame.minPlayers} à ${boardGame.maxPlayers} joueurs (${count} saisis)`;
  } else if (mode === 'WINNER_ONLY' && !sheet.some((s) => s.won)) {
    errors.scores = 'Désignez au moins un gagnant';
  }
  return errors;
}

/** Form values for a play, or for a new play where every player of the night takes part. */
export function toFormValues(play?: Play, nightPlayerIds: number[] = []): FormValues {
  if (!play) return { boardGameId: null, scores: {}, played: nightPlayerIds, winners: [], teamWon: false };
  return {
    boardGameId: String(play.boardGame.id),
    scores: Object.fromEntries(play.scores.filter((s) => s.score !== null).map((s) => [s.player.id, s.score!])),
    played: play.scores.map((s) => s.player.id),
    winners: play.scores.filter((s) => s.won).map((s) => s.player.id),
    teamWon: play.scores.some((s) => s.won),
  };
}

export function toInput(nightId: number, values: FormValues, mode: ScoringMode): CreatePlayInput {
  return {
    gameNightId: nightId,
    boardGameId: Number(values.boardGameId),
    scores: scoreSheet(values, mode),
  };
}
