import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { Button, Group, Text, Title, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { gameNightQuery } from '../api/game-nights';
import { QueryState } from '../components/QueryState';
import AddPlayForm from '../components/AddPlayForm';

export default function GameNightPage() {
  const id = Number(useParams().id);
  const query = useQuery(gameNightQuery(id));
  const night = query.data;
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <section>
        <QueryState query={query} />
        {night && (
          <>
            <Group justify="space-between" align="center">
              <Title order={1}>Soirée du {new Date(night.date).toLocaleDateString()}</Title>
              <Group>
                <Button component={Link} to="edit" variant="light">
                  Modifier
                </Button>
                <Button variant="default" onClick={open}>
                  Ajouter un jeu
                </Button>
              </Group>
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

      <Modal opened={opened} onClose={close} title="Créer une partie" centered>
        <AddPlayForm nightId={id} players={night?.players ?? []} onSuccess={close} />
      </Modal>
    </>
  );
}
