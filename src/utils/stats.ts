import type { Play, Player } from '../api/types';

/** Ids of the players with the highest score (several in case of a tie). */
export function winnersOf(play: Play): number[] {
  if (play.scores.length === 0) return [];
  const best = Math.max(...play.scores.map((s) => s.score));
  return play.scores.filter((s) => s.score === best).map((s) => s.player.id);
}

export type PlayerStanding = {
  player: Player;
  wins: number;
  plays: number;
};

/** Wins and plays per player, best first (wins, then win rate, then name). */
export function standings(plays: Play[]): PlayerStanding[] {
  const byPlayer = new Map<number, PlayerStanding>();

  for (const play of plays) {
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
