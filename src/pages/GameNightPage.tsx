import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { Button, Group, Modal, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { gameNightQuery, useDeleteGameNight } from '../api/game-nights';
import { useDeletePlay } from '../api/plays';
import type { GameNight, Play } from '../api/types';
import EmptyState from '../components/EmptyState';
import NightPlayers from '../components/NightPlayers';
import PlayCard from '../components/PlayCard';
import PlayForm from '../components/PlayForm';
import { QueryState } from '../components/QueryState';
import { formatLongDate } from '../utils/dates';
import { confirmDelete, notifyError, notifySuccess } from '../utils/feedback';
import { standings } from '../utils/stats';

export default function GameNightPage() {
  const id = Number(useParams().id);
  const query = useQuery(gameNightQuery(id));

  if (!query.data) return <QueryState query={query} />;

  return <GameNightDetails night={query.data} />;
}

// null = modal closed, 'new' = adding a play, Play = editing that play
type Editing = Play | 'new' | null;

function GameNightDetails({ night }: { night: GameNight }) {
  const navigate = useNavigate();
  const deleteGameNight = useDeleteGameNight();
  const deletePlay = useDeletePlay();
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);

  function handleDeleteNight() {
    confirmDelete({
      title: 'Supprimer la soirée',
      message: 'La soirée et toutes ses parties seront supprimées. Cette action est irréversible.',
      onConfirm: () =>
        deleteGameNight.mutate(night.id, {
          onSuccess: () => {
            notifySuccess('Soirée supprimée');
            navigate('/game-nights', { replace: true });
          },
          onError: (error) => notifyError(error, 'La soirée n’a pas pu être supprimée'),
        }),
    });
  }

  function handleDeletePlay(play: Play) {
    confirmDelete({
      title: 'Supprimer la partie',
      message: `Supprimer la partie de ${play.boardGame.title} ?`,
      onConfirm: () =>
        deletePlay.mutate(play.id, {
          onSuccess: () => notifySuccess('Partie supprimée'),
          onError: (error) => notifyError(error, 'La partie n’a pas pu être supprimée'),
        }),
    });
  }

  const ranking = standings(night.plays);

  return (
    <Stack>
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1} tt="capitalize">
            {formatLongDate(night.date)}
          </Title>
          {night.location && <Text c="dimmed">{night.location}</Text>}
        </div>
        <Group gap="xs">
          <Button component={Link} to="edit" variant="light">
            Modifier
          </Button>
          <Button variant="subtle" color="red" onClick={handleDeleteNight}>
            Supprimer
          </Button>
        </Group>
      </Group>

      {night.notes && (
        <Paper withBorder p="sm">
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {night.notes}
          </Text>
        </Paper>
      )}

      <NightPlayers night={night} />

      <Group justify="space-between" mt="md">
        <Title order={2}>Parties</Title>
        <Button onClick={() => setEditing('new')} disabled={night.players.length === 0}>
          Ajouter une partie
        </Button>
      </Group>

      {night.plays.length === 0 ? (
        <EmptyState message="Aucune partie jouée pour l’instant." />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {night.plays.map((play) => (
            <PlayCard key={play.id} play={play} onEdit={() => setEditing(play)} onDelete={() => handleDeletePlay(play)} />
          ))}
        </SimpleGrid>
      )}

      {ranking.length > 0 && (
        <>
          <Title order={2} mt="md">
            Classement de la soirée
          </Title>
          <Table maw={420}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Joueur</Table.Th>
                <Table.Th ta="right">Victoires</Table.Th>
                <Table.Th ta="right">Parties</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ranking.map((s) => (
                <Table.Tr key={s.player.id}>
                  <Table.Td>{s.player.name}</Table.Td>
                  <Table.Td ta="right">{s.wins}</Table.Td>
                  <Table.Td ta="right">{s.plays}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}

      <Modal
        opened={editing !== null}
        onClose={close}
        title={editing === 'new' ? 'Ajouter une partie' : 'Modifier la partie'}
        centered
      >
        {editing !== null && (
          <PlayForm nightId={night.id} players={night.players} play={editing === 'new' ? undefined : editing} onSuccess={close} />
        )}
      </Modal>
    </Stack>
  );
}
