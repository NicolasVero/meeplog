import type { FormErrors } from '@mantine/form';
import type { BoardGame, CreatePlayInput, Play } from '../api/types';

export type FormValues = {
  boardGameId: string | null;
  scores: Record<number, number | ''>;
};

export function playedScores(values: FormValues) {
  return Object.entries(values.scores)
    .filter(([, score]) => score !== '')
    .map(([playerId, score]) => ({ playerId: Number(playerId), score: Number(score) }));
}

export function validate(values: FormValues, boardGame: BoardGame | undefined): FormErrors {
  const errors: FormErrors = {};
  if (!values.boardGameId) errors.boardGameId = 'Choisissez un jeu';

  const count = playedScores(values).length;
  if (count === 0) {
    errors.scores = 'Saisissez le score d’au moins un joueur';
  } else if (boardGame && (count < boardGame.minPlayers || count > boardGame.maxPlayers)) {
    errors.scores = `${boardGame.title} se joue de ${boardGame.minPlayers} à ${boardGame.maxPlayers} joueurs (${count} saisis)`;
  }
  return errors;
}

export function toFormValues(play?: Play): FormValues {
  if (!play) return { boardGameId: null, scores: {} };
  return {
    boardGameId: String(play.boardGame.id),
    scores: Object.fromEntries(play.scores.map((s) => [s.player.id, s.score])),
  };
}

export function toInput(nightId: number, values: FormValues): CreatePlayInput {
  return {
    gameNightId: nightId,
    boardGameId: Number(values.boardGameId),
    scores: playedScores(values),
  };
}
