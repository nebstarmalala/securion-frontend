/**
 * React Query Hooks for CVE Tracking
 * Provides data fetching, caching, and mutations for CVE operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { cveTrackingService } from "@/lib/api/cve-tracking"
import type {
  ApiCveTracking,
  CreateCveTrackingInput,
  UpdateCveTrackingInput,
  CveTrackingQueryParams,
  CVEStats,
  ApiResponse,
  PaginatedResponse,
} from "@/lib/types/api"
import { toast } from "sonner"
import { handleError } from "@/lib/errors"

// Query Keys Factory
export const cveKeys = {
  all: ["cves"] as const,
  lists: () => [...cveKeys.all, "list"] as const,
  list: (filters?: CveTrackingQueryParams) => [...cveKeys.lists(), filters] as const,
  details: () => [...cveKeys.all, "detail"] as const,
  detail: (id: string) => [...cveKeys.details(), id] as const,
  stats: () => [...cveKeys.all, "stats"] as const,
  bySeverity: (severity: "low" | "medium" | "high" | "critical") =>
    [...cveKeys.all, "severity", severity] as const,
  byProject: (projectId: string) => [...cveKeys.all, "project", projectId] as const,
  byScope: (scopeId: string) => [...cveKeys.all, "scope", scopeId] as const,
  affected: () => [...cveKeys.all, "affected"] as const,
}

// ===========================
// Queries
// ===========================

/**
 * Fetch paginated list of CVEs with optional filters
 */
export function useCVEs(filters?: CveTrackingQueryParams) {
  return useQuery({
    queryKey: cveKeys.list(filters),
    queryFn: () => cveTrackingService.getCveTrackings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - CVE data changes less frequently
  })
}

/**
 * Fetch a single CVE by ID
 */
export function useCVE(
  cveId: string | undefined,
  options?: Omit<UseQueryOptions<ApiResponse<ApiCveTracking>>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: cveKeys.detail(cveId!),
    queryFn: () => cveTrackingService.getCveTracking(cveId!),
    enabled: !!cveId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

/**
 * Fetch CVE statistics
 */
export function useCVEStats() {
  return useQuery({
    queryKey: cveKeys.stats(),
    queryFn: () => cveTrackingService.getCveStatistics(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch CVEs by severity level
 */
export function useCVEsBySeverity(
  severity: "low" | "medium" | "high" | "critical",
  params?: Omit<CveTrackingQueryParams, "severity">,
) {
  return useQuery({
    queryKey: cveKeys.bySeverity(severity),
    queryFn: () => cveTrackingService.getCvesBySeverity(severity, params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch CVEs affecting a specific project
 */
export function useCVEsByProject(projectId: string | undefined, params?: Omit<CveTrackingQueryParams, "project_id">) {
  return useQuery({
    queryKey: cveKeys.byProject(projectId!),
    queryFn: () => cveTrackingService.getCvesByProject(projectId!, params),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch CVEs affecting a specific scope
 */
export function useCVEsByScope(scopeId: string | undefined, params?: Omit<CveTrackingQueryParams, "scope_id">) {
  return useQuery({
    queryKey: cveKeys.byScope(scopeId!),
    queryFn: () => cveTrackingService.getCvesByScope(scopeId!, params),
    enabled: !!scopeId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch only CVEs with affected services
 */
export function useAffectedCVEs(params?: Omit<CveTrackingQueryParams, "affected_only">) {
  return useQuery({
    queryKey: cveKeys.affected(),
    queryFn: () => cveTrackingService.getAffectedCves(params),
    staleTime: 3 * 60 * 1000,
  })
}

// ===========================
// Mutations
// ===========================

/**
 * Create a new CVE tracking entry
 */
export function useCreateCVE() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCveTrackingInput) => cveTrackingService.createCveTracking(data),
    onSuccess: (response) => {
      // Invalidate all CVE lists
      queryClient.invalidateQueries({ queryKey: cveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cveKeys.stats() })

      // Invalidate severity-based queries
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: cveKeys.bySeverity(response.data.severity) })
      }

      toast.success("CVE tracking created", {
        description: `${response.data?.cve_id} added successfully`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create CVE tracking")
    },
  })
}

/**
 * Update an existing CVE tracking entry
 */
export function useUpdateCVE() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCveTrackingInput }) =>
      cveTrackingService.updateCveTracking(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cveKeys.detail(id) })

      // Snapshot previous value
      const previousCVE = queryClient.getQueryData<ApiResponse<ApiCveTracking>>(cveKeys.detail(id))

      // Optimistically update
      if (previousCVE?.data) {
        queryClient.setQueryData<ApiResponse<ApiCveTracking>>(cveKeys.detail(id), {
          ...previousCVE,
          data: {
            ...previousCVE.data,
            ...data,
          },
        })
      }

      return { previousCVE }
    },
    onSuccess: (response, { id }) => {
      // Update the cache with the actual server response
      queryClient.setQueryData(cveKeys.detail(id), response)

      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: cveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cveKeys.stats() })

      if (response.data) {
        queryClient.invalidateQueries({ queryKey: cveKeys.bySeverity(response.data.severity) })
      }

      toast.success("CVE tracking updated")
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousCVE) {
        queryClient.setQueryData(cveKeys.detail(id), context.previousCVE)
      }
      handleError(error, "Failed to update CVE tracking")
    },
  })
}

/**
 * Delete a CVE tracking entry
 */
export function useDeleteCVE() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cveId: string) => cveTrackingService.deleteCveTracking(cveId),
    onMutate: async (cveId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cveKeys.detail(cveId) })

      // Snapshot previous value
      const previousCVE = queryClient.getQueryData<ApiResponse<ApiCveTracking>>(cveKeys.detail(cveId))

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: cveKeys.detail(cveId) })

      return { previousCVE }
    },
    onSuccess: () => {
      // Invalidate all CVE-related queries
      queryClient.invalidateQueries({ queryKey: cveKeys.all })

      toast.success("CVE tracking deleted")
    },
    onError: (error, cveId, context) => {
      // Rollback on error
      if (context?.previousCVE) {
        queryClient.setQueryData(cveKeys.detail(cveId), context.previousCVE)
      }
      handleError(error, "Failed to delete CVE tracking")
    },
  })
}

/**
 * Sync CVEs from NVD
 * Rate Limited: 5 requests per hour
 */
export function useSyncCVEs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (daysBack?: number) => cveTrackingService.syncCves(daysBack),
    onSuccess: (response) => {
      toast.success("CVE sync started", {
        description: `Job ID: ${response.data?.job_id}. This may take a few minutes.`,
        duration: 5000,
      })

      // Invalidate CVE queries after a delay to allow sync to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: cveKeys.all })
      }, 30000) // 30 seconds
    },
    onError: (error: any) => {
      // Check for rate limit error
      if (error?.status === 429) {
        toast.error("Rate limit exceeded", {
          description: "CVE sync is limited to 5 requests per hour. Please try again later.",
          duration: 6000,
        })
      } else {
        handleError(error, "Failed to sync CVEs")
      }
    },
  })
}

/**
 * Match a specific CVE to services
 */
export function useMatchCVE() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cveId: string) => cveTrackingService.matchCveToServices(cveId),
    onSuccess: (response, cveId) => {
      // Invalidate the specific CVE detail to refresh affected services
      queryClient.invalidateQueries({ queryKey: cveKeys.detail(cveId) })

      // Invalidate affected CVEs list
      queryClient.invalidateQueries({ queryKey: cveKeys.affected() })

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: cveKeys.stats() })

      const matchCount = response.data?.matches_found || 0
      toast.success(
        matchCount > 0 ? `Found ${matchCount} matching services` : "No matching services found",
        {
          description: matchCount > 0 ? "Affected services updated" : "This CVE does not affect your services",
        },
      )
    },
    onError: (error) => {
      handleError(error, "Failed to match CVE to services")
    },
  })
}

/**
 * Rematch all CVEs to services
 * Rate Limited: 20 requests per minute (bulk operations)
 */
export function useRematchAllCVEs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cveTrackingService.rematchAllCves(),
    onSuccess: (response) => {
      toast.success("CVE rematch started", {
        description: `Job ID: ${response.data?.job_id}. Rematching all CVEs to services.`,
        duration: 5000,
      })

      // Invalidate all CVE queries after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: cveKeys.all })
      }, 30000) // 30 seconds
    },
    onError: (error: any) => {
      // Check for rate limit error
      if (error?.status === 429) {
        toast.error("Rate limit exceeded", {
          description: "Bulk CVE operations are limited. Please wait and try again.",
          duration: 6000,
        })
      } else {
        handleError(error, "Failed to rematch CVEs")
      }
    },
  })
}

/**
 * Prefetch a CVE (useful for hover states, navigation)
 */
export function usePrefetchCVE() {
  const queryClient = useQueryClient()

  return (cveId: string) => {
    queryClient.prefetchQuery({
      queryKey: cveKeys.detail(cveId),
      queryFn: () => cveTrackingService.getCveTracking(cveId),
      staleTime: 10 * 60 * 1000,
    })
  }
}
