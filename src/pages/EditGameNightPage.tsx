import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Group, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { gameNightQuery, useUpdateGameNight } from '../api/game-nights';
import type { GameNight, UpdateGameNightInput } from '../api/types';
import { QueryState } from '../components/QueryState';
import ApiErrorAlert from '../components/ApiErrorAlert';

type FormValues = {
  date: string | null; // "YYYY-MM-DD"
  location: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

// API -> form: the opposite of toInput. null becomes '' so inputs stay controlled.
function toFormValues(night: GameNight): FormValues {
  return {
    date: dayjs(night.date).format('YYYY-MM-DD'),
    location: night.location ?? '',
    notes: night.notes ?? '',
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.date) errors.date = 'La date est obligatoire';
  return errors;
}

function toInput(values: FormValues): UpdateGameNightInput {
  return {
    date: dayjs(values.date).toISOString(),
    location: values.location.trim() || null,
    notes: values.notes.trim() || null,
  };
}

// The page only loads the data...
export default function EditGameNightPage() {
  const id = Number(useParams().id);
  const query = useQuery(gameNightQuery(id));

  if (!query.data) return <QueryState query={query} />;

  return <EditGameNightForm night={query.data} />;
}

// ...and the form is only mounted once the data is there,
// so useState can be initialized directly from it (no useEffect needed).
function EditGameNightForm({ night }: { night: GameNight }) {
  const navigate = useNavigate();
  const updateGameNight = useUpdateGameNight(night.id);

  const [values, setValues] = useState<FormValues>(() => toFormValues(night));
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted ? validate(values) : {};

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(validate(values)).length > 0) return;

    updateGameNight.mutate(toInput(values), {
      onSuccess: () => navigate(`/game-nights/${night.id}`, { replace: true }),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack maw={560}>
        <Title order={1}>Modifier la soirée</Title>

        <ApiErrorAlert error={updateGameNight.error} title="La soirée n'a pas pu être modifiée" />

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

        <Group justify="flex-end">
          <Button variant="default" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button type="submit" loading={updateGameNight.isPending}>
            Enregistrer
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
