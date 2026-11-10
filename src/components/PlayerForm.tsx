import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreatePlayer, useUpdatePlayer } from '../api/players';
import type { Player } from '../api/types';
import { notifySuccess } from '../utils/feedback';
import ApiErrorAlert from './ApiErrorAlert';

interface Props {
  /** Edits this player when given, creates a new one otherwise. */
  player?: Player;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PlayerForm({ player, onSuccess, onCancel }: Props) {
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer(player?.id ?? 0);
  const mutation = player ? updatePlayer : createPlayer;

  const form = useForm({
    initialValues: { name: player?.name ?? '' },
    validate: {
      name: (name) => (name.trim() ? null : 'Le nom est obligatoire'),
    },
  });

  function handleSubmit({ name }: typeof form.values) {
    mutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          notifySuccess(player ? 'Joueur modifié' : 'Joueur ajouté');
          onSuccess();
        },
      },
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack>
        <ApiErrorAlert error={mutation.error} title="Le joueur n'a pas pu être enregistré" />

        <TextInput
          label="Nom"
          placeholder="Nom du joueur"
          withAsterisk
          data-autofocus
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {player ? 'Enregistrer' : 'Créer le joueur'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
