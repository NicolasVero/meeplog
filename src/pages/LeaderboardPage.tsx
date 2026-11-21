import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Anchor, Avatar, Badge, Group, Progress, Stack, Table, Text, Title } from '@mantine/core';
import { leaderboardQuery } from '../api/players';
import EmptyState from '../components/EmptyState';
import { QueryState } from '../components/QueryState';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const query = useQuery(leaderboardQuery());

  return (
    <Stack>
      <Title order={1}>Classement</Title>
      <Text c="dimmed" size="sm">
        Toutes soirées confondues. En cas d’égalité à la première place, chaque ex æquo compte une victoire.
      </Text>

      {!query.data ? (
        <QueryState query={query} />
      ) : query.data.length === 0 ? (
        <EmptyState message="Aucune partie jouée pour l’instant." />
      ) : (
        <Table.ScrollContainer minWidth={480}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={48}>#</Table.Th>
                <Table.Th>Joueur</Table.Th>
                <Table.Th ta="right">Victoires</Table.Th>
                <Table.Th ta="right">Parties</Table.Th>
                <Table.Th w={180}>Taux de victoire</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {query.data.map(({ player, plays, wins, winRate }, i) => (
                <Table.Tr key={player.id}>
                  <Table.Td fw={600}>{MEDALS[i] ?? i + 1}</Table.Td>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar name={player.name} color="initials" size="sm" />
                      <Anchor component={Link} to={`/players/${player.id}`} c="inherit" fw={500}>
                        {player.name}
                      </Anchor>
                      {i === 0 && wins > 0 && (
                        <Badge size="xs" color="yellow" variant="light">
                          Champion
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right" fw={600}>
                    {wins}
                  </Table.Td>
                  <Table.Td ta="right">{plays}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Progress value={winRate * 100} size="sm" style={{ flex: 1 }} aria-hidden />
                      <Text size="sm" w={44} ta="right">
                        {Math.round(winRate * 100)} %
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Stack>
  );
}
