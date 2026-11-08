import { useQuery } from '@tanstack/react-query';
import { NavLink, Route, Routes } from 'react-router';
import { Link } from 'react-router';
import { gameNightsQuery } from '../api/game-nights';
import { QueryState } from '../components/QueryState';

export default function GameNightsPage() {
  const query = useQuery(gameNightsQuery());

  return (
    <section>
      <h1>Soirées</h1>
      <QueryState query={query} />
      <ul>
        {query.data?.map((night) => (
          <li key={night.id}>
            <Link to={`/game-nights/${night.id}`}>{new Date(night.date).toLocaleDateString()}</Link>
            {night.location && ` — ${night.location}`} · {night.players.length} joueurs · {night.playCount} parties
          </li>
        ))}
      </ul>
      <NavLink to="new">Créer une soirée</NavLink>
    </section>
  );
}
