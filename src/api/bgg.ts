import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { boardGameKeys } from './board-games';

export type BggSearchResult = {
  bggId: number;
  name: string;
  yearPublished: number | null;
};

export type BggGame = {
  bggId: number;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  description: string | null;
  yearPublished: number | null;
  playingTime: number | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  bggRating: number | null;
};

export type BggSyncReport = {
  username: string;
  total: number;
  created: number;
  updated: number;
};

export const bggUrl = (bggId: number) => `https://boardgamegeek.com/boardgame/${bggId}`;

export const bggSearchQuery = (q: string) =>
  queryOptions({
    queryKey: ['bgg', 'search', q],
    queryFn: () => api.get<BggSearchResult[]>(`/bgg/search?q=${encodeURIComponent(q)}`),
    enabled: q.trim().length >= 2,
    staleTime: 10 * 60_000, // BGG data barely changes, and the server throttles requests
  });

export const bggGameQuery = (bggId: number) =>
  queryOptions({
    queryKey: ['bgg', 'game', bggId],
    queryFn: () => api.get<BggGame>(`/bgg/games/${bggId}`),
    staleTime: 10 * 60_000,
  });

export function useBggSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username?: string) => api.post<BggSyncReport>('/bgg/sync', username ? { username } : {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardGameKeys.all }),
  });
}
