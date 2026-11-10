# Meeplog

Carnet de soirées jeux de société : on enregistre les soirées, les jeux joués, les scores de chaque joueur, et l'app calcule les classements.

## Stack

| Partie | Technos |
| --- | --- |
| Front (`/`) | React 19, Vite, TypeScript, Mantine 9 (core, form, dates, modals, notifications), TanStack Query, React Router |
| API (`/server`) | Express 5, Zod, Prisma, PostgreSQL |

## Démarrer

Prérequis : Node 20+ et une base PostgreSQL.

```bash
# API
cd server
npm install
# server/.env : DATABASE_URL=postgresql://... et PORT=4000
npm run db:push    # crée les tables
npm run db:seed    # données de démo (optionnel)
npm run dev        # http://localhost:4000

# Front (autre terminal, à la racine)
npm install
npm run dev        # http://localhost:5173
```

En dev, Vite redirige `/api/*` vers `http://localhost:4000` (voir `vite.config.ts`). En production, définir `VITE_API_URL`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de dev Vite |
| `npm run build` | Vérification TypeScript + build de production |
| `npm run lint` | ESLint |
| `server: npm run db:reset` | Réinitialise la base et relance le seed |

Le dossier `server/requests` contient des requêtes `.http` pour tester l'API à la main.

## Organisation du front

```
src/
  api/          client fetch, types, query options et mutations par ressource
  components/   formulaires (GameNightFields, PlayForm, PlayerForm, BoardGameForm) et composants d'affichage
  pages/        une page par route
  utils/        dates, statistiques (victoires, classements), notifications et confirmations
```

Conventions :

- Les formulaires utilisent `@mantine/form`, avec des fonctions pures `validate`, `toInput` et `toFormValues` définies hors du composant.
- Un même formulaire sert à la création et à la modification : il reçoit l'entité en prop optionnelle.
- Les pages de détail chargent la donnée, puis montent le formulaire une fois qu'elle est disponible, ce qui évite un `useEffect` pour initialiser les valeurs.
- Après une mutation, on invalide les query keys de la ressource concernée.
