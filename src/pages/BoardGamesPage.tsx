import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionIcon, Anchor, Avatar, Button, Group, Modal, Stack, Table, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { bggUrl } from '../api/bgg';
import { boardGamesQuery, useDeleteBoardGame } from '../api/board-games';
import type { BoardGame } from '../api/types';
import BoardGameForm from '../components/BoardGameForm';
import BggSyncForm from '../components/BggSyncForm';
import EmptyState from '../components/EmptyState';
import { QueryState } from '../components/QueryState';
import { confirmDelete, notifyDeleteError, notifySuccess } from '../utils/feedback';

// null = modal closed, 'new' = creating, BoardGame = editing that game
type Editing = BoardGame | 'new' | null;

export default function BoardGamesPage() {
  const query = useQuery(boardGamesQuery());
  const deleteBoardGame = useDeleteBoardGame();
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);
  const [syncOpened, sync] = useDisclosure(false);

  function handleDelete(game: BoardGame) {
    confirmDelete({
      title: 'Supprimer le jeu',
      message: `Supprimer « ${game.title} » ? Cette action est irréversible.`,
      onConfirm: () =>
        deleteBoardGame.mutate(game.id, {
          onSuccess: () => notifySuccess('Jeu supprimé'),
          onError: (error) => notifyDeleteError(error, 'Ce jeu a déjà été joué lors d’une soirée.'),
        }),
    });
  }

  const games = [...(query.data ?? [])].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Jeux</Title>
        <Group gap="xs">
          <Button variant="default" onClick={sync.open}>
            Synchroniser avec BGG
          </Button>
          <Button onClick={() => setEditing('new')}>Ajouter un jeu</Button>
        </Group>
      </Group>

      <QueryState query={query} />

      {query.data && games.length === 0 && (
        <EmptyState message="Aucun jeu pour l’instant." action="Ajouter un jeu" onAction={() => setEditing('new')} />
      )}

      {games.length > 0 && (
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Titre</Table.Th>
              <Table.Th>Joueurs</Table.Th>
              <Table.Th visibleFrom="xs">Durée</Table.Th>
              <Table.Th visibleFrom="sm">Description</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {games.map((game) => (
              <Table.Tr key={game.id}>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar src={game.thumbnailUrl} name={game.title} color="initials" radius="sm" size="md" />
                    <Stack gap={0}>
                      <Text fw={500} size="sm">
                        {game.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {[game.yearPublished, game.bggRating && `★ ${game.bggRating.toFixed(1)}`].filter(Boolean).join(' · ')}
                        {game.bggId && (
                          <>
                            {(game.yearPublished || game.bggRating) && ' · '}
                            <Anchor href={bggUrl(game.bggId)} target="_blank" rel="noreferrer" size="xs">
                              BGG
                            </Anchor>
                          </>
                        )}
                      </Text>
                    </Stack>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}–${game.maxPlayers}`}
                </Table.Td>
                <Table.Td visibleFrom="xs">{game.playingTime ? `${game.playingTime} min` : '–'}</Table.Td>
                <Table.Td visibleFrom="sm">
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {game.description}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    <ActionIcon variant="subtle" aria-label={`Modifier ${game.title}`} onClick={() => setEditing(game)}>
                      ✎
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label={`Supprimer ${game.title}`}
                      onClick={() => handleDelete(game)}
                    >
                      ✕
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={editing !== null} onClose={close} title={editing === 'new' ? 'Ajouter un jeu' : 'Modifier le jeu'} centered>
        {editing !== null && <BoardGameForm game={editing === 'new' ? undefined : editing} onSuccess={close} onCancel={close} />}
      </Modal>

      <Text size="xs" c="dimmed" ta="center">
        Données de jeux fournies par{' '}
        <Anchor href="https://boardgamegeek.com" target="_blank" rel="noreferrer" size="xs">
          BoardGameGeek
        </Anchor>
      </Text>

      <Modal opened={syncOpened} onClose={sync.close} title="Synchroniser avec BoardGameGeek" centered>
        {syncOpened && <BggSyncForm onDone={sync.close} />}
      </Modal>
    </Stack>
  );
}
