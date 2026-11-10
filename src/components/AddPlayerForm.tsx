import { useState } from 'react';
import { useCreatePlayer } from '../api/players';
import { Button, Group, Input } from '@mantine/core';

type FormValues = {
  name: string;
};

interface Props {
  onSuccess: () => void;
}

export default function AddPlayerForm({ onSuccess }: Props) {
  const initialValues: FormValues = {
    name: '',
  };

  const [values, setValues] = useState<FormValues>(initialValues);
  const createPlayer = useCreatePlayer();

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createPlayer.mutate({ name: values.name }, { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input placeholder="Nom du joueur" onChange={(e) => update('name', e.currentTarget.value)} />
      <Group justify="flex-end">
        <Button variant="default" onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit">Créer le joueur</Button>
      </Group>
    </form>
  );
}
