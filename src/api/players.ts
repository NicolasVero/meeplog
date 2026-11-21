import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { CreatePlayerInput, LeaderboardEntry, PlayedGame, Player, Rival, UpdatePlayerInput } from './types';

export const playerKeys = {
  all: ['players'] as const,
  detail: (id: number) => [...playerKeys.all, id] as const,
};

export const playersQuery = () =>
  queryOptions({
    queryKey: playerKeys.all,
    queryFn: () => api.get<Player[]>('/players'),
  });

export const playerQuery = (id: number) =>
  queryOptions({
    queryKey: playerKeys.detail(id),
    queryFn: () => api.get<Player>(`/players/${id}`),
  });

export const playedGamesQuery = (id: number) =>
  queryOptions({
    queryKey: [...playerKeys.detail(id), 'games'],
    queryFn: () => api.get<PlayedGame[]>(`/players/${id}/games`),
  });

export const leaderboardQuery = () =>
  queryOptions({
    queryKey: [...playerKeys.all, 'leaderboard'],
    queryFn: () => api.get<LeaderboardEntry[]>('/players/leaderboard'),
  });

export const rivalsQuery = (id: number) =>
  queryOptions({
    queryKey: [...playerKeys.detail(id), 'rivals'],
    queryFn: () => api.get<Rival[]>(`/players/${id}/rivals`),
  });

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlayerInput) => api.post<Player>('/players', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: playerKeys.all }),
  });
}

export function useUpdatePlayer(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlayerInput) => api.patch<Player>(`/players/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: playerKeys.all }),
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/players/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: playerKeys.all }),
  });
}
