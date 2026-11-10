import { Alert, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useBggSync } from '../api/bgg';
import { notifySuccess } from '../utils/feedback';
import ApiErrorAlert from './ApiErrorAlert';

type Props = {
  onDone: () => void;
};

export default function BggSyncForm({ onDone }: Props) {
  // Remembered in this browser only, so the field is pre-filled next time.
  const [username, setUsername] = useLocalStorage({ key: 'meeplog:bgg-username', defaultValue: '' });
  const sync = useBggSync();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sync.mutate(username.trim() || undefined, {
      onSuccess: (report) => notifySuccess(`${report.total} jeux synchronisés depuis BGG`),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Text size="sm">
          Importe les jeux que vous possédez sur BoardGameGeek. Les jeux déjà présents (même identifiant BGG ou même titre) sont
          mis à jour, aucun jeu n’est supprimé.
        </Text>

        <ApiErrorAlert error={sync.error} title="La synchronisation a échoué" />

        {sync.data ? (
          <Alert color="teal" title="Synchronisation terminée">
            {sync.data.total} jeux dans la collection de {sync.data.username} : {sync.data.created} ajoutés, {sync.data.updated}{' '}
            mis à jour.
          </Alert>
        ) : (
          <TextInput
            label="Pseudo BoardGameGeek"
            description="Laissez vide pour utiliser BGG_USERNAME configuré sur le serveur."
            data-autofocus
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            disabled={sync.isPending}
          />
        )}

        {sync.isPending && (
          <Text size="xs" c="dimmed">
            BGG limite le nombre de requêtes : comptez quelques secondes par lot de 20 jeux.
          </Text>
        )}

        <Group justify="flex-end">
          {sync.data ? (
            <Button onClick={onDone}>Fermer</Button>
          ) : (
            <>
              <Button variant="default" onClick={onDone} disabled={sync.isPending}>
                Annuler
              </Button>
              <Button type="submit" loading={sync.isPending}>
                Synchroniser
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </form>
  );
}
