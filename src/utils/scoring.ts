import type { ScoringMode } from '../api/types';

// Mirrors server/src/common/scoring.ts.

export const SCORING_MODES: { value: ScoringMode; label: string; description: string }[] = [
  { value: 'HIGHEST_WINS', label: 'Le plus haut score gagne', description: 'Un score par joueur, le meilleur gagne.' },
  { value: 'LOWEST_WINS', label: 'Le plus bas score gagne', description: 'Un score par joueur, le plus petit gagne.' },
  { value: 'WINNER_ONLY', label: 'Gagnant désigné, sans score', description: 'On coche le ou les gagnants.' },
  {
    value: 'COOPERATIVE',
    label: 'Coopératif',
    description: 'L’équipe gagne ou perd ensemble. Pas compté dans le classement.',
  },
];

/** Games where scores are entered and decide the winner. */
export function usesScores(mode: ScoringMode): boolean {
  return mode === 'HIGHEST_WINS' || mode === 'LOWEST_WINS';
}

/** Games where players compete against each other (counted in rankings). */
export function isCompetitive(mode: ScoringMode): boolean {
  return mode !== 'COOPERATIVE';
}
