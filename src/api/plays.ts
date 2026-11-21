import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { boardGameKeys } from './board-games';
import { gameNightKeys } from './game-nights';
import { playerKeys } from './players';
import type { CreatePlayInput, Play, UpdatePlayInput } from './types';

// Plays feed game nights, but also player and board game stats (wins, leaderboard, rivals).
function invalidatePlayData(queryClient: ReturnType<typeof useQueryClient>) {
  for (const queryKey of [gameNightKeys.all, playerKeys.all, boardGameKeys.all]) {
    queryClient.invalidateQueries({ queryKey });
  }
}

export function useCreatePlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlayInput) => api.post<Play>('/plays', input),
    onSuccess: () => invalidatePlayData(queryClient),
  });
}

export function useUpdatePlay(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlayInput) => api.patch<Play>(`/plays/${id}`, input),
    onSuccess: () => invalidatePlayData(queryClient),
  });
}

export function useDeletePlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/plays/${id}`),
    onSuccess: () => invalidatePlayData(queryClient),
  });
}
