import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { bggConfigQuery, useBggSync } from '../api/bgg';
import { notifySuccess } from '../utils/feedback';
import ApiErrorAlert from './ApiErrorAlert';

type Props = {
  onDone: () => void;
};

export default function BggSyncForm({ onDone }: Props) {
  const config = useQuery(bggConfigQuery());
  const sync = useBggSync();
  const username = config.data?.username;

  function handleSync() {
    sync.mutate(undefined, {
      onSuccess: (report) => notifySuccess(`${report.total} jeux synchronisés depuis BGG`),
    });
  }

  if (config.data && !username) {
    return (
      <Stack>
        <Alert color="yellow" title="Pseudo BGG manquant">
          Ajoutez <code>BGG_USERNAME=votre_pseudo</code> dans <code>server/.env</code>, puis redémarrez le serveur.
        </Alert>
        <Group justify="flex-end">
          <Button onClick={onDone}>Fermer</Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack>
      <ApiErrorAlert error={config.error ?? sync.error} title="La synchronisation a échoué" />

      {sync.data ? (
        <Alert color="teal" title="Synchronisation terminée">
          {sync.data.total} jeux dans la collection : {sync.data.created} ajoutés, {sync.data.updated} mis à jour.
        </Alert>
      ) : (
        <Text size="sm">
          Synchroniser la collection BGG de <b>{username ?? '…'}</b> ? Les jeux que vous possédez sont ajoutés, ceux déjà présents
          sont mis à jour. Aucun jeu n’est supprimé.
        </Text>
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
            <Button onClick={handleSync} loading={sync.isPending} disabled={!username} data-autofocus>
              Synchroniser
            </Button>
          </>
        )}
      </Group>
    </Stack>
  );
}
