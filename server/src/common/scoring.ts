export type ScoringMode = 'HIGHEST_WINS' | 'LOWEST_WINS';

/** The score that wins a play: the highest or the lowest, depending on the game. */
export function winningScore(scores: number[], mode: ScoringMode): number | null {
  if (scores.length === 0) return null;
  return mode === 'LOWEST_WINS' ? Math.min(...scores) : Math.max(...scores);
}

/** Positive when score a beats score b, negative when it loses, 0 on a tie. */
export function compareScores(a: number, b: number, mode: ScoringMode): number {
  return mode === 'LOWEST_WINS' ? b - a : a - b;
}
