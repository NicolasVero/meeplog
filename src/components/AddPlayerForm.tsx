import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreatePlayer } from '../api/players';
import ApiErrorAlert from './ApiErrorAlert';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddPlayerForm({ onSuccess, onCancel }: Props) {
  const createPlayer = useCreatePlayer();

  const form = useForm({
    initialValues: { name: '' },
    validate: {
      name: (name) => (name.trim() ? null : 'Le nom est obligatoire'),
    },
  });

  function handleSubmit({ name }: typeof form.values) {
    createPlayer.mutate({ name: name.trim() }, { onSuccess });
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack>
        <ApiErrorAlert error={createPlayer.error} title="Le joueur n'a pas pu être créé" />

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
          <Button type="submit" loading={createPlayer.isPending}>
            Créer le joueur
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
