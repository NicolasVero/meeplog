import { useQuery } from '@tanstack/react-query';
import { Button, Group, Input, NumberInput, Select, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { boardGamesQuery } from '../api/board-games';
import { useCreatePlay, useUpdatePlay } from '../api/plays';
import type { Play, Player } from '../api/types';
import { notifySuccess } from '../utils/feedback';
import ApiErrorAlert from './ApiErrorAlert';
import { toFormValues, toInput, validate, type FormValues } from './PlayForm.logic';

interface Props {
  nightId: number;
  players: Player[];
  /** Edits this play when given, creates a new one otherwise. */
  play?: Play;
  onSuccess: () => void;
}

export default function PlayForm({ nightId, players, play, onSuccess }: Props) {
  const boardGames = useQuery(boardGamesQuery());
  const createPlay = useCreatePlay();
  const updatePlay = useUpdatePlay(play?.id ?? 0);
  const mutation = play ? updatePlay : createPlay;

  const options = boardGames.data?.map((bg) => ({ value: String(bg.id), label: bg.title })) ?? [];
  const findGame = (id: string | null) => boardGames.data?.find((bg) => String(bg.id) === id);

  const form = useForm<FormValues>({
    initialValues: toFormValues(play),
    validate: (values) => validate(values, findGame(values.boardGameId)),
  });

  function handleSubmit(values: FormValues) {
    mutation.mutate(toInput(nightId, values), {
      onSuccess: () => {
        notifySuccess(play ? 'Partie modifiée' : 'Partie ajoutée');
        onSuccess();
      },
    });
  }

  function setScore(playerId: number, score: number | string) {
    form.setFieldValue(`scores.${playerId}`, score === '' ? '' : Number(score));
    form.clearFieldError('scores');
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack>
        <ApiErrorAlert error={mutation.error} title="La partie n'a pas pu être enregistrée" />
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
          <Button type="submit" loading={mutation.isPending}>
            {play ? 'Enregistrer' : 'Ajouter la partie'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
