import { Button, Paper, Stack, Text } from '@mantine/core';

type Props = {
  message: string;
  action?: string;
  onAction?: () => void;
};

export default function EmptyState({ message, action, onAction }: Props) {
  return (
    <Paper withBorder p="xl" radius="md">
      <Stack align="center" gap="sm">
        <Text c="dimmed">{message}</Text>
        {action && onAction && (
          <Button variant="light" onClick={onAction}>
            {action}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
