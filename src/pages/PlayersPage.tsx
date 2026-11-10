import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionIcon, Avatar, Button, Group, Modal, Paper, Stack, Text, Title } from '@mantine/core';
import { playersQuery, useDeletePlayer } from '../api/players';
import type { Player } from '../api/types';
import EmptyState from '../components/EmptyState';
import PlayerForm from '../components/PlayerForm';
import { QueryState } from '../components/QueryState';
import { confirmDelete, notifyDeleteError, notifySuccess } from '../utils/feedback';

// null = modal closed, 'new' = creating, Player = editing that player
type Editing = Player | 'new' | null;

export default function PlayersPage() {
  const query = useQuery(playersQuery());
  const deletePlayer = useDeletePlayer();
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);

  function handleDelete(player: Player) {
    confirmDelete({
      title: 'Supprimer le joueur',
      message: `Supprimer ${player.name} ? Cette action est irréversible.`,
      onConfirm: () =>
        deletePlayer.mutate(player.id, {
          onSuccess: () => notifySuccess('Joueur supprimé'),
          onError: (error) => notifyDeleteError(error, `${player.name} a déjà participé à une soirée.`),
        }),
    });
  }

  const players = [...(query.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Joueurs</Title>
        <Button onClick={() => setEditing('new')}>Créer un joueur</Button>
      </Group>

      <QueryState query={query} />

      {query.data && players.length === 0 && (
        <EmptyState message="Aucun joueur pour l’instant." action="Créer un joueur" onAction={() => setEditing('new')} />
      )}

      {players.length > 0 && (
        <Paper withBorder>
          {players.map((player, i) => (
            <Group
              key={player.id}
              justify="space-between"
              p="sm"
              style={i > 0 ? { borderTop: '1px solid var(--mantine-color-default-border)' } : undefined}
            >
              <Group gap="sm">
                <Avatar name={player.name} color="initials" size="sm" />
                <Text fw={500}>{player.name}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <ActionIcon variant="subtle" aria-label={`Modifier ${player.name}`} onClick={() => setEditing(player)}>
                  ✎
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={`Supprimer ${player.name}`}
                  onClick={() => handleDelete(player)}
                >
                  ✕
                </ActionIcon>
              </Group>
            </Group>
          ))}
        </Paper>
      )}

      <Modal
        opened={editing !== null}
        onClose={close}
        title={editing === 'new' ? 'Créer un joueur' : 'Modifier le joueur'}
        centered
      >
        {editing !== null && <PlayerForm player={editing === 'new' ? undefined : editing} onSuccess={close} onCancel={close} />}
      </Modal>
    </Stack>
  );
}
