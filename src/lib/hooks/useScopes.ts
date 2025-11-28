/**
 * Scopes React Query Hooks
 *
 * Provides hooks for scope management operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { scopesService } from "../api/scopes"
import type {
  ApiScope,
  CreateScopeInput,
  UpdateScopeInput,
  BulkCreateScopesInput,
  ListQueryParams,
} from "../types"
import { handleError } from "../errors"

// ============================================================================
// Query Keys Factory
// ============================================================================

export const scopeKeys = {
  all: ["scopes"] as const,
  lists: () => [...scopeKeys.all, "list"] as const,
  list: (filters?: ListQueryParams) => [...scopeKeys.lists(), filters] as const,
  details: () => [...scopeKeys.all, "detail"] as const,
  detail: (id: string) => [...scopeKeys.details(), id] as const,
  byProject: (projectId: string) => [...scopeKeys.all, "project", projectId] as const,
  activities: (id: string) => [...scopeKeys.all, id, "activities"] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch paginated list of scopes
 */
export function useScopes(filters?: ListQueryParams) {
  return useQuery({
    queryKey: scopeKeys.list(filters),
    queryFn: () => scopesService.getScopes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single scope by ID
 */
export function useScope(scopeId: string | undefined) {
  return useQuery({
    queryKey: scopeKeys.detail(scopeId!),
    queryFn: () => scopesService.getScope(scopeId!),
    enabled: !!scopeId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch scopes for a specific project
 */
export function useProjectScopes(projectId: string | undefined) {
  return useQuery({
    queryKey: scopeKeys.byProject(projectId!),
    queryFn: () => scopesService.getProjectScopes(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch scope activities
 */
export function useScopeActivities(scopeId: string | undefined, params?: ListQueryParams) {
  return useQuery({
    queryKey: scopeKeys.activities(scopeId!),
    queryFn: () => scopesService.getScopeActivities(scopeId!, params),
    enabled: !!scopeId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch in-scope items
 */
export function useInScopeItems(projectId?: string) {
  return useQuery({
    queryKey: [...scopeKeys.all, "in-scope", projectId] as const,
    queryFn: () => scopesService.getInScopeItems(projectId),
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create a new scope
 */
export function useCreateScope() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScopeInput) => scopesService.createScope(data),
    onSuccess: (newScope) => {
      queryClient.invalidateQueries({ queryKey: scopeKeys.lists() })
      if (newScope.project_id) {
        queryClient.invalidateQueries({
          queryKey: scopeKeys.byProject(newScope.project_id),
        })
      }
      toast.success("Scope created successfully", {
        description: `Created scope: ${newScope.name}`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create scope")
    },
  })
}

/**
 * Hook to bulk create scopes
 */
export function useBulkCreateScopes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkCreateScopesInput) => scopesService.bulkCreateScopes(data),
    onSuccess: (newScopes) => {
      queryClient.invalidateQueries({ queryKey: scopeKeys.lists() })
      // Invalidate project-specific queries if all scopes belong to same project
      if (newScopes.length > 0 && newScopes[0].project_id) {
        queryClient.invalidateQueries({
          queryKey: scopeKeys.byProject(newScopes[0].project_id),
        })
      }
      toast.success(`${newScopes.length} scopes created successfully`)
    },
    onError: (error) => {
      handleError(error, "Failed to create scopes")
    },
  })
}

/**
 * Hook to update a scope
 */
export function useUpdateScope() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScopeInput }) =>
      scopesService.updateScope(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: scopeKeys.detail(id) })
      const previousScope = queryClient.getQueryData<ApiScope>(scopeKeys.detail(id))

      if (previousScope) {
        queryClient.setQueryData<ApiScope>(scopeKeys.detail(id), {
          ...previousScope,
          ...data,
        })
      }

      return { previousScope }
    },
    onSuccess: (updatedScope, { id }) => {
      queryClient.setQueryData(scopeKeys.detail(id), updatedScope)
      queryClient.invalidateQueries({ queryKey: scopeKeys.lists() })
      if (updatedScope.project_id) {
        queryClient.invalidateQueries({
          queryKey: scopeKeys.byProject(updatedScope.project_id),
        })
      }
      toast.success("Scope updated successfully")
    },
    onError: (error, { id }, context) => {
      if (context?.previousScope) {
        queryClient.setQueryData(scopeKeys.detail(id), context.previousScope)
      }
      handleError(error, "Failed to update scope")
    },
  })
}

/**
 * Hook to delete a scope
 */
export function useDeleteScope() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scopeId: string) => scopesService.deleteScope(scopeId),
    onSuccess: (_, scopeId) => {
      queryClient.invalidateQueries({ queryKey: scopeKeys.lists() })
      queryClient.removeQueries({ queryKey: scopeKeys.detail(scopeId) })
      toast.success("Scope deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete scope")
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to prefetch a scope
 */
export function usePrefetchScope() {
  const queryClient = useQueryClient()

  return (scopeId: string) => {
    queryClient.prefetchQuery({
      queryKey: scopeKeys.detail(scopeId),
      queryFn: () => scopesService.getScope(scopeId),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Combined hook for scope management
 */
export function useScopeManagement(filters?: ListQueryParams) {
  const scopes = useScopes(filters)
  const createScope = useCreateScope()
  const bulkCreateScopes = useBulkCreateScopes()
  const updateScope = useUpdateScope()
  const deleteScope = useDeleteScope()
  const prefetchScope = usePrefetchScope()

  return {
    // Query
    scopes,
    isLoading: scopes.isLoading,
    error: scopes.error,

    // Mutations
    createScope,
    bulkCreateScopes,
    updateScope,
    deleteScope,

    // Utilities
    prefetchScope,

    // Mutation states
    isCreating: createScope.isPending,
    isBulkCreating: bulkCreateScopes.isPending,
    isUpdating: updateScope.isPending,
    isDeleting: deleteScope.isPending,
  }
}
