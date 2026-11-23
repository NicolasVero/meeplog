import { useQuery } from '@tanstack/react-query';
import { Button, Checkbox, Group, Input, NumberInput, SegmentedControl, Select, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { boardGamesQuery } from '../api/board-games';
import { useCreatePlay, useUpdatePlay } from '../api/plays';
import type { Play, Player } from '../api/types';
import { notifySuccess } from '../utils/feedback';
import { SCORING_MODES, usesScores } from '../utils/scoring';
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
    initialValues: toFormValues(
      play,
      players.map((p) => p.id),
    ),
    validate: (values) => validate(values, findGame(values.boardGameId)),
  });

  const game = findGame(form.values.boardGameId);
  const mode = game?.scoringMode ?? 'HIGHEST_WINS';

  function handleSubmit(values: FormValues) {
    mutation.mutate(toInput(nightId, values, mode), {
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

  function toggle(field: 'played' | 'winners', playerId: number, checked: boolean) {
    const ids = form.values[field].filter((id) => id !== playerId);
    form.setFieldValue(field, checked ? [...ids, playerId] : ids);
    // A player who did not play cannot win; a winner obviously played.
    if (field === 'played' && !checked) form.setFieldValue('winners', form.values.winners.filter((id) => id !== playerId));
    if (field === 'winners' && checked && !form.values.played.includes(playerId)) {
      form.setFieldValue('played', [...form.values.played, playerId]);
    }
    form.clearFieldError('scores');
  }

  const sheetLabel = usesScores(mode) ? 'Scores' : 'Joueurs';
  const sheetDescription = usesScores(mode)
    ? 'Laissez vide pour un joueur qui n’a pas participé.'
    : mode === 'WINNER_ONLY'
      ? 'Cochez les joueurs de la partie, puis le ou les gagnants.'
      : 'Cochez les joueurs de la partie.';

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack>
        <ApiErrorAlert error={mutation.error} title="La partie n'a pas pu être enregistrée" />
        <ApiErrorAlert error={boardGames.error} title="Impossible de charger les jeux" />

        <Select
          label="Jeu de société"
          placeholder="Choisir un jeu"
          description={game && SCORING_MODES.find((m) => m.value === mode)?.label}
          withAsterisk
          data={options}
          searchable
          autoSelectOnBlur
          disabled={boardGames.isPending}
          key={form.key('boardGameId')}
          {...form.getInputProps('boardGameId')}
        />

        {mode === 'COOPERATIVE' && (
          <Input.Wrapper label="Résultat de l’équipe">
            <SegmentedControl
              fullWidth
              mt={4}
              color={form.values.teamWon ? 'teal' : 'red'}
              data={[
                { value: 'won', label: 'Victoire' },
                { value: 'lost', label: 'Défaite' },
              ]}
              value={form.values.teamWon ? 'won' : 'lost'}
              onChange={(value) => form.setFieldValue('teamWon', value === 'won')}
            />
          </Input.Wrapper>
        )}

        <Input.Wrapper label={sheetLabel} description={sheetDescription} error={form.errors.scores}>
          <Stack gap="xs" mt="xs">
            {players.map((player) => (
              <Group key={player.id} justify="space-between" wrap="nowrap">
                {usesScores(mode) ? (
                  <>
                    <Text>{player.name}</Text>
                    <NumberInput
                      aria-label={`Score de ${player.name}`}
                      w={120}
                      allowDecimal={false}
                      value={form.values.scores[player.id] ?? ''}
                      onChange={(score) => setScore(player.id, score)}
                    />
                  </>
                ) : (
                  <>
                    <Checkbox
                      label={player.name}
                      checked={form.values.played.includes(player.id)}
                      onChange={(e) => toggle('played', player.id, e.currentTarget.checked)}
                    />
                    {mode === 'WINNER_ONLY' && (
                      <Checkbox
                        label="Gagnant"
                        color="yellow"
                        labelPosition="left"
                        checked={form.values.winners.includes(player.id)}
                        onChange={(e) => toggle('winners', player.id, e.currentTarget.checked)}
                      />
                    )}
                  </>
                )}
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
