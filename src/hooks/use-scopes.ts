import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { scopesService } from '@/lib/api/scopes';
import type {
  ScopeFilters,
  CreateScopeInput,
  UpdateScopeInput,
  BulkCreateScopesInput,
} from '@/lib/types/api';

export function useScopes(filters?: ScopeFilters) {
  return useQuery({
    queryKey: queryKeys.scopes.list(filters),
    queryFn: () => scopesService.list(filters),
  });
}

export function useScope(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.scopes.detail(id),
    queryFn: () => scopesService.get(id),
    enabled: enabled && !!id,
  });
}

export function useScopeActivities(id: string, params?: any) {
  return useQuery({
    queryKey: queryKeys.scopes.activities(id),
    queryFn: () => scopesService.getActivities(id, params),
    enabled: !!id,
  });
}

export function useCreateScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScopeInput) => scopesService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scopes.lists() });
      if (data.project_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(data.project_id),
        });
      }
    },
  });
}

export function useBulkCreateScopes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateScopesInput) => scopesService.bulkCreate(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scopes.lists() });
      if (data.length > 0 && data[0].project_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(data[0].project_id),
        });
      }
    },
  });
}

export function useUpdateScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScopeInput }) =>
      scopesService.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scopes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scopes.lists() });
      if (data.project_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(data.project_id),
        });
      }
    },
  });
}

export function useDeleteScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scopesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scopes.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
