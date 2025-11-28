/**
 * Saved Searches React Query Hooks
 * Comprehensive hooks for managing saved search queries
 *
 * Features:
 * - Create, read, update, delete saved searches
 * - Execute saved searches
 * - Track usage statistics
 * - Public/private searches
 * - Entity type filtering
 * - Optimistic updates
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { savedSearchesService } from "@/lib/api/saved-searches"
import type {
  SavedSearch,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
  QueryParams,
} from "@/lib/types/api"
import { toast } from "sonner"
import { handleError } from "@/lib/errors"

/**
 * Query Keys Factory
 * Centralized query key management for saved searches
 */
export const savedSearchKeys = {
  all: ["saved-searches"] as const,
  lists: () => [...savedSearchKeys.all, "list"] as const,
  list: (params?: QueryParams) => [...savedSearchKeys.lists(), params] as const,
  details: () => [...savedSearchKeys.all, "detail"] as const,
  detail: (id: string) => [...savedSearchKeys.details(), id] as const,
  public: () => [...savedSearchKeys.all, "public"] as const,
  mine: () => [...savedSearchKeys.all, "mine"] as const,
  byType: (entityType: string) => [...savedSearchKeys.all, "by-type", entityType] as const,
  mostUsed: () => [...savedSearchKeys.all, "most-used"] as const,
  execution: (id: string) => [...savedSearchKeys.detail(id), "execution"] as const,
}

/**
 * Get All Saved Searches Hook
 * Fetch paginated list of saved searches with optional filters
 *
 * @param params - Query parameters (page, per_page, filters)
 * @param options - React Query options
 * @returns Paginated saved searches
 *
 * @example
 * const { data, isLoading } = useSavedSearches({ page: 1, per_page: 20 })
 */
export function useSavedSearches(
  params?: QueryParams,
  options?: Omit<UseQueryOptions<any>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: savedSearchKeys.list(params),
    queryFn: () => savedSearchesService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

/**
 * Get Single Saved Search Hook
 * Fetch details of a specific saved search
 *
 * @param savedSearchId - Saved search ID
 * @param options - React Query options
 * @returns Saved search details
 *
 * @example
 * const { data: savedSearch } = useSavedSearch(savedSearchId)
 */
export function useSavedSearch(
  savedSearchId: string,
  options?: Omit<UseQueryOptions<SavedSearch>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: savedSearchKeys.detail(savedSearchId),
    queryFn: () => savedSearchesService.get(savedSearchId),
    enabled: !!savedSearchId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  })
}

/**
 * Get Public Saved Searches Hook
 * Fetch only public/shared saved searches
 *
 * @param params - Query parameters
 * @returns Public saved searches
 *
 * @example
 * const { data: publicSearches } = usePublicSavedSearches()
 */
export function usePublicSavedSearches(params?: QueryParams) {
  return useQuery({
    queryKey: savedSearchKeys.public(),
    queryFn: () => savedSearchesService.getPublicSearches(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Get My Saved Searches Hook
 * Fetch only current user's private saved searches
 *
 * @param params - Query parameters
 * @returns User's saved searches
 *
 * @example
 * const { data: mySearches } = useMySavedSearches()
 */
export function useMySavedSearches(params?: QueryParams) {
  return useQuery({
    queryKey: savedSearchKeys.mine(),
    queryFn: () => savedSearchesService.getMySearches(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Get Saved Searches by Entity Type Hook
 * Fetch saved searches filtered by entity type
 *
 * @param entityType - Entity type (projects, findings, scopes, cves)
 * @param params - Query parameters
 * @returns Saved searches for entity type
 *
 * @example
 * const { data } = useSavedSearchesByType("findings")
 */
export function useSavedSearchesByType(
  entityType: string,
  params?: QueryParams
) {
  return useQuery({
    queryKey: savedSearchKeys.byType(entityType),
    queryFn: () => savedSearchesService.getByEntityType(entityType, params),
    enabled: !!entityType,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Get Most Used Saved Searches Hook
 * Fetch most frequently used saved searches
 *
 * @param limit - Number of searches to return
 * @returns Most used saved searches
 *
 * @example
 * const { data: popular } = useMostUsedSavedSearches(5)
 */
export function useMostUsedSavedSearches(limit: number = 10) {
  return useQuery({
    queryKey: savedSearchKeys.mostUsed(),
    queryFn: () => savedSearchesService.getMostUsed(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes (usage stats update slowly)
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Create Saved Search Hook
 * Save a new search query
 *
 * @returns Mutation for creating saved search
 *
 * @example
 * const { mutateAsync: createSearch } = useCreateSavedSearch()
 * await createSearch({
 *   name: "Critical Findings",
 *   entity_type: "findings",
 *   query_params: { severity: "critical" }
 * })
 */
export function useCreateSavedSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSavedSearchInput) => savedSearchesService.create(data),
    onSuccess: (newSearch) => {
      // Invalidate all list queries to refresh
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.mine() })
      if (newSearch.is_public) {
        queryClient.invalidateQueries({ queryKey: savedSearchKeys.public() })
      }
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.byType(newSearch.entity_type) })

      toast.success("Search saved", {
        description: `"${newSearch.name}" has been saved successfully.`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to save search")
    },
  })
}

/**
 * Update Saved Search Hook
 * Update an existing saved search
 *
 * @returns Mutation for updating saved search
 *
 * @example
 * const { mutateAsync: updateSearch } = useUpdateSavedSearch()
 * await updateSearch({
 *   id: "search-123",
 *   data: { name: "Updated Name" }
 * })
 */
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedSearchInput }) =>
      savedSearchesService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: savedSearchKeys.detail(id) })

      // Snapshot previous value
      const previousSearch = queryClient.getQueryData<SavedSearch>(savedSearchKeys.detail(id))

      // Optimistically update
      if (previousSearch) {
        queryClient.setQueryData<SavedSearch>(savedSearchKeys.detail(id), {
          ...previousSearch,
          ...data,
        })
      }

      return { previousSearch }
    },
    onSuccess: (updatedSearch, { id }) => {
      // Update cache with server data
      queryClient.setQueryData(savedSearchKeys.detail(id), updatedSearch)

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.mine() })
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.public() })
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.byType(updatedSearch.entity_type) })

      toast.success("Search updated", {
        description: `"${updatedSearch.name}" has been updated.`,
      })
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousSearch) {
        queryClient.setQueryData(savedSearchKeys.detail(id), context.previousSearch)
      }
      handleError(error, "Failed to update search")
    },
  })
}

/**
 * Delete Saved Search Hook
 * Delete a saved search
 *
 * @returns Mutation for deleting saved search
 *
 * @example
 * const { mutateAsync: deleteSearch } = useDeleteSavedSearch()
 * await deleteSearch("search-123")
 */
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (savedSearchId: string) => savedSearchesService.delete(savedSearchId),
    onMutate: async (savedSearchId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: savedSearchKeys.detail(savedSearchId) })

      // Snapshot previous value for rollback
      const previousSearch = queryClient.getQueryData<SavedSearch>(
        savedSearchKeys.detail(savedSearchId)
      )

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: savedSearchKeys.detail(savedSearchId) })

      return { previousSearch }
    },
    onSuccess: (_, savedSearchId, context) => {
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.mine() })
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.public() })
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.mostUsed() })

      if (context?.previousSearch) {
        queryClient.invalidateQueries({
          queryKey: savedSearchKeys.byType(context.previousSearch.entity_type),
        })
      }

      toast.success("Search deleted", {
        description: "The saved search has been removed.",
      })
    },
    onError: (error, savedSearchId, context) => {
      // Rollback on error
      if (context?.previousSearch) {
        queryClient.setQueryData(savedSearchKeys.detail(savedSearchId), context.previousSearch)
      }
      handleError(error, "Failed to delete search")
    },
  })
}

/**
 * Execute Saved Search Hook
 * Execute a saved search and get results
 *
 * @returns Mutation for executing saved search
 *
 * @example
 * const { mutateAsync: executeSearch, data: results } = useExecuteSavedSearch()
 * const results = await executeSearch({ id: "search-123", params: { page: 1 } })
 */
export function useExecuteSavedSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params?: QueryParams }) =>
      savedSearchesService.execute(id, params),
    onSuccess: (result, { id }) => {
      // Update the saved search in cache with new use_count
      const savedSearch = queryClient.getQueryData<SavedSearch>(savedSearchKeys.detail(id))
      if (savedSearch && result.meta.use_count) {
        queryClient.setQueryData<SavedSearch>(savedSearchKeys.detail(id), {
          ...savedSearch,
          use_count: result.meta.use_count,
        })
      }

      // Invalidate most used queries (usage stats changed)
      queryClient.invalidateQueries({ queryKey: savedSearchKeys.mostUsed() })

      toast.success("Search executed", {
        description: `Found ${result.meta.total} results.`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to execute search")
    },
  })
}

/**
 * Prefetch Saved Search
 * Prefetch a saved search for better UX
 *
 * @returns Prefetch function
 *
 * @example
 * const prefetchSavedSearch = usePrefetchSavedSearch()
 * prefetchSavedSearch("search-123")
 */
export function usePrefetchSavedSearch() {
  const queryClient = useQueryClient()

  return (savedSearchId: string) => {
    queryClient.prefetchQuery({
      queryKey: savedSearchKeys.detail(savedSearchId),
      queryFn: () => savedSearchesService.get(savedSearchId),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Combined Saved Searches Hook
 * All-in-one hook for saved search management
 *
 * @returns All saved search queries and mutations
 *
 * @example
 * const {
 *   allSearches,
 *   mySearches,
 *   publicSearches,
 *   createSearch,
 *   executeSearch
 * } = useSavedSearchesManagement()
 */
export function useSavedSearchesManagement() {
  const allSearches = useSavedSearches()
  const mySearches = useMySavedSearches()
  const publicSearches = usePublicSavedSearches()
  const mostUsed = useMostUsedSavedSearches(5)

  const createMutation = useCreateSavedSearch()
  const updateMutation = useUpdateSavedSearch()
  const deleteMutation = useDeleteSavedSearch()
  const executeMutation = useExecuteSavedSearch()

  return {
    // Queries
    allSearches: allSearches.data,
    mySearches: mySearches.data,
    publicSearches: publicSearches.data,
    mostUsed: mostUsed.data,

    // Loading states
    isLoading: allSearches.isLoading || mySearches.isLoading || publicSearches.isLoading,

    // Mutations
    createSearch: createMutation.mutateAsync,
    updateSearch: updateMutation.mutateAsync,
    deleteSearch: deleteMutation.mutateAsync,
    executeSearch: executeMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isExecuting: executeMutation.isPending,

    // Execution results
    executionResults: executeMutation.data,
  }
}
