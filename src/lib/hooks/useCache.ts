/**
 * React Query Hooks for Cache Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as cacheService from '../api/cache';
import type {
  CacheStatistics,
  CacheHealth,
  CacheClearResponse,
  CacheWarmResponse,
} from '../api/cache';

// ============================================================================
// Query Keys
// ============================================================================

export const cacheKeys = {
  all: ['cache'] as const,
  statistics: () => [...cacheKeys.all, 'statistics'] as const,
  health: () => [...cacheKeys.all, 'health'] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get cache statistics (super-admin only)
 */
export function useCacheStatistics() {
  return useQuery({
    queryKey: cacheKeys.statistics(),
    queryFn: cacheService.getCacheStatistics,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Get cache health status
 */
export function useCacheHealth() {
  return useQuery({
    queryKey: cacheKeys.health(),
    queryFn: cacheService.getCacheHealth,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Check if cache is healthy
 */
export function useIsCacheHealthy() {
  return useQuery({
    queryKey: [...cacheKeys.health(), 'is-healthy'],
    queryFn: cacheService.isCacheHealthy,
    staleTime: 10000,
  });
}

/**
 * Get cache memory usage percentage
 */
export function useCacheMemoryUsage() {
  return useQuery({
    queryKey: [...cacheKeys.statistics(), 'memory-usage'],
    queryFn: cacheService.getCacheMemoryUsage,
    staleTime: 30000,
  });
}

/**
 * Get cache hit rate
 */
export function useCacheHitRate() {
  return useQuery({
    queryKey: [...cacheKeys.statistics(), 'hit-rate'],
    queryFn: cacheService.getCacheHitRate,
    staleTime: 30000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Clear all cache (super-admin only)
 */
export function useClearAllCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cacheService.clearAllCache,
    onSuccess: (data: CacheClearResponse) => {
      if (data.success) {
        toast.success(data.message || 'All cache cleared successfully', {
          description: data.cleared_keys
            ? `Cleared ${data.cleared_keys} keys (${(data.cleared_size || 0) / 1024 / 1024} MB)`
            : undefined,
        });

        // Invalidate cache statistics
        queryClient.invalidateQueries({ queryKey: cacheKeys.all });

        // Invalidate all queries since cache was cleared
        queryClient.invalidateQueries();
      } else {
        toast.error(data.message || 'Failed to clear cache');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to clear cache', {
        description: error.message,
      });
    },
  });
}

/**
 * Clear cache by type (super-admin only)
 */
export function useClearCacheByType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: string) => cacheService.clearCacheByType(type),
    onSuccess: (data: CacheClearResponse, type: string) => {
      if (data.success) {
        toast.success(data.message || `Cache type "${type}" cleared successfully`, {
          description: data.cleared_keys
            ? `Cleared ${data.cleared_keys} keys`
            : undefined,
        });

        // Invalidate cache statistics
        queryClient.invalidateQueries({ queryKey: cacheKeys.all });
      } else {
        toast.error(data.message || 'Failed to clear cache type');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to clear cache type', {
        description: error.message,
      });
    },
  });
}

/**
 * Clear cache by tags (super-admin only)
 */
export function useClearCacheByTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tags: string[]) => cacheService.clearCacheByTags(tags),
    onSuccess: (data: CacheClearResponse, tags: string[]) => {
      if (data.success) {
        toast.success(data.message || `Cache with tags [${tags.join(', ')}] cleared successfully`, {
          description: data.cleared_keys
            ? `Cleared ${data.cleared_keys} keys`
            : undefined,
        });

        // Invalidate cache statistics
        queryClient.invalidateQueries({ queryKey: cacheKeys.all });
      } else {
        toast.error(data.message || 'Failed to clear cache by tags');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to clear cache by tags', {
        description: error.message,
      });
    },
  });
}

/**
 * Warm dashboard cache (super-admin only)
 */
export function useWarmDashboardCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cacheService.warmDashboardCache,
    onSuccess: (data: CacheWarmResponse) => {
      if (data.success) {
        toast.success(data.message || 'Dashboard cache warmed successfully', {
          description: data.warmed_keys
            ? `Warmed ${data.warmed_keys} keys in ${data.duration_ms}ms`
            : undefined,
        });

        // Invalidate cache statistics
        queryClient.invalidateQueries({ queryKey: cacheKeys.all });
      } else {
        toast.error(data.message || 'Failed to warm dashboard cache');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to warm dashboard cache', {
        description: error.message,
      });
    },
  });
}

/**
 * Warm statistics cache (super-admin only)
 */
export function useWarmStatisticsCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cacheService.warmStatisticsCache,
    onSuccess: (data: CacheWarmResponse) => {
      if (data.success) {
        toast.success(data.message || 'Statistics cache warmed successfully', {
          description: data.warmed_keys
            ? `Warmed ${data.warmed_keys} keys in ${data.duration_ms}ms`
            : undefined,
        });

        // Invalidate cache statistics
        queryClient.invalidateQueries({ queryKey: cacheKeys.all });
      } else {
        toast.error(data.message || 'Failed to warm statistics cache');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to warm statistics cache', {
        description: error.message,
      });
    },
  });
}

/**
 * Warm all caches (super-admin only)
 */
export function useWarmAllCaches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cacheService.warmAllCaches,
    onSuccess: (data) => {
      const successCount = [data.dashboard.success, data.statistics.success].filter(Boolean).length;

      if (successCount === 2) {
        toast.success('All caches warmed successfully', {
          description: `Dashboard and Statistics caches are ready`,
        });
      } else if (successCount === 1) {
        toast.warning('Some caches failed to warm', {
          description: 'Check the results for details',
        });
      } else {
        toast.error('Failed to warm caches');
      }

      // Invalidate cache statistics
      queryClient.invalidateQueries({ queryKey: cacheKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to warm caches', {
        description: error.message,
      });
    },
  });
}

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * All-in-one cache management hook
 */
export function useCacheManagement() {
  const statistics = useCacheStatistics();
  const health = useCacheHealth();
  const clearAll = useClearAllCache();
  const clearByType = useClearCacheByType();
  const clearByTags = useClearCacheByTags();
  const warmDashboard = useWarmDashboardCache();
  const warmStatistics = useWarmStatisticsCache();
  const warmAll = useWarmAllCaches();

  return {
    // Data
    statistics: statistics.data,
    health: health.data,

    // Loading states
    isLoadingStatistics: statistics.isLoading,
    isLoadingHealth: health.isLoading,

    // Error states
    statisticsError: statistics.error,
    healthError: health.error,

    // Refetch functions
    refetchStatistics: statistics.refetch,
    refetchHealth: health.refetch,

    // Actions
    clearAll: clearAll.mutate,
    clearByType: clearByType.mutate,
    clearByTags: clearByTags.mutate,
    warmDashboard: warmDashboard.mutate,
    warmStatistics: warmStatistics.mutate,
    warmAll: warmAll.mutate,

    // Action loading states
    isClearingAll: clearAll.isPending,
    isClearingByType: clearByType.isPending,
    isClearingByTags: clearByTags.isPending,
    isWarmingDashboard: warmDashboard.isPending,
    isWarmingStatistics: warmStatistics.isPending,
    isWarmingAll: warmAll.isPending,
  };
}
