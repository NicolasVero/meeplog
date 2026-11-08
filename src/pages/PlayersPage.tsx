import { useQuery } from '@tanstack/react-query';
import { playersQuery } from '../api/players';
import { QueryState } from '../components/QueryState';

export default function PlayersPage() {
  const query = useQuery(playersQuery());

  return (
    <section>
      <h1>Joueurs</h1>
      <QueryState query={query} />
      <ul>
        {query.data?.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
    </section>
  );
}
