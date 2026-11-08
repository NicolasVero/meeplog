import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { gameNightKeys } from './game-nights';
import type { CreatePlayInput, Play, UpdatePlayInput } from './types';

// Plays are always displayed inside their game night, so mutations refresh game nights.

export function useCreatePlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlayInput) => api.post<Play>('/plays', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gameNightKeys.all }),
  });
}

export function useUpdatePlay(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlayInput) => api.patch<Play>(`/plays/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gameNightKeys.all }),
  });
}

export function useDeletePlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/plays/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gameNightKeys.all }),
  });
}
