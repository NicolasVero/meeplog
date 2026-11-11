import { describe, expect, it } from 'vitest';
import { parseCollectionIds, parseSearch, parseThings, parseXml, sortSearchResults } from '../../src/bgg/bgg.parser';

// Trimmed-down copies of real XML API2 answers.

const SEARCH_XML = `<?xml version="1.0" encoding="utf-8"?>
<items total="3" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="271512">
    <name type="alternate" value="5211: Azul"/>
    <yearpublished value="2019" />
  </item>
  <item type="boardgame" id="431038">
    <name type="primary" value="Azul Duel"/>
    <yearpublished value="2025" />
  </item>
  <item type="boardgame" id="230802">
    <name type="primary" value="Azul"/>
    <yearpublished value="2017" />
  </item>
</items>`;

const THING_XML = `<?xml version="1.0" encoding="utf-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="230802">
    <thumbnail>https://cf.geekdo-images.com/small/pic6973671.png</thumbnail>
    <image>https://cf.geekdo-images.com/original/pic6973671.png</image>
    <name type="primary" sortindex="1" value="Azul" />
    <name type="alternate" sortindex="1" value="アズール" />
    <description>Tiles from the Moors&#10;&#10;Draft tiles &amp; score points &mdash; most points wins.</description>
    <yearpublished value="2017" />
    <minplayers value="2" />
    <maxplayers value="4" />
    <playingtime value="45" />
    <statistics page="1"><ratings><average value="7.73829" /></ratings></statistics>
  </item>
</items>`;

describe('parseSearch', () => {
  it('reads id, name and year of each result', () => {
    expect(parseSearch(parseXml(SEARCH_XML))).toEqual([
      { bggId: 271512, name: '5211: Azul', yearPublished: 2019 },
      { bggId: 431038, name: 'Azul Duel', yearPublished: 2025 },
      { bggId: 230802, name: 'Azul', yearPublished: 2017 },
    ]);
  });

  it('handles a single result (XML gives one element, not a list)', () => {
    const xml = `<items total="1"><item type="boardgame" id="9209"><name type="alternate" value="Les Aventuriers du Rail"/></item></items>`;
    expect(parseSearch(parseXml(xml))).toEqual([{ bggId: 9209, name: 'Les Aventuriers du Rail', yearPublished: null }]);
  });

  it('handles no result at all', () => {
    expect(parseSearch(parseXml(`<items total="0"></items>`))).toEqual([]);
  });
});

describe('parseThings', () => {
  it('maps a game to the BoardGame fields', () => {
    const [game] = parseThings(parseXml(THING_XML));

    expect(game).toEqual({
      bggId: 230802,
      title: 'Azul', // the primary name, not a translation
      minPlayers: 2,
      maxPlayers: 4,
      description: 'Tiles from the Moors\n\nDraft tiles & score points — most points wins.',
      yearPublished: 2017,
      playingTime: 45,
      thumbnailUrl: 'https://cf.geekdo-images.com/small/pic6973671.png',
      imageUrl: 'https://cf.geekdo-images.com/original/pic6973671.png',
      bggRating: 7.74,
    });
  });

  it('tolerates missing or zero values in user-maintained data', () => {
    const xml = `<items><item type="boardgame" id="1">
      <name type="primary" value="Prototype" />
      <minplayers value="3" /><maxplayers value="0" /><playingtime value="0" />
      <statistics><ratings><average value="0" /></ratings></statistics>
    </item></items>`;

    expect(parseThings(parseXml(xml))[0]).toMatchObject({
      minPlayers: 3,
      maxPlayers: 3, // never below the minimum
      playingTime: null,
      yearPublished: null,
      description: null,
      thumbnailUrl: null,
      bggRating: null, // 0 means "not rated" on BGG
    });
  });
});

describe('parseCollectionIds', () => {
  it('returns each owned game once', () => {
    const xml = `<items totalitems="3">
      <item objecttype="thing" objectid="230802" subtype="boardgame" collid="1"><name sortindex="1">Azul</name></item>
      <item objecttype="thing" objectid="9209" subtype="boardgame" collid="2"><name sortindex="1">Ticket to Ride</name></item>
      <item objecttype="thing" objectid="230802" subtype="boardgame" collid="3"><name sortindex="1">Azul</name></item>
    </items>`;
    expect(parseCollectionIds(parseXml(xml))).toEqual([230802, 9209]);
  });
});

describe('sortSearchResults', () => {
  const result = (name: string, yearPublished: number | null = null) => ({ bggId: name.length, name, yearPublished });

  it('puts the exact title first, then titles starting with the query, then the rest', () => {
    const sorted = sortSearchResults('azul', [result('5211: Azul'), result('Azul Duel'), result('Azul'), result('Azuleo')]);
    expect(sorted.map((r) => r.name)).toEqual(['Azul', 'Azuleo', 'Azul Duel', '5211: Azul']);
  });

  it('ignores case and accents', () => {
    const sorted = sortSearchResults('les aventuriers du rail', [
      result('Les Aventuriers du Rail: Europe'),
      result('LES AVENTURIERS DU RAÏL'),
    ]);
    expect(sorted[0].name).toBe('LES AVENTURIERS DU RAÏL');
  });

  it('prefers the most recent edition when titles are equally close', () => {
    const sorted = sortSearchResults('catan', [result('Catan', 1995), result('Catan', 2015)]);
    expect(sorted.map((r) => r.yearPublished)).toEqual([2015, 1995]);
  });
});
