/**
 * React Query Hooks for Findings
 * Provides data fetching, caching, and mutations for finding operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { findingsService } from "@/lib/api/findings"
import type {
  ApiFinding,
  CreateFindingInput,
  UpdateFindingInput,
  UpdateFindingStatusInput,
  BulkUpdateFindingStatusInput,
  FindingFilters,
  PaginatedResponse,
} from "@/lib/types/api"
import { toast } from "sonner"
import { handleError } from "@/lib/errors"

// Query Keys Factory
export const findingKeys = {
  all: ["findings"] as const,
  lists: () => [...findingKeys.all, "list"] as const,
  list: (filters?: FindingFilters) => [...findingKeys.lists(), filters] as const,
  details: () => [...findingKeys.all, "detail"] as const,
  detail: (id: string) => [...findingKeys.details(), id] as const,
  activities: (id: string) => [...findingKeys.detail(id), "activities"] as const,
  bySeverity: (severity: ApiFinding["severity"]) => [...findingKeys.all, "severity", severity] as const,
  byScope: (scopeId: string) => [...findingKeys.all, "scope", scopeId] as const,
  byProject: (projectId: string) => [...findingKeys.all, "project", projectId] as const,
  open: () => [...findingKeys.all, "open"] as const,
  critical: () => [...findingKeys.all, "critical"] as const,
}

// ===========================
// Queries
// ===========================

/**
 * Fetch paginated list of findings with optional filters
 */
export function useFindings(filters?: FindingFilters) {
  return useQuery({
    queryKey: findingKeys.list(filters),
    queryFn: () => findingsService.getFindings(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch a single finding by ID
 */
export function useFinding(
  findingId: string | undefined,
  options?: Omit<UseQueryOptions<ApiFinding>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: findingKeys.detail(findingId!),
    queryFn: () => findingsService.getFinding(findingId!),
    enabled: !!findingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Fetch findings for a specific scope
 */
export function useScopeFindings(scopeId: string | undefined) {
  return useQuery({
    queryKey: findingKeys.byScope(scopeId!),
    queryFn: () => findingsService.getScopeFindings(scopeId!),
    enabled: !!scopeId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Fetch findings by severity level
 */
export function useFindingsBySeverity(severity: ApiFinding["severity"]) {
  return useQuery({
    queryKey: findingKeys.bySeverity(severity),
    queryFn: () => findingsService.getFindingsBySeverity(severity),
    staleTime: 3 * 60 * 1000,
  })
}

/**
 * Fetch open findings
 */
export function useOpenFindings() {
  return useQuery({
    queryKey: findingKeys.open(),
    queryFn: () => findingsService.getOpenFindings(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Fetch critical and high severity findings
 */
export function useCriticalFindings() {
  return useQuery({
    queryKey: findingKeys.critical(),
    queryFn: () => findingsService.getCriticalFindings(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Fetch finding activities
 */
export function useFindingActivities(findingId: string | undefined, params?: any) {
  return useQuery({
    queryKey: findingKeys.activities(findingId!),
    queryFn: () => findingsService.getFindingActivities(findingId!, params),
    enabled: !!findingId,
    staleTime: 1 * 60 * 1000, // 1 minute for activities
  })
}

// ===========================
// Mutations
// ===========================

/**
 * Create a new finding
 */
export function useCreateFinding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFindingInput) => findingsService.createFinding(data),
    onSuccess: (newFinding) => {
      // Invalidate all findings lists
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() })

      // Invalidate scope findings if applicable
      if (newFinding.scope_id) {
        queryClient.invalidateQueries({ queryKey: findingKeys.byScope(newFinding.scope_id) })
      }

      // Invalidate project findings if applicable
      if (newFinding.project_id) {
        queryClient.invalidateQueries({ queryKey: findingKeys.byProject(newFinding.project_id) })
      }

      // Invalidate severity-based queries
      queryClient.invalidateQueries({ queryKey: findingKeys.bySeverity(newFinding.severity) })

      // Invalidate critical findings if severity is critical or high
      if (newFinding.severity === "critical" || newFinding.severity === "high") {
        queryClient.invalidateQueries({ queryKey: findingKeys.critical() })
      }

      // Invalidate open findings
      if (newFinding.status === "open") {
        queryClient.invalidateQueries({ queryKey: findingKeys.open() })
      }

      toast.success("Finding created successfully", {
        description: newFinding.title,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create finding")
    },
  })
}

/**
 * Update an existing finding
 */
export function useUpdateFinding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFindingInput }) =>
      findingsService.updateFinding(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: findingKeys.detail(id) })

      // Snapshot previous value
      const previousFinding = queryClient.getQueryData<ApiFinding>(findingKeys.detail(id))

      // Optimistically update
      if (previousFinding) {
        queryClient.setQueryData<ApiFinding>(findingKeys.detail(id), {
          ...previousFinding,
          ...data,
        })
      }

      return { previousFinding }
    },
    onSuccess: (updatedFinding, { id }) => {
      // Update the cache with the actual server response
      queryClient.setQueryData(findingKeys.detail(id), updatedFinding)

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: findingKeys.byScope(updatedFinding.scope_id) })
      queryClient.invalidateQueries({ queryKey: findingKeys.byProject(updatedFinding.project_id) })
      queryClient.invalidateQueries({ queryKey: findingKeys.bySeverity(updatedFinding.severity) })

      toast.success("Finding updated successfully")
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousFinding) {
        queryClient.setQueryData(findingKeys.detail(id), context.previousFinding)
      }
      handleError(error, "Failed to update finding")
    },
  })
}

/**
 * Update finding status
 */
export function useUpdateFindingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFindingStatusInput }) =>
      findingsService.updateFindingStatus(id, data),
    onSuccess: (updatedFinding, { id }) => {
      // Update the cache
      queryClient.setQueryData(findingKeys.detail(id), updatedFinding)

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: findingKeys.byScope(updatedFinding.scope_id) })
      queryClient.invalidateQueries({ queryKey: findingKeys.open() })

      toast.success("Finding status updated", {
        description: `Changed to ${updatedFinding.status}`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to update finding status")
    },
  })
}

/**
 * Bulk update finding statuses
 */
export function useBulkUpdateFindingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkUpdateFindingStatusInput) => findingsService.bulkUpdateFindingStatus(data),
    onSuccess: (result, variables) => {
      // Invalidate all findings-related queries
      queryClient.invalidateQueries({ queryKey: findingKeys.all })

      toast.success(`${result.count} findings updated`, {
        description: `Status changed to ${variables.status}`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to bulk update finding statuses")
    },
  })
}

/**
 * Delete a finding
 */
export function useDeleteFinding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (findingId: string) => findingsService.deleteFinding(findingId),
    onMutate: async (findingId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: findingKeys.detail(findingId) })

      // Snapshot previous value
      const previousFinding = queryClient.getQueryData<ApiFinding>(findingKeys.detail(findingId))

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: findingKeys.detail(findingId) })

      return { previousFinding }
    },
    onSuccess: (_, findingId, context) => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() })

      // Invalidate related queries
      if (context?.previousFinding) {
        queryClient.invalidateQueries({ queryKey: findingKeys.byScope(context.previousFinding.scope_id) })
        queryClient.invalidateQueries({
          queryKey: findingKeys.byProject(context.previousFinding.project_id),
        })
        queryClient.invalidateQueries({
          queryKey: findingKeys.bySeverity(context.previousFinding.severity),
        })
      }

      toast.success("Finding deleted successfully")
    },
    onError: (error, findingId, context) => {
      // Rollback on error
      if (context?.previousFinding) {
        queryClient.setQueryData(findingKeys.detail(findingId), context.previousFinding)
      }
      handleError(error, "Failed to delete finding")
    },
  })
}

/**
 * Prefetch a finding (useful for hover states, navigation)
 */
export function usePrefetchFinding() {
  const queryClient = useQueryClient()

  return (findingId: string) => {
    queryClient.prefetchQuery({
      queryKey: findingKeys.detail(findingId),
      queryFn: () => findingsService.getFinding(findingId),
      staleTime: 5 * 60 * 1000,
    })
  }
}
