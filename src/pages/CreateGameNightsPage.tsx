import { useNavigate } from 'react-router';
import { Button, Group, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm, type FormErrors } from '@mantine/form';
import dayjs from 'dayjs';
import { useCreateGameNight } from '../api/game-nights';
import type { CreateGameNightInput } from '../api/types';
import PlayerSelectorList from '../components/PlayerSelectorList';
import ApiErrorAlert from '../components/ApiErrorAlert';

type FormValues = {
  date: string | null; // "YYYY-MM-DD"
  location: string;
  notes: string;
  playerIds: number[];
};

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
  const form = useForm<FormValues>({ initialValues, validate });

  function handleSubmit(values: FormValues) {
    createGameNight.mutate(toInput(values), {
      onSuccess: (night) => navigate(`/game-nights/${night.id}`, { replace: true }),
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack maw={560}>
        <Title order={1}>Nouvelle soirée</Title>

        <ApiErrorAlert error={createGameNight.error} title="La soirée n'a pas pu être créée" />

        <DateInput label="Date" withAsterisk valueFormat="DD/MM/YYYY" key={form.key('date')} {...form.getInputProps('date')} />
        <TextInput label="Lieu" placeholder="Chez Paul" key={form.key('location')} {...form.getInputProps('location')} />
        <Textarea label="Notes" autosize minRows={2} key={form.key('notes')} {...form.getInputProps('notes')} />

        <PlayerSelectorList
          value={form.values.playerIds}
          onChange={(ids) => form.setFieldValue('playerIds', ids)}
          error={form.errors.playerIds as string | undefined}
        />

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
