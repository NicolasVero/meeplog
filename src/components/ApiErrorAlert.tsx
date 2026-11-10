import { Alert, List } from '@mantine/core';
import { ApiError } from '../api/client';

type Props = {
  error: Error | null;
  title?: string;
};

export default function ApiErrorAlert({ error, title = 'Une erreur est survenue' }: Props) {
  if (!error) return null;

  const details = error instanceof ApiError ? error.details : undefined;

  return (
    <Alert color="red" title={title}>
      {error.message}
      {details && details.length > 0 && (
        <List size="sm" mt="xs">
          {details.map((d) => (
            <List.Item key={d.path}>
              {d.path} : {d.message}
            </List.Item>
          ))}
        </List>
      )}
    </Alert>
  );
}
