import { ActionIcon, Badge, Card, Group, Table, Text } from '@mantine/core';
import type { Play } from '../api/types';
import { winnersOf } from '../utils/stats';

type Props = {
  play: Play;
  onEdit: () => void;
  onDelete: () => void;
};

export default function PlayCard({ play, onEdit, onDelete }: Props) {
  // Scores arrive sorted by descending score from the API, sort again to be safe.
  const scores = [...play.scores].sort((a, b) => b.score - a.score);
  const winners = new Set(winnersOf(play));

  return (
    <Card withBorder padding="md">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Text fw={600}>{play.boardGame.title}</Text>
        <Group gap={4} wrap="nowrap">
          <ActionIcon variant="subtle" aria-label={`Modifier la partie de ${play.boardGame.title}`} onClick={onEdit}>
            ✎
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label={`Supprimer la partie de ${play.boardGame.title}`}
            onClick={onDelete}
          >
            ✕
          </ActionIcon>
        </Group>
      </Group>

      <Table verticalSpacing={4} withRowBorders={false}>
        <Table.Tbody>
          {scores.map(({ player, score }, i) => (
            <Table.Tr key={player.id}>
              <Table.Td w={32} c="dimmed">
                {i + 1}.
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Text size="sm" fw={winners.has(player.id) ? 600 : undefined}>
                    {player.name}
                  </Text>
                  {winners.has(player.id) && (
                    <Badge size="xs" color="yellow" variant="light">
                      Victoire
                    </Badge>
                  )}
                </Group>
              </Table.Td>
              <Table.Td ta="right" ff="monospace">
                {score}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
