import { useQuery } from '@tanstack/react-query';
import { playersQuery } from '../api/players';
import { QueryState } from '../components/QueryState';
import { Button, Group, Title, Modal, Input } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AddPlayerForm from '../components/AddPlayerForm';

export default function PlayersPage() {
  const query = useQuery(playersQuery());
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <section>
        <Title order={1}>Joueurs</Title>
        <Group justify="flex-end">
          <Button variant="default" onClick={open}>
            Créer un joueur
          </Button>
        </Group>
        <QueryState query={query} />
        <ul>
          {query.data?.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      </section>

      <Modal opened={opened} onClose={close} title="Créer un joueur" centered>
        <AddPlayerForm onSuccess={close} />
      </Modal>
    </>
  );
}
