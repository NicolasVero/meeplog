import { useQueries, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Button, Card, Group, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { boardGamesQuery } from '../api/board-games';
import { gameNightQuery, gameNightsQuery } from '../api/game-nights';
import { playersQuery } from '../api/players';
import EmptyState from '../components/EmptyState';
import { QueryState } from '../components/QueryState';
import { formatLongDate } from '../utils/dates';
import { mostPlayedGames, standings } from '../utils/stats';

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Paper withBorder p="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fz={28} fw={700}>
        {value}
      </Text>
    </Paper>
  );
}

export default function HomePage() {
  const nights = useQuery(gameNightsQuery());
  const players = useQuery(playersQuery());
  const games = useQuery(boardGamesQuery());

  // The list endpoint only returns summaries: load each night to get its plays.
  // Fine for a personal log; a dedicated /stats endpoint would scale better.
  const details = useQueries({
    queries: (nights.data ?? []).map((n) => gameNightQuery(n.id)),
  });
  const plays = details.flatMap((d) => d.data?.plays ?? []);
  const detailsLoading = details.some((d) => d.isPending);

  if (!nights.data) return <QueryState query={nights} />;

  const sorted = [...nights.data].sort((a, b) => b.date.localeCompare(a.date));
  const lastNight = sorted[0];
  const ranking = standings(plays).slice(0, 5);
  const topGames = mostPlayedGames(plays).slice(0, 5);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Tableau de bord</Title>
        <Button component={Link} to="/game-nights/new">
          Nouvelle soirée
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <StatTile label="Soirées" value={nights.data.length} />
        <StatTile label="Parties" value={nights.data.reduce((sum, n) => sum + n.playCount, 0)} />
        <StatTile label="Joueurs" value={players.data?.length ?? 0} />
        <StatTile label="Jeux" value={games.data?.length ?? 0} />
      </SimpleGrid>

      {lastNight ? (
        <Card component={Link} to={`/game-nights/${lastNight.id}`} withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Dernière soirée
          </Text>
          <Text fw={600} tt="capitalize">
            {formatLongDate(lastNight.date)}
          </Text>
          <Text size="sm" c="dimmed">
            {[lastNight.location, `${lastNight.playCount} partie(s)`, lastNight.players.map((p) => p.name).join(', ')]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </Card>
      ) : (
        <EmptyState message="Aucune soirée enregistrée. Créez la première !" />
      )}

      {!detailsLoading && plays.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Stack gap="xs">
            <Title order={2}>Meilleurs joueurs</Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Joueur</Table.Th>
                  <Table.Th ta="right">Victoires</Table.Th>
                  <Table.Th ta="right">Taux</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {ranking.map((s) => (
                  <Table.Tr key={s.player.id}>
                    <Table.Td>{s.player.name}</Table.Td>
                    <Table.Td ta="right">
                      {s.wins} / {s.plays}
                    </Table.Td>
                    <Table.Td ta="right">{Math.round((s.wins / s.plays) * 100)} %</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>

          <Stack gap="xs">
            <Title order={2}>Jeux les plus joués</Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Jeu</Table.Th>
                  <Table.Th ta="right">Parties</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topGames.map((g) => (
                  <Table.Tr key={g.title}>
                    <Table.Td>{g.title}</Table.Td>
                    <Table.Td ta="right">{g.plays}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </SimpleGrid>
      )}
    </Stack>
  );
}
