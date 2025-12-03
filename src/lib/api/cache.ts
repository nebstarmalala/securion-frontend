/**
 * Cache Management API
 * Handles cache statistics, health checks, and cache clearing operations
 */

import { apiClient } from './client';

// ============================================================================
// Types
// ============================================================================

export interface CacheStatistics {
  total_keys: number;
  total_size: number;
  hit_rate: number;
  miss_rate: number;
  eviction_count: number;
  memory_usage: {
    used: number;
    total: number;
    percentage: number;
  };
  by_type: {
    [key: string]: {
      count: number;
      size: number;
    };
  };
  by_tags: {
    [key: string]: number;
  };
}

export interface CacheHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms: number;
  connection: boolean;
  memory_available: number;
  issues: string[];
  last_checked: string;
}

export interface CacheClearResponse {
  success: boolean;
  message: string;
  cleared_keys?: number;
  cleared_size?: number;
}

export interface CacheWarmResponse {
  success: boolean;
  message: string;
  warmed_keys?: number;
  duration_ms?: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get cache statistics (super-admin only)
 */
export async function getCacheStatistics(): Promise<CacheStatistics> {
  const response = await apiClient.get<CacheStatistics>('/cache/statistics');
  return response.data;
}

/**
 * Get cache health status
 */
export async function getCacheHealth(): Promise<CacheHealth> {
  const response = await apiClient.get<CacheHealth>('/cache/health');
  return response.data;
}

/**
 * Clear all cache (super-admin only)
 */
export async function clearAllCache(): Promise<CacheClearResponse> {
  const response = await apiClient.post<CacheClearResponse>('/cache/clear-all');
  return response.data;
}

/**
 * Clear cache by type (super-admin only)
 */
export async function clearCacheByType(type: string): Promise<CacheClearResponse> {
  const response = await apiClient.post<CacheClearResponse>('/cache/clear-type', { type });
  return response.data;
}

/**
 * Clear cache by tags (super-admin only)
 */
export async function clearCacheByTags(tags: string[]): Promise<CacheClearResponse> {
  const response = await apiClient.post<CacheClearResponse>('/cache/clear-by-tags', { tags });
  return response.data;
}

/**
 * Warm dashboard cache (super-admin only)
 */
export async function warmDashboardCache(): Promise<CacheWarmResponse> {
  const response = await apiClient.post<CacheWarmResponse>('/cache/warm-dashboard');
  return response.data;
}

/**
 * Warm statistics cache (super-admin only)
 */
export async function warmStatisticsCache(): Promise<CacheWarmResponse> {
  const response = await apiClient.post<CacheWarmResponse>('/cache/warm-statistics');
  return response.data;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Check if cache is healthy
 */
export async function isCacheHealthy(): Promise<boolean> {
  const health = await getCacheHealth();
  return health.status === 'healthy';
}

/**
 * Get cache memory usage percentage
 */
export async function getCacheMemoryUsage(): Promise<number> {
  const stats = await getCacheStatistics();
  return stats.memory_usage.percentage;
}

/**
 * Get cache hit rate
 */
export async function getCacheHitRate(): Promise<number> {
  const stats = await getCacheStatistics();
  return stats.hit_rate;
}

/**
 * Warm all caches (super-admin only)
 */
export async function warmAllCaches(): Promise<{
  dashboard: CacheWarmResponse;
  statistics: CacheWarmResponse;
}> {
  const [dashboard, statistics] = await Promise.all([
    warmDashboardCache(),
    warmStatisticsCache(),
  ]);

  return { dashboard, statistics };
}
