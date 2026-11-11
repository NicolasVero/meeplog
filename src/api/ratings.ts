import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { playerKeys } from './players';
import type { Rating } from './types';

export const ratingKeys = {
  byPlayer: (playerId: number) => [...playerKeys.detail(playerId), 'ratings'] as const,
};

export const playerRatingsQuery = (playerId: number) =>
  queryOptions({
    queryKey: ratingKeys.byPlayer(playerId),
    queryFn: () => api.get<Rating[]>(`/players/${playerId}/ratings`),
  });

export function useRateGame(playerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardGameId, value }: { boardGameId: number; value: number }) =>
      api.put<Rating>(`/players/${playerId}/ratings/${boardGameId}`, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ratingKeys.byPlayer(playerId) }),
  });
}

export function useDeleteRating(playerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardGameId: number) => api.delete(`/players/${playerId}/ratings/${boardGameId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ratingKeys.byPlayer(playerId) }),
  });
}
