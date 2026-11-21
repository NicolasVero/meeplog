import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { gameNightKeys } from './game-nights';
import { playerKeys } from './players';
import type { BoardGame, BoardGameStats, CreateBoardGameInput, UpdateBoardGameInput } from './types';

export const boardGameKeys = {
  all: ['board-games'] as const,
  detail: (id: number) => [...boardGameKeys.all, id] as const,
};

export const boardGamesQuery = () =>
  queryOptions({
    queryKey: boardGameKeys.all,
    queryFn: () => api.get<BoardGame[]>('/board-games'),
  });

export const boardGameQuery = (id: number) =>
  queryOptions({
    queryKey: boardGameKeys.detail(id),
    queryFn: () => api.get<BoardGame>(`/board-games/${id}`),
  });

export const boardGameStatsQuery = (id: number) =>
  queryOptions({
    queryKey: [...boardGameKeys.detail(id), 'stats'],
    queryFn: () => api.get<BoardGameStats>(`/board-games/${id}/stats`),
  });

export function useCreateBoardGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBoardGameInput) => api.post<BoardGame>('/board-games', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardGameKeys.all }),
  });
}

export function useUpdateBoardGame(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBoardGameInput) => api.patch<BoardGame>(`/board-games/${id}`, input),
    onSuccess: () => {
      // The scoring rule changes who won, so stats shown elsewhere are refreshed too.
      for (const queryKey of [boardGameKeys.all, playerKeys.all, gameNightKeys.all]) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export function useDeleteBoardGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/board-games/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardGameKeys.all }),
  });
}
