export type ScoringMode = 'HIGHEST_WINS' | 'LOWEST_WINS' | 'WINNER_ONLY' | 'COOPERATIVE';

/** One player's line in a play, as stored. */
export type PlayResult = { playerId: number; score: number | null; won: boolean };

/** Score lines as Prisma returns them, with the player loaded. */
export function toResults(scores: { score: number | null; won: boolean; player: { id: number } }[]): PlayResult[] {
  return scores.map((s) => ({ playerId: s.player.id, score: s.score, won: s.won }));
}

/** Games where scores are entered and decide the winner. */
export function usesScores(mode: ScoringMode): boolean {
  return mode === 'HIGHEST_WINS' || mode === 'LOWEST_WINS';
}

/** Games where players compete against each other (counted in leaderboards and head-to-heads). */
export function isCompetitive(mode: ScoringMode): boolean {
  return mode !== 'COOPERATIVE';
}

/** The score that wins a play: the highest or the lowest, depending on the game. */
export function winningScore(scores: number[], mode: ScoringMode): number | null {
  if (scores.length === 0) return null;
  return mode === 'LOWEST_WINS' ? Math.min(...scores) : Math.max(...scores);
}

/**
 * Ids of the players who won a play: best score for scored games (all tied players),
 * players marked as winners otherwise (the whole team for a won cooperative game).
 */
export function winnerIds(results: PlayResult[], mode: ScoringMode): Set<number> {
  if (!usesScores(mode)) return new Set(results.filter((r) => r.won).map((r) => r.playerId));

  const scored = results.filter((r): r is PlayResult & { score: number } => r.score !== null);
  const best = winningScore(
    scored.map((r) => r.score),
    mode,
  );
  return new Set(scored.filter((r) => r.score === best).map((r) => r.playerId));
}

/** Positive when a finished ahead of b, negative when behind, 0 when level. */
export function compareResults(a: PlayResult, b: PlayResult, mode: ScoringMode): number {
  if (usesScores(mode) && a.score !== null && b.score !== null) {
    return mode === 'LOWEST_WINS' ? b.score - a.score : a.score - b.score;
  }
  return Number(a.won) - Number(b.won);
}
