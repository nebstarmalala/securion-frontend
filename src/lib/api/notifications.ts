/**
 * Notifications API Service
 * Handles all notification management API operations
 *
 * Notification Types:
 * - finding_created
 * - finding_status_changed
 * - project_assigned
 * - comment_mention
 * - comment_reply
 * - cve_critical_match
 */

import { apiClient, type ApiResponse, type PaginatedApiResponse } from "./client"
import type { Notification, PaginatedData, QueryParams } from "@/lib/types/api"

class NotificationsService {
  /**
   * Get all notifications for the current user
   * GET /notifications
   *
   * Query Parameters:
   * - page: Page number
   * - per_page: Items per page
   * - type: Filter by notification type
   * - read: Filter by read status
   *
   * @param params - Query parameters
   * @returns Paginated list of notifications
   */
  async list(params?: QueryParams): Promise<PaginatedData<Notification>> {
    const response = await apiClient.get<PaginatedApiResponse<Notification>>(
      "/notifications",
      params
    )
    return response
  }

  /**
   * Get unread notifications only
   * GET /notifications/unread
   *
   * @param params - Query parameters
   * @returns List of unread notifications
   */
  async getUnread(params?: QueryParams): Promise<PaginatedData<Notification>> {
    const response = await apiClient.get<PaginatedApiResponse<Notification>>(
      "/notifications/unread",
      params
    )
    return response
  }

  /**
   * Get unread notification count
   * GET /notifications/unread/count
   *
   * @returns Unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      "/notifications/unread/count"
    )
    return response.data.count
  }

  /**
   * Mark notification as read
   * POST /notifications/{id}/read
   *
   * @param notificationId - Notification ID
   * @returns Updated notification
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.post<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    )
    return response.data
  }

  /**
   * Mark all notifications as read
   * POST /notifications/read-all
   *
   * @returns Success message
   */
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const response = await apiClient.post<ApiResponse<{ message: string; count: number }>>(
      "/notifications/read-all"
    )
    return response.data
  }

  /**
   * Delete single notification
   * DELETE /notifications/{id}
   *
   * @param notificationId - Notification ID
   */
  async delete(notificationId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/notifications/${notificationId}`)
  }

  /**
   * Delete all read notifications
   * DELETE /notifications/read/all
   *
   * @returns Success message with count of deleted notifications
   */
  async deleteAllRead(): Promise<{ message: string; count: number }> {
    const response = await apiClient.delete<ApiResponse<{ message: string; count: number }>>(
      "/notifications/read/all"
    )
    return response.data
  }

  /**
   * Get notifications by type
   * Convenience method for filtering by type
   *
   * @param type - Notification type
   * @param params - Query parameters
   * @returns List of notifications of specified type
   */
  async getByType(type: string, params?: QueryParams): Promise<PaginatedData<Notification>> {
    return this.list({ ...params, type })
  }

  /**
   * Get finding-related notifications
   * Convenience method for finding notifications
   *
   * @param params - Query parameters
   * @returns List of finding notifications
   */
  async getFindingNotifications(params?: QueryParams): Promise<PaginatedData<Notification>> {
    return this.list({
      ...params,
      type: ["finding_created", "finding_status_changed"].join(","),
    })
  }

  /**
   * Get comment-related notifications
   * Convenience method for comment notifications
   *
   * @param params - Query parameters
   * @returns List of comment notifications
   */
  async getCommentNotifications(params?: QueryParams): Promise<PaginatedData<Notification>> {
    return this.list({
      ...params,
      type: ["comment_mention", "comment_reply"].join(","),
    })
  }

  /**
   * Get CVE-related notifications
   * Convenience method for CVE notifications
   *
   * @param params - Query parameters
   * @returns List of CVE notifications
   */
  async getCVENotifications(params?: QueryParams): Promise<PaginatedData<Notification>> {
    return this.list({ ...params, type: "cve_critical_match" })
  }

  /**
   * Get project assignment notifications
   * Convenience method for project assignment notifications
   *
   * @param params - Query parameters
   * @returns List of project assignment notifications
   */
  async getProjectAssignmentNotifications(
    params?: QueryParams
  ): Promise<PaginatedData<Notification>> {
    return this.list({ ...params, type: "project_assigned" })
  }

  /**
   * Poll for new notifications
   * Convenience method for polling
   *
   * @param lastChecked - ISO timestamp of last check
   * @returns New notifications since last check
   */
  async pollNewNotifications(lastChecked: string): Promise<Notification[]> {
    const response = await this.getUnread({ since: lastChecked })
    return response.data
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService()
