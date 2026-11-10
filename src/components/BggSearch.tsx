import { useState } from 'react';
import { Loader, Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { bggSearchQuery, type BggSearchResult } from '../api/bgg';

type Props = {
  onSelect: (result: BggSearchResult) => void;
};

/** Searchable select backed by the BGG search endpoint. */
export default function BggSearch({ onSelect }: Props) {
  const [search, setSearch] = useState('');
  // Each keystroke would hit BGG (rate limited): wait for a short pause.
  const [debounced] = useDebouncedValue(search, 400);
  const results = useQuery(bggSearchQuery(debounced));

  const data =
    results.data?.map((r) => ({
      value: String(r.bggId),
      label: r.yearPublished ? `${r.name} (${r.yearPublished})` : r.name,
    })) ?? [];

  function handleChange(value: string | null) {
    const result = results.data?.find((r) => String(r.bggId) === value);
    if (result) onSelect(result);
  }

  return (
    <Select
      label="Rechercher sur BoardGameGeek"
      description="Pré-remplit le formulaire. Vous pourrez tout modifier avant d’enregistrer."
      placeholder="Ex. Azul, Les Aventuriers du Rail…"
      searchable
      clearable
      data-autofocus
      searchValue={search}
      onSearchChange={setSearch}
      onChange={handleChange}
      data={data}
      filter={({ options }) => options} // results are already filtered and ranked by the server
      rightSection={results.isFetching ? <Loader size="xs" /> : undefined}
      nothingFoundMessage={
        debounced.trim().length < 2 ? 'Tapez au moins 2 caractères' : results.isFetching ? 'Recherche…' : 'Aucun jeu trouvé'
      }
      error={results.isError ? 'La recherche BGG a échoué' : undefined}
    />
  );
}
