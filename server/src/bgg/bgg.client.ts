import { XMLParser } from 'fast-xml-parser';
import { HttpError } from '../common/errors';

// BGG XML API2. The domain must be boardgamegeek.com WITHOUT "www".
const BASE_URL = 'https://boardgamegeek.com/xmlapi2';

// BGG asks clients to be gentle: keep at least this delay between two requests.
const MIN_DELAY_MS = 2500;
const MAX_ATTEMPTS = 6;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  htmlEntities: true, // descriptions contain &#10;, &mdash;, …
  // Elements that can appear once or many times are always parsed as arrays.
  isArray: (name) => ['item', 'name', 'link'].includes(name),
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequestAt = 0;
// Requests are chained so that concurrent calls still respect MIN_DELAY_MS.
let queue: Promise<unknown> = Promise.resolve();

function token() {
  const value = process.env.BGG_API_TOKEN;
  if (!value) throw new HttpError(503, 'BGG_API_TOKEN is not configured on the server');
  return value;
}

async function fetchOnce(url: string): Promise<Response> {
  const wait = lastRequestAt + MIN_DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  return fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
}

/**
 * GET an XML API2 endpoint and return the parsed document.
 * Retries on 202 (collection export still being prepared) and 429 / 5xx (rate limit, hiccups).
 */
export function bggGet(path: string, params: Record<string, string | number>): Promise<unknown> {
  const search = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const url = `${BASE_URL}/${path}?${search}`;

  const run = async () => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const res = await fetchOnce(url);

      if (res.status === 200) return parser.parse(await res.text());

      if (res.status === 401 || res.status === 403) {
        throw new HttpError(502, 'BGG rejected the API token');
      }
      if (res.status === 202 || res.status === 429 || res.status >= 500) {
        await sleep(attempt * 3000); // back off a bit more on each attempt
        continue;
      }
      throw new HttpError(502, `BGG answered ${res.status}`);
    }
    throw new HttpError(504, 'BGG is busy, try again in a moment');
  };

  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}
