import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { CreatePlayerInput, Player, UpdatePlayerInput } from './types';

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
