/**
 * Activity Feed API Service
 * Handles activity tracking and feeds
 */

import { apiClient, ApiResponse, PaginatedApiResponse } from "./client"
import type { Activity, ActivityStats, PaginatedData, ListQueryParams } from "../types/api"

/**
 * Query parameters for activity list
 */
export interface ActivityQueryParams extends ListQueryParams {
  action?: "created" | "updated" | "deleted" | "assigned" | "commented" | "status_changed"
  resource?: "Finding" | "Project" | "Scope" | "CveTracking" | "User"
  user_id?: string
  date_from?: string
  date_to?: string
}

/**
 * Parameters for recent count endpoint
 */
export interface RecentCountParams {
  since: string // ISO timestamp
}

class ActivitiesService {
  /**
   * Get global activity feed
   * GET /activities/feed
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of activities
   */
  async getFeed(params?: ActivityQueryParams): Promise<PaginatedData<Activity>> {
    const response = await apiClient.get<PaginatedApiResponse<Activity>>(
      "/activities/feed",
      params
    )
    return {
      data: response.data,
      links: response.links,
      meta: response.meta,
    }
  }

  /**
   * Get current user's activities
   * GET /activities/me
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of user's activities
   */
  async getMyActivities(params?: ActivityQueryParams): Promise<PaginatedData<Activity>> {
    const response = await apiClient.get<PaginatedApiResponse<Activity>>(
      "/activities/me",
      params
    )
    return {
      data: response.data,
      links: response.links,
      meta: response.meta,
    }
  }

  /**
   * Get activity statistics for a period
   * GET /activities/stats?period={today|week|month}
   *
   * @param period - Time period for statistics
   * @returns Activity statistics
   */
  async getStats(period: "today" | "week" | "month" = "week"): Promise<ActivityStats> {
    const response = await apiClient.get<ApiResponse<ActivityStats>>(
      "/activities/stats",
      { period }
    )
    return response.data
  }

  /**
   * Get count of recent activities since a timestamp
   * GET /activities/recent-count?since={timestamp}
   *
   * @param since - ISO timestamp to count activities from
   * @returns Number of recent activities
   */
  async getRecentCount(since: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      "/activities/recent-count",
      { since }
    )
    return response.data.count
  }

  /**
   * Get activities for a specific user
   * GET /activities/users/{user}
   *
   * @param userId - User ID
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of user's activities
   */
  async getUserActivities(
    userId: string,
    params?: ActivityQueryParams
  ): Promise<PaginatedData<Activity>> {
    const response = await apiClient.get<PaginatedApiResponse<Activity>>(
      `/activities/users/${userId}`,
      params
    )
    return {
      data: response.data,
      links: response.links,
      meta: response.meta,
    }
  }

  /**
   * Get activities for a specific project
   * GET /projects/{project}/activities
   *
   * @param projectId - Project ID
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of project activities
   */
  async getProjectActivities(
    projectId: string,
    params?: ActivityQueryParams
  ): Promise<PaginatedData<Activity>> {
    const response = await apiClient.get<PaginatedApiResponse<Activity>>(
      `/projects/${projectId}/activities`,
      params
    )
    return {
      data: response.data,
      links: response.links,
      meta: response.meta,
    }
  }

  /**
   * Get activities for a specific finding
   * GET /findings/{finding}/activities
   *
   * @param findingId - Finding ID
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of finding activities
   */
  async getFindingActivities(
    findingId: string,
    params?: ActivityQueryParams
  ): Promise<PaginatedData<Activity>> {
    const response = await apiClient.get<PaginatedApiResponse<Activity>>(
      `/findings/${findingId}/activities`,
      params
    )
    return {
      data: response.data,
      links: response.links,
      meta: response.meta,
    }
  }

  /**
   * Get activities for a specific scope
   * GET /scopes/{scope}/activities
   *
   * @param scopeId - Scope ID
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of scope activities
   */
  async getScopeActivities(
    scopeId: string,
    params?: ActivityQueryParams
  ): Promise<PaginatedData<Activity>> {
    const response = await apiClient.get<PaginatedApiResponse<Activity>>(
      `/scopes/${scopeId}/activities`,
      params
    )
    return {
      data: response.data,
      links: response.links,
      meta: response.meta,
    }
  }
}

// Export singleton instance
export const activitiesService = new ActivitiesService()

// Export class for testing or custom instances
export default ActivitiesService
