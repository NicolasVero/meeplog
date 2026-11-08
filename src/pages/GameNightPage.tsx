import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { gameNightQuery } from '../api/game-nights';
import { QueryState } from '../components/QueryState';

export default function GameNightPage() {
  const id = Number(useParams().id);
  const query = useQuery(gameNightQuery(id));
  const night = query.data;

  return (
    <section>
      <QueryState query={query} />
      {night && (
        <>
          <h1>Soirée du {new Date(night.date).toLocaleDateString()}</h1>
          <p>Joueurs : {night.players.map((p) => p.name).join(', ')}</p>
          <ul>
            {night.plays.map((play) => (
              <li key={play.id}>
                {play.boardGame.title} — {play.scores.map((s) => `${s.player.name} ${s.score}`).join(', ')}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
