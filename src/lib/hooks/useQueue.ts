/**
 * React Query Hooks for Queue Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as queueService from '../api/queue';
import type {
  QueueStatus,
  QueueMetrics,
  QueueJob,
  FailedJob,
  RetryJobResponse,
  ClearFailedJobsResponse,
  RetryAllFailedJobsResponse,
} from '../api/queue';
import type { PaginatedResponse } from '../api/types';

// ============================================================================
// Query Keys
// ============================================================================

export const queueKeys = {
  all: ['queue'] as const,
  status: () => [...queueKeys.all, 'status'] as const,
  metrics: () => [...queueKeys.all, 'metrics'] as const,
  jobs: (params?: any) => [...queueKeys.all, 'jobs', params] as const,
  failedJobs: (params?: any) => [...queueKeys.all, 'failed-jobs', params] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get queue status overview
 */
export function useQueueStatus() {
  return useQuery({
    queryKey: queueKeys.status(),
    queryFn: queueService.getQueueStatus,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Get queue metrics
 */
export function useQueueMetrics() {
  return useQuery({
    queryKey: queueKeys.metrics(),
    queryFn: queueService.getQueueMetrics,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Get all jobs with pagination
 */
export function useQueueJobs(params?: {
  queue?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: queueKeys.jobs(params),
    queryFn: () => queueService.getQueueJobs(params),
    staleTime: 10000,
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

/**
 * Get failed jobs
 */
export function useFailedJobs(params?: {
  queue?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: queueKeys.failedJobs(params),
    queryFn: () => queueService.getFailedJobs(params),
    staleTime: 10000,
    refetchInterval: 30000,
  });
}

/**
 * Check if queue is healthy
 */
export function useIsQueueHealthy() {
  return useQuery({
    queryKey: [...queueKeys.status(), 'is-healthy'],
    queryFn: queueService.isQueueHealthy,
    staleTime: 10000,
  });
}

/**
 * Get total pending jobs
 */
export function useTotalPendingJobs() {
  return useQuery({
    queryKey: [...queueKeys.status(), 'total-pending'],
    queryFn: queueService.getTotalPendingJobs,
    staleTime: 10000,
  });
}

/**
 * Get total failed jobs
 */
export function useTotalFailedJobs() {
  return useQuery({
    queryKey: [...queueKeys.status(), 'total-failed'],
    queryFn: queueService.getTotalFailedJobs,
    staleTime: 10000,
  });
}

/**
 * Get queue success rate
 */
export function useQueueSuccessRate() {
  return useQuery({
    queryKey: [...queueKeys.metrics(), 'success-rate'],
    queryFn: queueService.getQueueSuccessRate,
    staleTime: 30000,
  });
}

/**
 * Get jobs by queue name
 */
export function useJobsByQueue(queue: string, params?: {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: queueKeys.jobs({ queue, ...params }),
    queryFn: () => queueService.getJobsByQueue(queue, params),
    staleTime: 10000,
    refetchInterval: 15000,
  });
}

/**
 * Get failed jobs by queue
 */
export function useFailedJobsByQueue(queue: string, params?: {
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: queueKeys.failedJobs({ queue, ...params }),
    queryFn: () => queueService.getFailedJobsByQueue(queue, params),
    staleTime: 10000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Retry a specific job
 */
export function useRetryJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => queueService.retryJob(jobId),
    onSuccess: (data: RetryJobResponse, jobId: string) => {
      if (data.success) {
        toast.success(data.message || 'Job queued for retry', {
          description: `Job ID: ${jobId}`,
        });

        // Invalidate job queries
        queryClient.invalidateQueries({ queryKey: queueKeys.all });
      } else {
        toast.error(data.message || 'Failed to retry job');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to retry job', {
        description: error.message,
      });
    },
  });
}

/**
 * Retry multiple jobs
 */
export function useRetryMultipleJobs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobIds: string[]) => queueService.retryMultipleJobs(jobIds),
    onSuccess: (results: RetryJobResponse[], jobIds: string[]) => {
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;

      if (successCount === results.length) {
        toast.success(`${successCount} jobs queued for retry`);
      } else if (successCount > 0) {
        toast.warning(`${successCount} jobs queued, ${failedCount} failed`);
      } else {
        toast.error(`Failed to retry ${failedCount} jobs`);
      }

      // Invalidate job queries
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to retry jobs', {
        description: error.message,
      });
    },
  });
}

/**
 * Clear all failed jobs (admin only)
 */
export function useClearFailedJobs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queueService.clearFailedJobs,
    onSuccess: (data: ClearFailedJobsResponse) => {
      if (data.success) {
        toast.success(data.message || 'All failed jobs cleared', {
          description: `Cleared ${data.cleared_count} failed jobs`,
        });

        // Invalidate all queue queries
        queryClient.invalidateQueries({ queryKey: queueKeys.all });
      } else {
        toast.error(data.message || 'Failed to clear failed jobs');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to clear failed jobs', {
        description: error.message,
      });
    },
  });
}

/**
 * Retry all failed jobs (admin only)
 */
export function useRetryAllFailedJobs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queueService.retryAllFailedJobs,
    onSuccess: (data: RetryAllFailedJobsResponse) => {
      if (data.success) {
        toast.success(data.message || 'All failed jobs queued for retry', {
          description: data.failed_count
            ? `${data.retried_count} queued, ${data.failed_count} could not be retried`
            : `${data.retried_count} jobs queued for retry`,
        });

        // Invalidate all queue queries
        queryClient.invalidateQueries({ queryKey: queueKeys.all });
      } else {
        toast.error(data.message || 'Failed to retry jobs');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to retry failed jobs', {
        description: error.message,
      });
    },
  });
}

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * All-in-one queue management hook
 */
export function useQueueManagement(params?: {
  queue?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  page?: number;
  per_page?: number;
}) {
  const status = useQueueStatus();
  const metrics = useQueueMetrics();
  const jobs = useQueueJobs(params);
  const failedJobs = useFailedJobs(params);
  const retryJob = useRetryJob();
  const retryMultiple = useRetryMultipleJobs();
  const clearFailed = useClearFailedJobs();
  const retryAllFailed = useRetryAllFailedJobs();

  return {
    // Data
    status: status.data,
    metrics: metrics.data,
    jobs: jobs.data,
    failedJobs: failedJobs.data,

    // Loading states
    isLoadingStatus: status.isLoading,
    isLoadingMetrics: metrics.isLoading,
    isLoadingJobs: jobs.isLoading,
    isLoadingFailedJobs: failedJobs.isLoading,

    // Error states
    statusError: status.error,
    metricsError: metrics.error,
    jobsError: jobs.error,
    failedJobsError: failedJobs.error,

    // Refetch functions
    refetchStatus: status.refetch,
    refetchMetrics: metrics.refetch,
    refetchJobs: jobs.refetch,
    refetchFailedJobs: failedJobs.refetch,

    // Actions
    retryJob: retryJob.mutate,
    retryMultiple: retryMultiple.mutate,
    clearFailed: clearFailed.mutate,
    retryAllFailed: retryAllFailed.mutate,

    // Action loading states
    isRetrying: retryJob.isPending,
    isRetryingMultiple: retryMultiple.isPending,
    isClearingFailed: clearFailed.isPending,
    isRetryingAllFailed: retryAllFailed.isPending,
  };
}
