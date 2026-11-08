import { MultiSelect } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { playersQuery } from '../api/players';

type Props = {
  value: number[];
  onChange: (playerIds: number[]) => void;
  error?: string;
};

export default function PlayerSelectorList({ value, onChange, error }: Props) {
  const players = useQuery(playersQuery());
  const options = players.data?.map((player) => ({ value: String(player.id), label: player.name })) ?? [];

  return (
    <MultiSelect
      label="Joueurs"
      placeholder={players.isPending ? 'Chargement…' : 'Choisir des joueurs'}
      withAsterisk
      searchable
      clearable
      hidePickedOptions
      nothingFoundMessage="Aucun joueur trouvé"
      disabled={players.isPending}
      data={options}
      error={error ?? (players.isError ? 'Impossible de charger les joueurs' : undefined)}
      value={value.map(String)}
      onChange={(ids) => onChange(ids.map(Number))}
    />
  );
}
