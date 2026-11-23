import type { Play, Player } from '../api/types';
import { isCompetitive, usesScores } from './scoring';

/**
 * Ids of the players who won: best score for scored games (all tied players, highest or lowest
 * depending on the game), players marked as winners otherwise (the whole team in a won cooperative game).
 */
export function winnersOf(play: Play): number[] {
  if (!usesScores(play.boardGame.scoringMode)) return play.scores.filter((s) => s.won).map((s) => s.player.id);

  const values = play.scores.map((s) => s.score).filter((score) => score !== null);
  if (values.length === 0) return [];
  const best = play.boardGame.scoringMode === 'LOWEST_WINS' ? Math.min(...values) : Math.max(...values);
  return play.scores.filter((s) => s.score === best).map((s) => s.player.id);
}

export type PlayerStanding = {
  player: Player;
  wins: number;
  plays: number;
};

/** Wins and plays per player in competitive games (cooperative ones are left out), best first. */
export function standings(plays: Play[]): PlayerStanding[] {
  const byPlayer = new Map<number, PlayerStanding>();

  for (const play of plays) {
    if (!isCompetitive(play.boardGame.scoringMode)) continue;
    const winners = new Set(winnersOf(play));
    for (const { player } of play.scores) {
      const entry = byPlayer.get(player.id) ?? { player, wins: 0, plays: 0 };
      entry.plays += 1;
      if (winners.has(player.id)) entry.wins += 1;
      byPlayer.set(player.id, entry);
    }
  }

  return [...byPlayer.values()].sort(
    (a, b) => b.wins - a.wins || b.wins / b.plays - a.wins / a.plays || a.player.name.localeCompare(b.player.name),
  );
}

export type GamePopularity = {
  title: string;
  plays: number;
};

/** Number of plays per board game, most played first. */
export function mostPlayedGames(plays: Play[]): GamePopularity[] {
  const counts = new Map<number, GamePopularity>();
  for (const play of plays) {
    const entry = counts.get(play.boardGame.id) ?? { title: play.boardGame.title, plays: 0 };
    entry.plays += 1;
    counts.set(play.boardGame.id, entry);
  }
  return [...counts.values()].sort((a, b) => b.plays - a.plays || a.title.localeCompare(b.title));
}
