import { useQuery } from '@tanstack/react-query';
import { Button, Group, Input, NumberInput, Select, Stack, Text } from '@mantine/core';
import { useForm, type FormErrors } from '@mantine/form';
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

  const options = boardGames.data?.map((bg) => ({ value: String(bg.id), label: bg.title })) ?? [];
  const findGame = (id: string | null) => boardGames.data?.find((bg) => String(bg.id) === id);

  const form = useForm<FormValues>({
    initialValues: { boardGameId: null, scores: {} },
    validate: (values) => validate(values, findGame(values.boardGameId)),
  });

  function handleSubmit(values: FormValues) {
    createPlay.mutate(toInput(nightId, values), { onSuccess });
  }

  function setScore(playerId: number, score: number | string) {
    form.setFieldValue(`scores.${playerId}`, score === '' ? '' : Number(score));
    form.clearFieldError('scores');
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
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
          key={form.key('boardGameId')}
          {...form.getInputProps('boardGameId')}
        />

        <Input.Wrapper label="Scores" description="Laissez vide pour un joueur qui n'a pas participé." error={form.errors.scores}>
          <Stack gap="xs" mt="xs">
            {players.map((player) => (
              <Group key={player.id} justify="space-between" wrap="nowrap">
                <Text>{player.name}</Text>
                <NumberInput
                  aria-label={`Score de ${player.name}`}
                  w={120}
                  allowDecimal={false}
                  value={form.values.scores[player.id] ?? ''}
                  onChange={(score) => setScore(player.id, score)}
                />
              </Group>
            ))}
          </Stack>
        </Input.Wrapper>

        <Group justify="flex-end">
          <Button type="submit" loading={createPlay.isPending}>
            Ajouter la partie
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
