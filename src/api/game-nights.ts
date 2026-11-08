import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { CreateGameNightInput, GameNight, GameNightSummary, UpdateGameNightInput } from './types';

export const gameNightKeys = {
  all: ['game-nights'] as const,
  list: () => [...gameNightKeys.all, 'list'] as const,
  detail: (id: number) => [...gameNightKeys.all, 'detail', id] as const,
};

export const gameNightsQuery = () =>
  queryOptions({
    queryKey: gameNightKeys.list(),
    queryFn: () => api.get<GameNightSummary[]>('/game-nights'),
  });

export const gameNightQuery = (id: number) =>
  queryOptions({
    queryKey: gameNightKeys.detail(id),
    queryFn: () => api.get<GameNight>(`/game-nights/${id}`),
  });

export function useCreateGameNight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGameNightInput) => api.post<GameNight>('/game-nights', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gameNightKeys.list() }),
  });
}

export function useUpdateGameNight(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateGameNightInput) => api.patch<GameNight>(`/game-nights/${id}`, input),
    onSuccess: (gameNight) => {
      queryClient.setQueryData(gameNightKeys.detail(id), gameNight);
      return queryClient.invalidateQueries({ queryKey: gameNightKeys.list() });
    },
  });
}

export function useDeleteGameNight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/game-nights/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: gameNightKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: gameNightKeys.list() });
    },
  });
}

export function useAddGameNightPlayer(gameNightId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (playerId: number) => api.post(`/game-nights/${gameNightId}/players/${playerId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gameNightKeys.all }),
  });
}

export function useRemoveGameNightPlayer(gameNightId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (playerId: number) => api.delete(`/game-nights/${gameNightId}/players/${playerId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gameNightKeys.all }),
  });
}
