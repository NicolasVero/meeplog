import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { BoardGame, CreateBoardGameInput, UpdateBoardGameInput } from './types';

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardGameKeys.all }),
  });
}

export function useDeleteBoardGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/board-games/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardGameKeys.all }),
  });
}
