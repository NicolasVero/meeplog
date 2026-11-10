import { Alert, Center, Loader } from '@mantine/core';
import type { UseQueryResult } from '@tanstack/react-query';

export function QueryState({ query }: { query: UseQueryResult }) {
  if (query.isPending) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }
  if (query.isError) {
    return (
      <Alert color="red" title="Impossible de charger les données">
        {query.error.message}
      </Alert>
    );
  }
  return null;
}
