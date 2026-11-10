import { z } from 'zod';

// Zod schemas for the parsed XML (attributes are flattened, values are strings).
// Everything optional is coerced defensively: BGG data is user-maintained.

const valueAttr = z.object({ value: z.string() });
const optionalNumber = valueAttr.optional().transform((v) => {
  const n = v ? Number(v.value) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
});

const nameSchema = z.object({ type: z.string(), value: z.string() });

const searchDocSchema = z.object({
  items: z.object({
    item: z
      .array(
        z.object({
          id: z.string(),
          name: z.array(nameSchema),
          yearpublished: optionalNumber,
        }),
      )
      .optional(),
  }),
});

const thingDocSchema = z.object({
  items: z.object({
    item: z
      .array(
        z.object({
          id: z.string(),
          type: z.string(),
          thumbnail: z.string().optional(),
          image: z.string().optional(),
          name: z.array(nameSchema),
          description: z.string().optional(),
          yearpublished: optionalNumber,
          minplayers: optionalNumber,
          maxplayers: optionalNumber,
          playingtime: optionalNumber,
          statistics: z
            .object({ ratings: z.object({ average: valueAttr.optional() }).optional() })
            .optional(),
        }),
      )
      .optional(),
  }),
});

const collectionDocSchema = z.object({
  items: z.object({
    item: z.array(z.object({ objectid: z.string() })).optional(),
  }),
});

export type BggSearchResult = {
  bggId: number;
  name: string;
  yearPublished: number | null;
};

/** The subset of BoardGame fields BGG can fill. */
export type BggGame = {
  bggId: number;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  description: string | null;
  yearPublished: number | null;
  playingTime: number | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  bggRating: number | null;
};

function primaryName(names: { type: string; value: string }[]) {
  return (names.find((n) => n.type === 'primary') ?? names[0]).value;
}

export function parseSearch(doc: unknown): BggSearchResult[] {
  const items = searchDocSchema.parse(doc).items.item ?? [];
  return items.map((item) => ({
    bggId: Number(item.id),
    // Search results carry the name that matched the query (possibly a translation).
    name: primaryName(item.name),
    yearPublished: item.yearpublished,
  }));
}

export function parseThings(doc: unknown): BggGame[] {
  const items = thingDocSchema.parse(doc).items.item ?? [];
  return items.map((item) => {
    const minPlayers = item.minplayers ?? 1;
    const rating = Number(item.statistics?.ratings?.average?.value);
    return {
      bggId: Number(item.id),
      title: primaryName(item.name),
      minPlayers,
      maxPlayers: Math.max(item.maxplayers ?? minPlayers, minPlayers),
      description: item.description?.trim() || null,
      yearPublished: item.yearpublished,
      playingTime: item.playingtime,
      thumbnailUrl: item.thumbnail?.trim() || null,
      imageUrl: item.image?.trim() || null,
      bggRating: Number.isFinite(rating) && rating > 0 ? Math.round(rating * 100) / 100 : null,
    };
  });
}

export function parseCollectionIds(doc: unknown): number[] {
  const items = collectionDocSchema.parse(doc).items.item ?? [];
  return [...new Set(items.map((item) => Number(item.objectid)))];
}
