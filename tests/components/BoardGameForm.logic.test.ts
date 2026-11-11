import { describe, expect, it } from 'vitest';
import { boardGame } from '../fixtures';
import { toFormValues, toInput, validate, type FormValues } from '../../src/components/BoardGameForm.logic';

const values = (overrides: Partial<FormValues> = {}): FormValues => ({ ...toFormValues(), title: 'Azul', ...overrides });

describe('validate', () => {
  it('accepts the default values once a title is set', () => {
    expect(validate(values())).toEqual({});
  });

  it('requires a non-blank title', () => {
    expect(validate(values({ title: '   ' })).title).toBe('Le titre est obligatoire');
  });

  it('requires at least one player', () => {
    expect(validate(values({ minPlayers: 0 })).minPlayers).toBeDefined();
    expect(validate(values({ minPlayers: '' })).minPlayers).toBeDefined();
  });

  it('rejects a maximum below the minimum', () => {
    expect(validate(values({ minPlayers: 4, maxPlayers: 2 })).maxPlayers).toBe('Doit être supérieur ou égal au minimum');
  });
});

describe('toInput', () => {
  it('trims text and turns empty optional fields into null', () => {
    expect(toInput(values({ title: '  Azul  ', description: '   ', playingTime: '', yearPublished: '' }))).toEqual({
      title: 'Azul',
      minPlayers: 2,
      maxPlayers: 4,
      playingTime: null,
      yearPublished: null,
      description: null,
      bggId: null,
      thumbnailUrl: null,
      imageUrl: null,
      bggRating: null,
    });
  });

  it('keeps the BGG link of a synced game', () => {
    const game = boardGame({ bggId: 230802, thumbnailUrl: 'https://img/t.png', imageUrl: 'https://img/i.png', bggRating: 7.7 });
    expect(toInput(toFormValues(game))).toMatchObject({
      bggId: 230802,
      thumbnailUrl: 'https://img/t.png',
      imageUrl: 'https://img/i.png',
      bggRating: 7.7,
    });
  });

  it('clears all BGG fields once the game is unlinked', () => {
    const game = boardGame({ bggId: 230802, thumbnailUrl: 'https://img/t.png', bggRating: 7.7 });
    expect(toInput({ ...toFormValues(game), bgg: null })).toMatchObject({
      bggId: null,
      thumbnailUrl: null,
      imageUrl: null,
      bggRating: null,
    });
  });
});
