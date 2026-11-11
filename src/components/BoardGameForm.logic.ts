import type { FormErrors } from '@mantine/form';
import type { BoardGame, CreateBoardGameInput } from '../api/types';

/** BGG data that is not edited by hand, kept as-is while the game stays linked. */
export type BggLink = {
  bggId: number;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  bggRating: number | null;
};

export type FormValues = {
  title: string;
  minPlayers: number | '';
  maxPlayers: number | '';
  playingTime: number | '';
  yearPublished: number | '';
  description: string;
  bgg: BggLink | null;
};

export function toFormValues(game?: BoardGame): FormValues {
  return {
    title: game?.title ?? '',
    minPlayers: game?.minPlayers ?? 2,
    maxPlayers: game?.maxPlayers ?? 4,
    playingTime: game?.playingTime ?? '',
    yearPublished: game?.yearPublished ?? '',
    description: game?.description ?? '',
    bgg: game?.bggId
      ? { bggId: game.bggId, thumbnailUrl: game.thumbnailUrl, imageUrl: game.imageUrl, bggRating: game.bggRating }
      : null,
  };
}

export function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) errors.title = 'Le titre est obligatoire';
  if (values.minPlayers === '' || values.minPlayers < 1) errors.minPlayers = 'Au moins 1 joueur';
  if (values.maxPlayers === '') errors.maxPlayers = 'Obligatoire';
  else if (values.minPlayers !== '' && values.maxPlayers < values.minPlayers) {
    errors.maxPlayers = 'Doit être supérieur ou égal au minimum';
  }
  return errors;
}

const orNull = (value: number | '') => (value === '' ? null : value);

export function toInput(values: FormValues): CreateBoardGameInput {
  return {
    title: values.title.trim(),
    minPlayers: Number(values.minPlayers),
    maxPlayers: Number(values.maxPlayers),
    playingTime: orNull(values.playingTime),
    yearPublished: orNull(values.yearPublished),
    description: values.description.trim() || null,
    bggId: values.bgg?.bggId ?? null,
    thumbnailUrl: values.bgg?.thumbnailUrl ?? null,
    imageUrl: values.bgg?.imageUrl ?? null,
    bggRating: values.bgg?.bggRating ?? null,
  };
}
