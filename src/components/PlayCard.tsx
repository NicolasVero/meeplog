import { ActionIcon, Badge, Card, Group, Table, Text } from '@mantine/core';
import type { Play } from '../api/types';
import { usesScores } from '../utils/scoring';
import { winnersOf } from '../utils/stats';

type Props = {
  play: Play;
  onEdit: () => void;
  onDelete: () => void;
};

export default function PlayCard({ play, onEdit, onDelete }: Props) {
  const mode = play.boardGame.scoringMode;
  const scored = usesScores(mode);
  const winners = new Set(winnersOf(play));

  // Best first: by score (lowest first when the lowest wins), else winners first, then by name.
  const scores = [...play.scores].sort((a, b) => {
    if (scored) {
      const diff = (a.score ?? 0) - (b.score ?? 0);
      if (diff !== 0) return mode === 'LOWEST_WINS' ? diff : -diff;
    } else if (winners.has(a.player.id) !== winners.has(b.player.id)) {
      return winners.has(a.player.id) ? -1 : 1;
    }
    return a.player.name.localeCompare(b.player.name);
  });

  return (
    <Card withBorder padding="md">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <Text fw={600} truncate>
            {play.boardGame.title}
          </Text>
          {mode === 'COOPERATIVE' && (
            <Badge size="sm" color={winners.size > 0 ? 'teal' : 'red'} variant="light">
              {winners.size > 0 ? 'Victoire de l’équipe' : 'Défaite de l’équipe'}
            </Badge>
          )}
        </Group>
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
          {scores.map(({ player, score }, i) => {
            const won = mode !== 'COOPERATIVE' && winners.has(player.id);
            return (
              <Table.Tr key={player.id}>
                {scored && (
                  <Table.Td w={32} c="dimmed">
                    {i + 1}.
                  </Table.Td>
                )}
                <Table.Td>
                  <Group gap="xs">
                    <Text size="sm" fw={won ? 600 : undefined}>
                      {player.name}
                    </Text>
                    {won && (
                      <Badge size="xs" color="yellow" variant="light">
                        Victoire
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                {scored && (
                  <Table.Td ta="right" ff="monospace">
                    {score}
                  </Table.Td>
                )}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
