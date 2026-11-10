import { Button, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <Stack align="center" py="xl">
      <Title order={1}>Page introuvable</Title>
      <Text c="dimmed">Cette page n’existe pas ou a été supprimée.</Text>
      <Button component={Link} to="/" variant="light">
        Retour à l’accueil
      </Button>
    </Stack>
  );
}
