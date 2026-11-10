import { ApiError } from '../api/client';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

export function notifySuccess(message: string) {
  notifications.show({ color: 'teal', message });
}

export function notifyError(error: Error, title = 'Une erreur est survenue') {
  notifications.show({ color: 'red', title, message: error.message });
}

type ConfirmDeleteOptions = {
  title: string;
  message: string;
  onConfirm: () => void;
};

export function confirmDelete({ title, message, onConfirm }: ConfirmDeleteOptions) {
  modals.openConfirmModal({
    title,
    centered: true,
    children: <Text size="sm">{message}</Text>,
    labels: { confirm: 'Supprimer', cancel: 'Annuler' },
    confirmProps: { color: 'red' },
    onConfirm,
  });
}

/** The API answers 409 when a row is still referenced (e.g. a game that was played). */
export function notifyDeleteError(error: Error, inUseMessage: string) {
  if (error instanceof ApiError && error.status === 409) {
    notifications.show({ color: 'red', title: 'Suppression impossible', message: inUseMessage });
  } else {
    notifyError(error, 'La suppression a échoué');
  }
}
