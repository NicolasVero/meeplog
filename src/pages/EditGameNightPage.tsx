import { useNavigate, useParams } from 'react-router';
import { Button, Group, Stack, Title } from '@mantine/core';
import { useForm, type FormErrors } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { gameNightQuery, useUpdateGameNight } from '../api/game-nights';
import type { GameNight, UpdateGameNightInput } from '../api/types';
import { QueryState } from '../components/QueryState';
import ApiErrorAlert from '../components/ApiErrorAlert';
import GameNightFields from '../components/GameNightFields';

type FormValues = {
  date: string | null; // "YYYY-MM-DD"
  location: string;
  notes: string;
};

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
// so it can be initialized directly from it (no useEffect needed).
function EditGameNightForm({ night }: { night: GameNight }) {
  const navigate = useNavigate();
  const updateGameNight = useUpdateGameNight(night.id);
  const form = useForm<FormValues>({ initialValues: toFormValues(night), validate });

  function handleSubmit(values: FormValues) {
    updateGameNight.mutate(toInput(values), {
      onSuccess: () => navigate(`/game-nights/${night.id}`, { replace: true }),
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack maw={560}>
        <Title order={1}>Modifier la soirée</Title>

        <ApiErrorAlert error={updateGameNight.error} title="La soirée n'a pas pu être modifiée" />

        <GameNightFields form={form} />

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
