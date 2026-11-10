import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { gameNightsQuery } from '../api/game-nights';
import EmptyState from '../components/EmptyState';
import { QueryState } from '../components/QueryState';
import { formatLongDate } from '../utils/dates';

export default function GameNightsPage() {
  const query = useQuery(gameNightsQuery());
  const navigate = useNavigate();

  const nights = [...(query.data ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Soirées</Title>
        <Button component={Link} to="new">
          Créer une soirée
        </Button>
      </Group>

      <QueryState query={query} />

      {query.data && nights.length === 0 && (
        <EmptyState message="Aucune soirée pour l’instant." action="Créer une soirée" onAction={() => navigate('new')} />
      )}

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {nights.map((night) => (
          <Card key={night.id} component={Link} to={`/game-nights/${night.id}`} withBorder padding="md">
            <Text fw={600} tt="capitalize">
              {formatLongDate(night.date)}
            </Text>
            <Text size="sm" c="dimmed" mb="sm">
              {night.location ?? 'Lieu non précisé'}
            </Text>
            <Group gap="xs">
              <Badge variant="light">
                {night.players.length} joueur{night.players.length > 1 ? 's' : ''}
              </Badge>
              <Badge variant="light" color="gray">
                {night.playCount} partie{night.playCount > 1 ? 's' : ''}
              </Badge>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
