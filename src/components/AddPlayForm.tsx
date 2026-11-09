import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Group, NumberInput, Select, Stack, Text } from '@mantine/core';
import { boardGamesQuery } from '../api/board-games';
import { useCreatePlay } from '../api/plays';
import type { BoardGame, CreatePlayInput, Player } from '../api/types';
import ApiErrorAlert from './ApiErrorAlert';

interface Props {
  nightId: number;
  players: Player[];
  onSuccess: () => void;
}

type FormValues = {
  boardGameId: string | null;
  scores: Record<number, number | ''>;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function playedScores(values: FormValues) {
  return Object.entries(values.scores)
    .filter(([, score]) => score !== '')
    .map(([playerId, score]) => ({ playerId: Number(playerId), score: Number(score) }));
}

function validate(values: FormValues, boardGame: BoardGame | undefined): FormErrors {
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

function toInput(nightId: number, values: FormValues): CreatePlayInput {
  return {
    gameNightId: nightId,
    boardGameId: Number(values.boardGameId),
    scores: playedScores(values),
  };
}

export default function AddPlayForm({ nightId, players, onSuccess }: Props) {
  const boardGames = useQuery(boardGamesQuery());
  const createPlay = useCreatePlay();

  const [values, setValues] = useState<FormValues>({ boardGameId: null, scores: {} });
  const [submitted, setSubmitted] = useState(false);

  const options = boardGames.data?.map((bg) => ({ value: String(bg.id), label: bg.title })) ?? [];
  const selectedGame = boardGames.data?.find((bg) => String(bg.id) === values.boardGameId);
  const errors = submitted ? validate(values, selectedGame) : {};

  function setScore(playerId: number, score: number | string) {
    setValues((current) => ({
      ...current,
      scores: { ...current.scores, [playerId]: score === '' ? '' : Number(score) },
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(validate(values, selectedGame)).length > 0) return;

    createPlay.mutate(toInput(nightId, values), { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack>
        <ApiErrorAlert error={createPlay.error} title="La partie n'a pas pu être créée" />
        <ApiErrorAlert error={boardGames.error} title="Impossible de charger les jeux" />

        <Select
          label="Jeu de société"
          placeholder="Choisir un jeu"
          withAsterisk
          data={options}
          searchable
          autoSelectOnBlur
          disabled={boardGames.isPending}
          value={values.boardGameId}
          onChange={(boardGameId) => setValues((current) => ({ ...current, boardGameId }))}
          error={errors.boardGameId}
        />

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Scores
          </Text>
          <Text size="xs" c="dimmed">
            Laissez vide pour un joueur qui n'a pas participé.
          </Text>
          {players.map((player) => (
            <Group key={player.id} justify="space-between" wrap="nowrap">
              <Text>{player.name}</Text>
              <NumberInput
                aria-label={`Score de ${player.name}`}
                w={120}
                allowDecimal={false}
                value={values.scores[player.id] ?? ''}
                onChange={(score) => setScore(player.id, score)}
              />
            </Group>
          ))}
          {errors.scores && (
            <Text size="sm" c="red">
              {errors.scores}
            </Text>
          )}
        </Stack>

        <Group justify="flex-end">
          <Button type="submit" loading={createPlay.isPending}>
            Ajouter la partie
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
