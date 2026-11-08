import { useQuery } from '@tanstack/react-query';
import { playersQuery } from '../api/players';

export default function PlayerSelectorList() {
  const players = useQuery(playersQuery());
  console.log(players.data);

  return <h2>coucou</h2>;
}
