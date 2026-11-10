import { Group, Pill, Select, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useAddGameNightPlayer, useRemoveGameNightPlayer } from '../api/game-nights';
import { playersQuery } from '../api/players';
import type { GameNight } from '../api/types';
import { notifyDeleteError, notifyError } from '../utils/feedback';

/** Players of a game night, with inline add / remove. */
export default function NightPlayers({ night }: { night: GameNight }) {
  const allPlayers = useQuery(playersQuery());
  const addPlayer = useAddGameNightPlayer(night.id);
  const removePlayer = useRemoveGameNightPlayer(night.id);

  const presentIds = new Set(night.players.map((p) => p.id));
  const options =
    allPlayers.data?.filter((p) => !presentIds.has(p.id)).map((p) => ({ value: String(p.id), label: p.name })) ?? [];

  function handleAdd(id: string | null) {
    if (!id) return;
    addPlayer.mutate(Number(id), { onError: (error) => notifyError(error, 'Le joueur n’a pas pu être ajouté') });
  }

  function handleRemove(playerId: number, name: string) {
    removePlayer.mutate(playerId, {
      onError: (error) => notifyDeleteError(error, `${name} a des scores dans cette soirée : supprimez d’abord ses parties.`),
    });
  }

  return (
    <Stack gap="xs">
      <Text fw={600}>Joueurs</Text>
      <Group gap="xs">
        {night.players.map((player) => (
          <Pill key={player.id} size="md" withRemoveButton onRemove={() => handleRemove(player.id, player.name)}>
            {player.name}
          </Pill>
        ))}
        {options.length > 0 && (
          <Select
            size="xs"
            w={180}
            placeholder="+ Ajouter un joueur"
            data={options}
            searchable
            value={null}
            onChange={handleAdd}
            disabled={addPlayer.isPending}
          />
        )}
      </Group>
    </Stack>
  );
}
