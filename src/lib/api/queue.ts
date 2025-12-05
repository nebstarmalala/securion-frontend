/**
 * Queue Management API
 * Handles queue monitoring, job management, and failed job recovery
 */

import { apiClient } from './client';
import type { PaginatedResponse } from './types';

// ============================================================================
// Types
// ============================================================================

export interface QueueStatus {
  status: 'operational' | 'degraded' | 'failing';
  connection: boolean;
  pending_jobs: number;
  processing_jobs: number;
  failed_jobs: number;
  completed_today: number;
  queues: {
    [key: string]: {
      size: number;
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
}

export interface QueueMetrics {
  jobs_processed_today: number;
  jobs_processed_this_week: number;
  jobs_processed_this_month: number;
  average_processing_time_ms: number;
  success_rate: number;
  failure_rate: number;
  throughput_per_minute: number;
  peak_queue_size: number;
  by_queue: {
    [key: string]: {
      processed: number;
      failed: number;
      average_time_ms: number;
    };
  };
  by_job_type: {
    [key: string]: {
      count: number;
      success: number;
      failed: number;
      average_time_ms: number;
    };
  };
}

export interface QueueJob {
  id: string;
  queue: string;
  name: string;
  payload: any;
  attempts: number;
  max_attempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error?: string;
  progress?: number;
  processing_time_ms?: number;
}

export interface FailedJob extends QueueJob {
  exception: string;
  exception_message: string;
  stack_trace?: string;
  failed_at: string;
}

export interface RetryJobResponse {
  success: boolean;
  message: string;
  job?: QueueJob;
}

export interface ClearFailedJobsResponse {
  success: boolean;
  message: string;
  cleared_count: number;
}

export interface RetryAllFailedJobsResponse {
  success: boolean;
  message: string;
  retried_count: number;
  failed_count: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get queue status overview
 */
export async function getQueueStatus(): Promise<QueueStatus> {
  const response = await apiClient.get<QueueStatus>('/queue/status');
  return response.data;
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics(): Promise<QueueMetrics> {
  const response = await apiClient.get<QueueMetrics>('/queue/metrics');
  return response.data;
}

/**
 * Get all jobs with pagination
 */
export async function getQueueJobs(params?: {
  queue?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<QueueJob>> {
  const response = await apiClient.get<PaginatedResponse<QueueJob>>('/queue/jobs', { params });
  return response.data;
}

/**
 * Get failed jobs
 */
export async function getFailedJobs(params?: {
  queue?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<FailedJob>> {
  const response = await apiClient.get<PaginatedResponse<FailedJob>>('/queue/failed', { params });
  return response.data;
}

/**
 * Retry a specific job
 */
export async function retryJob(jobId: string): Promise<RetryJobResponse> {
  const response = await apiClient.post<RetryJobResponse>(`/queue/jobs/${jobId}/retry`);
  return response.data;
}

/**
 * Clear all failed jobs (admin only)
 */
export async function clearFailedJobs(): Promise<ClearFailedJobsResponse> {
  const response = await apiClient.post<ClearFailedJobsResponse>('/queue/failed/clear');
  return response.data;
}

/**
 * Retry all failed jobs (admin only)
 */
export async function retryAllFailedJobs(): Promise<RetryAllFailedJobsResponse> {
  const response = await apiClient.post<RetryAllFailedJobsResponse>('/queue/failed/retry-all');
  return response.data;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Check if queue is healthy
 */
export async function isQueueHealthy(): Promise<boolean> {
  const status = await getQueueStatus();
  return status.status === 'operational';
}

/**
 * Get total pending jobs across all queues
 */
export async function getTotalPendingJobs(): Promise<number> {
  const status = await getQueueStatus();
  return status.pending_jobs;
}

/**
 * Get total failed jobs
 */
export async function getTotalFailedJobs(): Promise<number> {
  const status = await getQueueStatus();
  return status.failed_jobs;
}

/**
 * Get queue success rate
 */
export async function getQueueSuccessRate(): Promise<number> {
  const metrics = await getQueueMetrics();
  return metrics.success_rate;
}

/**
 * Get jobs by queue name
 */
export async function getJobsByQueue(queue: string, params?: {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<QueueJob>> {
  return getQueueJobs({ ...params, queue });
}

/**
 * Get failed jobs by queue
 */
export async function getFailedJobsByQueue(queue: string, params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<FailedJob>> {
  return getFailedJobs({ ...params, queue });
}

/**
 * Retry multiple jobs by IDs
 */
export async function retryMultipleJobs(jobIds: string[]): Promise<RetryJobResponse[]> {
  return Promise.all(jobIds.map(id => retryJob(id)));
}
