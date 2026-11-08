import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Button, Group, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useCreateGameNight } from '../api/game-nights';
import { ApiError } from '../api/client';
import type { CreateGameNightInput } from '../api/types';
import PlayerSelectorList from '../components/PlayerSelectorList';
import ApiErrorAlert from '../components/ApiErrorAlert';

type FormValues = {
  date: string | null; // "YYYY-MM-DD"
  location: string;
  notes: string;
  playerIds: number[];
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  date: dayjs().format('YYYY-MM-DD'),
  location: '',
  notes: '',
  playerIds: [],
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.date) errors.date = 'La date est obligatoire';
  if (values.playerIds.length === 0) errors.playerIds = 'Sélectionnez au moins un joueur';
  return errors;
}

function toInput(values: FormValues): CreateGameNightInput {
  return {
    date: dayjs(values.date).toISOString(), // dayjs parses "YYYY-MM-DD" as local midnight
    location: values.location.trim() || null,
    notes: values.notes.trim() || null,
    playerIds: values.playerIds,
  };
}

export default function CreateGameNightsPage() {
  const navigate = useNavigate();
  const createGameNight = useCreateGameNight();

  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted ? validate(values) : {};

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(validate(values)).length > 0) return;

    createGameNight.mutate(toInput(values), {
      onSuccess: (night) => navigate(`/game-nights/${night.id}`, { replace: true }),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack maw={560}>
        <Title order={1}>Nouvelle soirée</Title>

        <ApiErrorAlert error={createGameNight.error} title="La soirée n'a pas pu être créée" />

        <DateInput
          label="Date"
          withAsterisk
          valueFormat="DD/MM/YYYY"
          value={values.date}
          onChange={(date) => update('date', date)}
          error={errors.date}
        />
        <TextInput
          label="Lieu"
          placeholder="Chez Paul"
          value={values.location}
          onChange={(e) => update('location', e.currentTarget.value)}
        />
        <Textarea
          label="Notes"
          autosize
          minRows={2}
          value={values.notes}
          onChange={(e) => update('notes', e.currentTarget.value)}
        />

        <PlayerSelectorList value={values.playerIds} onChange={(ids) => update('playerIds', ids)} error={errors.playerIds} />

        <Group justify="flex-end">
          <Button variant="default" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button type="submit" loading={createGameNight.isPending}>
            Créer la soirée
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
