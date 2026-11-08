import { useQuery } from '@tanstack/react-query';
import { boardGamesQuery } from '../api/board-games';
import { QueryState } from '../components/QueryState';

export default function BoardGamesPage() {
  const query = useQuery(boardGamesQuery());

  return (
    <section>
      <h1>Jeux</h1>
      <QueryState query={query} />
      <ul>
        {query.data?.map((game) => (
          <li key={game.id}>
            {game.title} ({game.minPlayers}-{game.maxPlayers} joueurs)
          </li>
        ))}
      </ul>
    </section>
  );
}
