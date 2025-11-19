/**
 * Dashboard API Service
 * Handles dashboard statistics and overview data
 */

import { apiClient, ApiResponse } from "./client"
import type {
  DashboardOverview,
  ProjectStats,
  FindingStats,
  CVEStats,
  TeamStats,
  TrendData,
} from "../types/api"

class DashboardService {
  /**
   * Get complete dashboard overview with all statistics
   * GET /dashboard/overview
   */
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<ApiResponse<DashboardOverview>>("/dashboard/overview")
    return response.data
  }

  /**
   * Get project statistics
   * GET /dashboard/projects/stats
   */
  async getProjectStats(): Promise<ProjectStats> {
    const response = await apiClient.get<ApiResponse<ProjectStats>>("/dashboard/projects/stats")
    return response.data
  }

  /**
   * Get finding statistics
   * GET /dashboard/findings/stats
   */
  async getFindingStats(): Promise<FindingStats> {
    const response = await apiClient.get<ApiResponse<FindingStats>>("/dashboard/findings/stats")
    return response.data
  }

  /**
   * Get CVE statistics
   * GET /dashboard/cve/stats
   */
  async getCVEStats(): Promise<CVEStats> {
    const response = await apiClient.get<ApiResponse<CVEStats>>("/dashboard/cve/stats")
    return response.data
  }

  /**
   * Get team statistics
   * GET /dashboard/team/stats
   */
  async getTeamStats(): Promise<TeamStats> {
    const response = await apiClient.get<ApiResponse<TeamStats>>("/dashboard/team/stats")
    return response.data
  }

  /**
   * Get trend data for specified period
   * GET /dashboard/trends?period={daily|weekly|monthly}
   *
   * @param period - Time period for trends (daily, weekly, monthly)
   * @returns Array of trend data points
   */
  async getTrends(period: "daily" | "weekly" | "monthly" = "weekly"): Promise<TrendData[]> {
    const response = await apiClient.get<ApiResponse<TrendData[]>>("/dashboard/trends", { period })
    return response.data
  }

  /**
   * Clear dashboard cache (super-admin only)
   * POST /dashboard/cache/clear
   *
   * @throws {ApiError} 403 if user doesn't have super-admin permissions
   */
  async clearCache(): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>("/dashboard/cache/clear")
    // Response will have message indicating success
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()

// Export class for testing or custom instances
export default DashboardService
