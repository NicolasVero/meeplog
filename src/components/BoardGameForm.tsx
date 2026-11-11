import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Anchor,
  Button,
  CloseButton,
  Divider,
  Group,
  Image,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { bggGameQuery, bggUrl, type BggSearchResult } from '../api/bgg';
import { useCreateBoardGame, useUpdateBoardGame } from '../api/board-games';
import type { BoardGame } from '../api/types';
import { notifyError, notifySuccess } from '../utils/feedback';
import ApiErrorAlert from './ApiErrorAlert';
import BggSearch from './BggSearch';
import { toFormValues, toInput, validate, type FormValues } from './BoardGameForm.logic';

interface Props {
  /** Edits this game when given, creates a new one otherwise. */
  game?: BoardGame;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BoardGameForm({ game, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient();
  const createBoardGame = useCreateBoardGame();
  const updateBoardGame = useUpdateBoardGame(game?.id ?? 0);
  const mutation = game ? updateBoardGame : createBoardGame;
  const [loadingBgg, setLoadingBgg] = useState(false);

  const form = useForm<FormValues>({ initialValues: toFormValues(game), validate });
  const bgg = form.values.bgg;

  async function handleBggSelect(result: BggSearchResult) {
    setLoadingBgg(true);
    try {
      const details = await queryClient.fetchQuery(bggGameQuery(result.bggId));
      form.setValues({
        // Keep the name that was searched (often the French title) rather than BGG's primary name.
        title: result.name,
        minPlayers: details.minPlayers,
        maxPlayers: details.maxPlayers,
        playingTime: details.playingTime ?? '',
        yearPublished: details.yearPublished ?? '',
        description: details.description ?? '',
        bgg: {
          bggId: details.bggId,
          thumbnailUrl: details.thumbnailUrl,
          imageUrl: details.imageUrl,
          bggRating: details.bggRating,
        },
      });
      form.clearErrors();
    } catch (error) {
      notifyError(error as Error, 'Impossible de récupérer la fiche BGG');
    } finally {
      setLoadingBgg(false);
    }
  }

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

        {bgg ? (
          <Paper withBorder p="xs">
            <Group wrap="nowrap" gap="sm">
              {bgg.thumbnailUrl && <Image src={bgg.thumbnailUrl} alt="" w={48} h={48} fit="contain" radius="sm" />}
              <Stack gap={0} style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  Lié à BoardGameGeek
                </Text>
                <Anchor href={bggUrl(bgg.bggId)} target="_blank" rel="noreferrer" size="xs">
                  Voir la fiche BGG{bgg.bggRating ? ` · note ${bgg.bggRating.toFixed(1)}` : ''}
                </Anchor>
              </Stack>
              <CloseButton aria-label="Dissocier de BGG" onClick={() => form.setFieldValue('bgg', null)} />
            </Group>
          </Paper>
        ) : (
          <>
            <BggSearch onSelect={handleBggSelect} />
            <Divider label="ou saisir à la main" labelPosition="center" />
          </>
        )}

        <TextInput label="Titre" withAsterisk disabled={loadingBgg} key={form.key('title')} {...form.getInputProps('title')} />
        <Group grow>
          <NumberInput
            label="Joueurs min."
            withAsterisk
            min={1}
            allowDecimal={false}
            disabled={loadingBgg}
            key={form.key('minPlayers')}
            {...form.getInputProps('minPlayers')}
          />
          <NumberInput
            label="Joueurs max."
            withAsterisk
            min={1}
            allowDecimal={false}
            disabled={loadingBgg}
            key={form.key('maxPlayers')}
            {...form.getInputProps('maxPlayers')}
          />
        </Group>
        <Group grow>
          <NumberInput
            label="Durée (min)"
            min={0}
            allowDecimal={false}
            disabled={loadingBgg}
            key={form.key('playingTime')}
            {...form.getInputProps('playingTime')}
          />
          <NumberInput
            label="Année"
            min={0}
            allowDecimal={false}
            disabled={loadingBgg}
            key={form.key('yearPublished')}
            {...form.getInputProps('yearPublished')}
          />
        </Group>
        <Textarea
          label="Description"
          autosize
          minRows={2}
          maxRows={8}
          disabled={loadingBgg}
          key={form.key('description')}
          {...form.getInputProps('description')}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending || loadingBgg}>
            {game ? 'Enregistrer' : 'Ajouter le jeu'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
