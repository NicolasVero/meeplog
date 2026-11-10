import prisma from '../prisma';
import { HttpError } from '../common/errors';
import { bggGet } from './bgg.client';
import { parseCollectionIds, parseSearch, parseThings, type BggGame, type BggSearchResult } from './bgg.parser';

const THINGS_PER_REQUEST = 20; // BGG limit for /thing

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** BGG returns search results unordered: rank exact, then prefix, then other matches. */
function rank(query: string, result: BggSearchResult) {
  const q = normalize(query);
  const name = normalize(result.name);
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.includes(q)) return 2;
  return 3;
}

export async function searchGames(query: string, limit = 20): Promise<BggSearchResult[]> {
  const results = parseSearch(await bggGet('search', { query, type: 'boardgame' }));
  return results
    .sort(
      (a, b) =>
        rank(query, a) - rank(query, b) ||
        a.name.length - b.name.length ||
        (b.yearPublished ?? 0) - (a.yearPublished ?? 0),
    )
    .slice(0, limit);
}

export async function fetchGames(ids: number[]): Promise<BggGame[]> {
  const games: BggGame[] = [];
  for (let i = 0; i < ids.length; i += THINGS_PER_REQUEST) {
    const batch = ids.slice(i, i + THINGS_PER_REQUEST);
    games.push(...parseThings(await bggGet('thing', { id: batch.join(','), stats: 1 })));
  }
  return games;
}

export async function fetchGame(id: number): Promise<BggGame> {
  const [game] = await fetchGames([id]);
  if (!game) throw new HttpError(404, 'No BGG game for id ' + id);
  return game;
}

export type SyncReport = {
  username: string;
  total: number;
  created: number;
  updated: number;
};

/**
 * One-way sync BGG -> database for the games the user owns.
 * Games are matched by bggId, then by exact title for games entered by hand before the sync.
 * Nothing is ever deleted locally.
 */
export async function syncCollection(username: string): Promise<SyncReport> {
  // subtype=boardgame also returns expansions on BGG, hence the explicit exclusion.
  const doc = await bggGet('collection', {
    username,
    own: 1,
    subtype: 'boardgame',
    excludesubtype: 'boardgameexpansion',
  });
  const ids = parseCollectionIds(doc);
  const games = await fetchGames(ids);

  let created = 0;
  let updated = 0;
  const now = new Date();

  for (const game of games) {
    const existing =
      (await prisma.boardGame.findUnique({ where: { bggId: game.bggId } })) ??
      (await prisma.boardGame.findFirst({
        where: { bggId: null, title: { equals: game.title, mode: 'insensitive' } },
      }));

    if (existing) {
      await prisma.boardGame.update({ where: { id: existing.id }, data: { ...game, bggSyncedAt: now } });
      updated++;
    } else {
      await prisma.boardGame.create({ data: { ...game, bggSyncedAt: now } });
      created++;
    }
  }

  return { username, total: games.length, created, updated };
}
