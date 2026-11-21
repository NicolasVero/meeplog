import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { Anchor, Avatar, Badge, Group, Image, Paper, Rating, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { boardGameQuery, boardGameStatsQuery } from '../api/board-games';
import type { BoardGame, BoardGameStats } from '../api/types';
import EmptyState from '../components/EmptyState';
import { QueryState } from '../components/QueryState';
import { formatLongDate } from '../utils/dates';

export default function BoardGamePage() {
  const id = Number(useParams().id);
  const gameQuery = useQuery(boardGameQuery(id));
  const statsQuery = useQuery(boardGameStatsQuery(id));

  if (!gameQuery.data) return <QueryState query={gameQuery} />;
  if (!statsQuery.data) return <QueryState query={statsQuery} />;

  return <BoardGameDetails game={gameQuery.data} stats={statsQuery.data} />;
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Paper withBorder p="sm">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text size="xl" fw={700}>
        {value}
      </Text>
      {hint && (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Paper>
  );
}

function BoardGameDetails({ game, stats }: { game: BoardGame; stats: BoardGameStats }) {
  const playCount = stats.gameNights.reduce((sum, night) => sum + night.playCount, 0);
  const details = [
    game.yearPublished,
    `${game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}–${game.maxPlayers}`} joueurs`,
    game.playingTime && `${game.playingTime} min`,
    game.scoringMode === 'LOWEST_WINS' && 'le plus bas score gagne',
  ].filter(Boolean);
  const mostWins = Math.max(0, ...stats.players.map((p) => p.wins));

  return (
    <Stack>
      <Anchor component={Link} to="/board-games" size="sm">
        ← Jeux
      </Anchor>

      <Group align="flex-start" wrap="nowrap">
        {(game.imageUrl ?? game.thumbnailUrl) && (
          <Image src={game.imageUrl ?? game.thumbnailUrl} alt="" w={120} h={120} fit="contain" radius="sm" />
        )}
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Title order={1}>{game.title}</Title>
          <Text c="dimmed">{details.join(' · ')}</Text>
          {game.bggId && (
            <Anchor href={`https://boardgamegeek.com/boardgame/${game.bggId}`} target="_blank" rel="noreferrer" size="sm">
              Voir sur BoardGameGeek
            </Anchor>
          )}
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 3 }}>
        <StatTile label="Note BGG" value={game.bggRating ? `${game.bggRating.toFixed(1)}/10` : '—'} />
        <StatTile
          label="Moyenne des joueurs"
          value={stats.averageRating !== null ? `${stats.averageRating.toFixed(1)}/10` : '—'}
          hint={`${stats.ratings.length} note${stats.ratings.length > 1 ? 's' : ''}`}
        />
        <StatTile
          label="Parties jouées"
          value={String(playCount)}
          hint={`${stats.gameNights.length} soirée${stats.gameNights.length > 1 ? 's' : ''}`}
        />
      </SimpleGrid>

      {game.description && (
        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }} lineClamp={6}>
          {game.description}
        </Text>
      )}

      <Title order={2} mt="md">
        Notes des joueurs
      </Title>
      {stats.ratings.length === 0 ? (
        <EmptyState message="Personne n’a encore noté ce jeu." />
      ) : (
        <Paper withBorder>
          {stats.ratings.map((rating, i) => (
            <Group
              key={rating.player.id}
              justify="space-between"
              p="sm"
              wrap="nowrap"
              style={i > 0 ? { borderTop: '1px solid var(--mantine-color-default-border)' } : undefined}
            >
              <Group gap="sm" wrap="nowrap">
                <Avatar name={rating.player.name} color="initials" size="sm" />
                <Anchor component={Link} to={`/players/${rating.player.id}`} c="inherit" fw={500}>
                  {rating.player.name}
                </Anchor>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <Rating count={10} value={rating.value} size="sm" readOnly />
                <Text size="sm" c="dimmed" w={40} ta="right">
                  {rating.value}/10
                </Text>
              </Group>
            </Group>
          ))}
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} mt="md">
        <Stack>
          <Title order={2}>Joueurs</Title>
          {stats.players.length === 0 ? (
            <EmptyState message="Personne n’y a encore joué." />
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Joueur</Table.Th>
                  <Table.Th ta="right">Parties</Table.Th>
                  <Table.Th ta="right">Victoires</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stats.players.map(({ player, plays, wins }) => (
                  <Table.Tr key={player.id}>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Anchor component={Link} to={`/players/${player.id}`} c="inherit" size="sm">
                          {player.name}
                        </Anchor>
                        {wins > 0 && wins === mostWins && (
                          <Badge size="xs" color="yellow" variant="light">
                            Champion
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">{plays}</Table.Td>
                    <Table.Td ta="right">{wins}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>

        <Stack>
          <Title order={2}>Soirées</Title>
          {stats.gameNights.length === 0 ? (
            <EmptyState message="Ce jeu n’a encore été joué à aucune soirée." />
          ) : (
            <Paper withBorder>
              {stats.gameNights.map((night, i) => (
                <Group
                  key={night.id}
                  justify="space-between"
                  p="sm"
                  wrap="nowrap"
                  style={i > 0 ? { borderTop: '1px solid var(--mantine-color-default-border)' } : undefined}
                >
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Anchor component={Link} to={`/game-nights/${night.id}`} c="inherit" fw={500} tt="capitalize">
                      {formatLongDate(night.date)}
                    </Anchor>
                    {night.location && (
                      <Text size="xs" c="dimmed" truncate>
                        {night.location}
                      </Text>
                    )}
                  </Stack>
                  <Text size="sm" c="dimmed">
                    {night.playCount} partie{night.playCount > 1 ? 's' : ''}
                  </Text>
                </Group>
              ))}
            </Paper>
          )}
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
