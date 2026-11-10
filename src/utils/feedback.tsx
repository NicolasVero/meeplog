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
