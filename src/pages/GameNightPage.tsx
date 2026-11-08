import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { Button, Group, Text, Title } from '@mantine/core';
import { gameNightQuery } from '../api/game-nights';
import { QueryState } from '../components/QueryState';

export default function GameNightPage() {
  const id = Number(useParams().id);
  const query = useQuery(gameNightQuery(id));
  const night = query.data;

  return (
    <section>
      <QueryState query={query} />
      {night && (
        <>
          <Group justify="space-between" align="center">
            <Title order={1}>Soirée du {new Date(night.date).toLocaleDateString()}</Title>
            <Button component={Link} to="edit" variant="light">
              Modifier
            </Button>
          </Group>
          {night.location && <Text>Lieu : {night.location}</Text>}
          {night.notes && <Text c="dimmed">{night.notes}</Text>}
          <p>Joueurs : {night.players.map((p) => p.name).join(', ')}</p>
          <ul>
            {night.plays.map((play) => (
              <li key={play.id}>
                {play.boardGame.title} — {play.scores.map((s) => `${s.player.name} ${s.score}`).join(', ')}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
