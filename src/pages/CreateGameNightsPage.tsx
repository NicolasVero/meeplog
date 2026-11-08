import { ISODate } from '../utils/dates';
import PlayerSelectorList from '../components/PlayerSelectorList';

export default function CreateGameNightsPage() {
  return (
    <form>
      <input type="date" name="game-night-date" value={ISODate()} />
      <PlayerSelectorList />
    </form>
  );
}
