import { Button, Group, NumberInput, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm, type FormErrors } from '@mantine/form';
import { useCreateBoardGame, useUpdateBoardGame } from '../api/board-games';
import type { BoardGame, CreateBoardGameInput } from '../api/types';
import { notifySuccess } from '../utils/feedback';
import ApiErrorAlert from './ApiErrorAlert';

type FormValues = {
  title: string;
  minPlayers: number | '';
  maxPlayers: number | '';
  description: string;
};

function toFormValues(game?: BoardGame): FormValues {
  return {
    title: game?.title ?? '',
    minPlayers: game?.minPlayers ?? 2,
    maxPlayers: game?.maxPlayers ?? 4,
    description: game?.description ?? '',
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) errors.title = 'Le titre est obligatoire';
  if (values.minPlayers === '' || values.minPlayers < 1) errors.minPlayers = 'Au moins 1 joueur';
  if (values.maxPlayers === '') errors.maxPlayers = 'Obligatoire';
  else if (values.minPlayers !== '' && values.maxPlayers < values.minPlayers) {
    errors.maxPlayers = 'Doit être supérieur ou égal au minimum';
  }
  return errors;
}

function toInput(values: FormValues): CreateBoardGameInput {
  return {
    title: values.title.trim(),
    minPlayers: Number(values.minPlayers),
    maxPlayers: Number(values.maxPlayers),
    description: values.description.trim() || null,
  };
}

interface Props {
  /** Edits this game when given, creates a new one otherwise. */
  game?: BoardGame;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BoardGameForm({ game, onSuccess, onCancel }: Props) {
  const createBoardGame = useCreateBoardGame();
  const updateBoardGame = useUpdateBoardGame(game?.id ?? 0);
  const mutation = game ? updateBoardGame : createBoardGame;

  const form = useForm<FormValues>({ initialValues: toFormValues(game), validate });

  function handleSubmit(values: FormValues) {
    mutation.mutate(toInput(values), {
      onSuccess: () => {
        notifySuccess(game ? 'Jeu modifié' : 'Jeu ajouté');
        onSuccess();
      },
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack>
        <ApiErrorAlert error={mutation.error} title="Le jeu n'a pas pu être enregistré" />

        <TextInput label="Titre" withAsterisk data-autofocus key={form.key('title')} {...form.getInputProps('title')} />
        <Group grow>
          <NumberInput
            label="Joueurs min."
            withAsterisk
            min={1}
            allowDecimal={false}
            key={form.key('minPlayers')}
            {...form.getInputProps('minPlayers')}
          />
          <NumberInput
            label="Joueurs max."
            withAsterisk
            min={1}
            allowDecimal={false}
            key={form.key('maxPlayers')}
            {...form.getInputProps('maxPlayers')}
          />
        </Group>
        <Textarea label="Description" autosize minRows={2} key={form.key('description')} {...form.getInputProps('description')} />

        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {game ? 'Enregistrer' : 'Ajouter le jeu'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
