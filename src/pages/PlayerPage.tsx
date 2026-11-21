import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ActionIcon, Anchor, Avatar, Group, Paper, Select, Stack, Table, Tabs, Text, Title } from '@mantine/core';
import { boardGamesQuery } from '../api/board-games';
import { playedGamesQuery, playerQuery, rivalsQuery } from '../api/players';
import { playerRatingsQuery, useDeleteRating, useRateGame } from '../api/ratings';
import type { Player, Rating as GameRating } from '../api/types';
import EmptyState from '../components/EmptyState';
import RatingInput from '../components/RatingInput';
import { QueryState } from '../components/QueryState';
import { formatShortDate } from '../utils/dates';
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
  // Bumped after each new rating to remount the stars, clearing their hover state.
  const [newRatingKey, setNewRatingKey] = useState(0);

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

      <Tabs defaultValue="played" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="played">Jeux joués</Tabs.Tab>
          <Tabs.Tab value="rivals">Face-à-face</Tabs.Tab>
          <Tabs.Tab value="ratings">Notes{ratings.length > 0 && ` (${ratings.length})`}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="played" pt="md">
          <PlayedGames playerId={player.id} ratings={ratings} />
        </Tabs.Panel>

        <Tabs.Panel value="rivals" pt="md">
          <Rivals playerId={player.id} />
        </Tabs.Panel>

        <Tabs.Panel value="ratings" pt="md">
          <Stack>
            <Title order={3}>Noter un jeu</Title>
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
                  <RatingInput
                    key={newRatingKey}
                    count={MAX_RATING}
                    value={0}
                    readOnly={selectedGameId === null || rateGame.isPending}
                    onChange={(value) => {
                      if (selectedGameId === null) return;
                      setNewRatingKey((k) => k + 1);
                      rate(Number(selectedGameId), value, () => setSelectedGameId(null));
                    }}
                  />
                </Stack>
              </Group>
            </Paper>

            <Title order={3} mt="md">
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
                      {rating.boardGame.thumbnailUrl && (
                        <Avatar src={rating.boardGame.thumbnailUrl} radius="sm" size="sm" alt="" />
                      )}
                      <Anchor component={Link} to={`/board-games/${rating.boardGame.id}`} c="inherit" fw={500} truncate>
                        {rating.boardGame.title}
                      </Anchor>
                    </Group>
                    <Group gap="xs" wrap="nowrap">
                      <RatingInput
                        count={MAX_RATING}
                        value={rating.value}
                        size="sm"
                        onChange={(value) => rate(rating.boardGame.id, value)}
                      />
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
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function PlayedGames({ playerId, ratings }: { playerId: number; ratings: GameRating[] }) {
  const query = useQuery(playedGamesQuery(playerId));

  if (!query.data) return <QueryState query={query} />;
  if (query.data.length === 0) return <EmptyState message="Aucune partie jouée pour l’instant." />;

  const ratingByGame = new Map(ratings.map((r) => [r.boardGame.id, r.value]));

  return (
    <Table.ScrollContainer minWidth={480}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Jeu</Table.Th>
            <Table.Th ta="right">Parties</Table.Th>
            <Table.Th ta="right">Victoires</Table.Th>
            <Table.Th ta="right">Dernière partie</Table.Th>
            <Table.Th ta="right">Note</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {query.data.map(({ boardGame, plays, wins, lastPlayedAt }) => (
            <Table.Tr key={boardGame.id}>
              <Table.Td>
                <Group gap="sm" wrap="nowrap">
                  <Avatar src={boardGame.thumbnailUrl} name={boardGame.title} color="initials" radius="sm" size="sm" />
                  <Anchor component={Link} to={`/board-games/${boardGame.id}`} c="inherit" fw={500} size="sm">
                    {boardGame.title}
                  </Anchor>
                </Group>
              </Table.Td>
              <Table.Td ta="right">{plays}</Table.Td>
              <Table.Td ta="right">{wins}</Table.Td>
              <Table.Td ta="right">{formatShortDate(lastPlayedAt)}</Table.Td>
              <Table.Td ta="right">{ratingByGame.has(boardGame.id) ? `${ratingByGame.get(boardGame.id)}/10` : '—'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

/** Head-to-head record: in plays shared with each opponent, who finished ahead. */
function Rivals({ playerId }: { playerId: number }) {
  const query = useQuery(rivalsQuery(playerId));

  if (!query.data) return <QueryState query={query} />;
  if (query.data.length === 0) return <EmptyState message="Aucune partie jouée contre un autre joueur." />;

  return (
    <Table.ScrollContainer minWidth={480}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Adversaire</Table.Th>
            <Table.Th ta="right">Parties</Table.Th>
            <Table.Th ta="right">Devant</Table.Th>
            <Table.Th ta="right">Derrière</Table.Th>
            <Table.Th ta="right">Égalités</Table.Th>
            <Table.Th ta="right">Bilan</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {query.data.map(({ opponent, plays, wins, losses, ties }) => {
            const balance = wins - losses;
            return (
              <Table.Tr key={opponent.id}>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar name={opponent.name} color="initials" size="sm" />
                    <Anchor component={Link} to={`/players/${opponent.id}`} c="inherit" fw={500} size="sm">
                      {opponent.name}
                    </Anchor>
                  </Group>
                </Table.Td>
                <Table.Td ta="right">{plays}</Table.Td>
                <Table.Td ta="right">{wins}</Table.Td>
                <Table.Td ta="right">{losses}</Table.Td>
                <Table.Td ta="right">{ties}</Table.Td>
                <Table.Td ta="right" fw={600} c={balance > 0 ? 'teal' : balance < 0 ? 'red' : 'dimmed'}>
                  {balance > 0 ? `+${balance}` : balance}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
