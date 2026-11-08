import type { UseQueryResult } from '@tanstack/react-query';

export function QueryState({ query }: { query: UseQueryResult }) {
  if (query.isPending) return <p>Chargement…</p>;
  if (query.isError) return <p role="alert">Erreur : {query.error.message}</p>;
  return null;
}
