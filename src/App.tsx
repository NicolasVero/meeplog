import { NavLink, Route, Routes } from 'react-router';
import GameNightsPage from './pages/GameNightsPage';
import GameNightPage from './pages/GameNightPage';
import BoardGamesPage from './pages/BoardGamesPage';
import PlayersPage from './pages/PlayersPage';

export default function App() {
  return (
    <>
      <header className="app-header">
        <span className="app-title">Meeplog</span>
        <nav>
          <NavLink to="/">Soirées</NavLink>
          <NavLink to="/board-games">Jeux</NavLink>
          <NavLink to="/players">Joueurs</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route index element={<GameNightsPage />} />
          <Route path="game-nights/:id" element={<GameNightPage />} />
          <Route path="board-games" element={<BoardGamesPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="*" element={<p>Page introuvable.</p>} />
        </Routes>
      </main>
    </>
  );
}
