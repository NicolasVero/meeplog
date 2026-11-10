import { AppShell, Container, Group, Image } from '@mantine/core';
import { Link, NavLink, Route, Routes } from 'react-router';
import GameNightsPage from './pages/GameNightsPage';
import CreateGameNightsPage from './pages/CreateGameNightsPage';
import GameNightPage from './pages/GameNightPage';
import EditGameNightPage from './pages/EditGameNightPage';
import BoardGamesPage from './pages/BoardGamesPage';
import PlayersPage from './pages/PlayersPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ColorSchemeToggle from './components/ColorSchemeToggle';
import classes from './App.module.css';

const links = [
  { to: '/game-nights', label: 'Soirées' },
  { to: '/board-games', label: 'Jeux' },
  { to: '/players', label: 'Joueurs' },
];

export default function App() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header className={classes.header}>
        <Container size="md" h="100%">
          <Group h="100%" justify="space-between">
            <Link to="/" className={classes.logo} aria-label="Meeplog, accueil">
              <Image src="/logo-on-light.svg" alt="" h={32} w="auto" darkHidden />
              <Image src="/logo-on-dark.svg" alt="" h={32} w="auto" lightHidden />
            </Link>
            <Group gap="xs" wrap="nowrap">
              <Group gap={4} component="nav">
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={classes.link}>
                    {link.label}
                  </NavLink>
                ))}
              </Group>
              <ColorSchemeToggle />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main className={classes.main}>
        <Container size="md">
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="game-nights" element={<GameNightsPage />} />
            <Route path="game-nights/new" element={<CreateGameNightsPage />} />
            <Route path="game-nights/:id" element={<GameNightPage />} />
            <Route path="game-nights/:id/edit" element={<EditGameNightPage />} />
            <Route path="board-games" element={<BoardGamesPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
