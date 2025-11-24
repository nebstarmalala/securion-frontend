import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { findingsService } from '@/lib/api/findings';
import type {
  FindingFilters,
  CreateFindingInput,
  UpdateFindingInput,
  UpdateFindingStatusInput,
  BulkUpdateStatusInput,
} from '@/lib/types/api';

export function useFindings(filters?: FindingFilters) {
  return useQuery({
    queryKey: queryKeys.findings.list(filters),
    queryFn: () => findingsService.list(filters),
  });
}

export function useFinding(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.findings.detail(id),
    queryFn: () => findingsService.get(id),
    enabled: enabled && !!id,
  });
}

export function useFindingActivities(id: string, params?: any) {
  return useQuery({
    queryKey: queryKeys.findings.activities(id),
    queryFn: () => findingsService.getActivities(id, params),
    enabled: !!id,
  });
}

export function useCreateFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFindingInput) => findingsService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      if (data.scope_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.scopes.detail(data.scope_id),
        });
      }
      if (data.project_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(data.project_id),
        });
      }
    },
  });
}

export function useUpdateFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFindingInput }) =>
      findingsService.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.lists() });
      if (data.scope_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.scopes.detail(data.scope_id),
        });
      }
      if (data.project_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(data.project_id),
        });
      }
    },
  });
}

export function useUpdateFindingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFindingStatusInput }) =>
      findingsService.updateStatus(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useBulkUpdateFindingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateStatusInput) => findingsService.bulkUpdateStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.scopes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeleteFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => findingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.scopes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
