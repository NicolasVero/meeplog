import { AppShell, Container, Group, Text } from '@mantine/core';
import { NavLink, Route, Routes } from 'react-router';
import GameNightsPage from './pages/GameNightsPage';
import CreateGameNightsPage from './pages/CreateGameNightsPage';
import GameNightPage from './pages/GameNightPage';
import BoardGamesPage from './pages/BoardGamesPage';
import PlayersPage from './pages/PlayersPage';
import classes from './App.module.css';

const links = [
  { to: '/game-nights', label: 'Soirées' },
  { to: '/board-games', label: 'Jeux' },
  { to: '/players', label: 'Joueurs' },
];

export default function App() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Container size="md" h="100%">
          <Group h="100%" justify="space-between">
            <Text fw={700}>Meeplog</Text>
            <Group gap={4} component="nav">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={classes.link}>
                  {link.label}
                </NavLink>
              ))}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="md">
          <Routes>
            <Route index element={<h1>index</h1>} />
            <Route path="game-nights" element={<GameNightsPage />} />
            <Route path="game-nights/new" element={<CreateGameNightsPage />} />
            <Route path="game-nights/:id" element={<GameNightPage />} />
            <Route path="board-games" element={<BoardGamesPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="*" element={<p>Page introuvable.</p>} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
