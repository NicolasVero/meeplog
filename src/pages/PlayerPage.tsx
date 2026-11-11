import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ActionIcon, Anchor, Avatar, Group, Paper, Rating, Select, Stack, Text, Title } from '@mantine/core';
import { boardGamesQuery } from '../api/board-games';
import { playerQuery } from '../api/players';
import { playerRatingsQuery, useDeleteRating, useRateGame } from '../api/ratings';
import type { Player, Rating as GameRating } from '../api/types';
import EmptyState from '../components/EmptyState';
import { QueryState } from '../components/QueryState';
import { notifyError, notifySuccess } from '../utils/feedback';

const MAX_RATING = 10;

export default function PlayerPage() {
  const id = Number(useParams().id);
  const query = useQuery(playerQuery(id));

  if (!query.data) return <QueryState query={query} />;

  return <PlayerDetails player={query.data} />;
}

function PlayerDetails({ player }: { player: Player }) {
  const ratingsQuery = useQuery(playerRatingsQuery(player.id));
  const gamesQuery = useQuery(boardGamesQuery());
  const rateGame = useRateGame(player.id);
  const deleteRating = useDeleteRating(player.id);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const ratings = ratingsQuery.data ?? [];
  const ratedIds = new Set(ratings.map((r) => r.boardGame.id));
  const unratedGames = (gamesQuery.data ?? [])
    .filter((game) => !ratedIds.has(game.id))
    .sort((a, b) => a.title.localeCompare(b.title));

  function rate(boardGameId: number, value: number, onSuccess?: () => void) {
    rateGame.mutate(
      { boardGameId, value },
      {
        onSuccess: () => {
          notifySuccess('Note enregistrée');
          onSuccess?.();
        },
        onError: (error) => notifyError(error, 'La note n’a pas pu être enregistrée'),
      },
    );
  }

  function removeRating(rating: GameRating) {
    deleteRating.mutate(rating.boardGame.id, {
      onSuccess: () => notifySuccess('Note supprimée'),
      onError: (error) => notifyError(error, 'La note n’a pas pu être supprimée'),
    });
  }

  return (
    <Stack>
      <Anchor component={Link} to="/players" size="sm">
        ← Joueurs
      </Anchor>
      <Group gap="sm">
        <Avatar name={player.name} color="initials" size="lg" />
        <Title order={1}>{player.name}</Title>
      </Group>

      <Title order={2} mt="md">
        Noter un jeu
      </Title>
      <Paper withBorder p="sm">
        <Group align="flex-end">
          <Select
            label="Jeu"
            placeholder={unratedGames.length ? 'Choisir un jeu' : 'Tous les jeux sont notés'}
            data={unratedGames.map((game) => ({ value: String(game.id), label: game.title }))}
            value={selectedGameId}
            onChange={setSelectedGameId}
            disabled={unratedGames.length === 0}
            searchable
            style={{ flex: 1, minWidth: 200 }}
          />
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              Note
            </Text>
            <Rating
              count={MAX_RATING}
              value={0}
              readOnly={selectedGameId === null || rateGame.isPending}
              onChange={(value) => selectedGameId !== null && rate(Number(selectedGameId), value, () => setSelectedGameId(null))}
            />
          </Stack>
        </Group>
      </Paper>

      <Title order={2} mt="md">
        Ses notes
      </Title>
      <QueryState query={ratingsQuery} />
      {ratingsQuery.data && ratings.length === 0 && <EmptyState message="Aucun jeu noté pour l’instant." />}
      {ratings.length > 0 && (
        <Paper withBorder>
          {ratings.map((rating, i) => (
            <Group
              key={rating.boardGame.id}
              justify="space-between"
              p="sm"
              wrap="nowrap"
              style={i > 0 ? { borderTop: '1px solid var(--mantine-color-default-border)' } : undefined}
            >
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                {rating.boardGame.thumbnailUrl && <Avatar src={rating.boardGame.thumbnailUrl} radius="sm" size="sm" alt="" />}
                <Text fw={500} truncate>
                  {rating.boardGame.title}
                </Text>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <Rating
                  count={MAX_RATING}
                  value={rating.value}
                  size="sm"
                  onChange={(value) => rate(rating.boardGame.id, value)}
                />
                <Text size="sm" c="dimmed" w={40} ta="right">
                  {rating.value}/{MAX_RATING}
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={`Supprimer la note de ${rating.boardGame.title}`}
                  onClick={() => removeRating(rating)}
                >
                  ✕
                </ActionIcon>
              </Group>
            </Group>
          ))}
        </Paper>
      )}
    </Stack>
  );
}
