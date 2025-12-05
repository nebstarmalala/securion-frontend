/**
 * Notification Preferences API Service
 * Handles all notification preference management API operations
 *
 * Channels:
 * - database (in-app notifications)
 * - mail (email notifications)
 */

import { apiClient, type ApiResponse } from "./client"
import type {
  NotificationPreference,
  UpdateNotificationPreferenceInput,
  BulkUpdateNotificationPreferencesInput,
} from "@/lib/types/api"

class NotificationPreferencesService {
  /**
   * Get all notification preferences for current user
   * GET /notifications/preferences
   *
   * @returns List of notification preferences
   */
  async getPreferences(): Promise<NotificationPreference[]> {
    const response = await apiClient.get<ApiResponse<NotificationPreference[]>>(
      "/notifications/preferences"
    )
    return response.data
  }

  /**
   * Update single notification preference
   * PUT /notifications/preferences
   *
   * @param data - Preference update data
   * @returns Updated preference
   */
  async updatePreference(data: UpdateNotificationPreferenceInput): Promise<NotificationPreference> {
    const response = await apiClient.put<ApiResponse<NotificationPreference>>(
      "/notifications/preferences",
      data
    )
    return response.data
  }

  /**
   * Bulk update notification preferences
   * POST /notifications/preferences/bulk
   *
   * @param data - Bulk update data
   * @returns Updated preferences
   */
  async bulkUpdatePreferences(
    data: BulkUpdateNotificationPreferencesInput
  ): Promise<NotificationPreference[]> {
    const response = await apiClient.post<ApiResponse<NotificationPreference[]>>(
      "/notifications/preferences/bulk",
      data
    )
    return response.data
  }

  /**
   * Enable all notifications
   * POST /notifications/preferences/enable-all
   *
   * @returns Success message with updated preferences
   */
  async enableAll(): Promise<{ message: string; preferences: NotificationPreference[] }> {
    const response = await apiClient.post<
      ApiResponse<{ message: string; preferences: NotificationPreference[] }>
    >("/notifications/preferences/enable-all")
    return response.data
  }

  /**
   * Disable all notifications
   * POST /notifications/preferences/disable-all
   *
   * @returns Success message with updated preferences
   */
  async disableAll(): Promise<{ message: string; preferences: NotificationPreference[] }> {
    const response = await apiClient.post<
      ApiResponse<{ message: string; preferences: NotificationPreference[] }>
    >("/notifications/preferences/disable-all")
    return response.data
  }

  /**
   * Reset preferences to defaults
   * POST /notifications/preferences/reset
   *
   * @returns Success message with reset preferences
   */
  async resetToDefaults(): Promise<{ message: string; preferences: NotificationPreference[] }> {
    const response = await apiClient.post<
      ApiResponse<{ message: string; preferences: NotificationPreference[] }>
    >("/notifications/preferences/reset")
    return response.data
  }

  /**
   * Enable specific notification type
   * Convenience method to enable a notification type
   *
   * @param notificationType - Notification type to enable
   * @param channels - Channels to enable (default: ['database', 'mail'])
   * @returns Updated preference
   */
  async enableNotificationType(
    notificationType: string,
    channels: string[] = ["database", "mail"]
  ): Promise<NotificationPreference> {
    return this.updatePreference({
      notification_type: notificationType,
      enabled: true,
      channels,
    })
  }

  /**
   * Disable specific notification type
   * Convenience method to disable a notification type
   *
   * @param notificationType - Notification type to disable
   * @returns Updated preference
   */
  async disableNotificationType(notificationType: string): Promise<NotificationPreference> {
    return this.updatePreference({
      notification_type: notificationType,
      enabled: false,
      channels: [],
    })
  }

  /**
   * Enable email notifications only
   * Convenience method to enable only email channel for a notification type
   *
   * @param notificationType - Notification type
   * @returns Updated preference
   */
  async enableEmailOnly(notificationType: string): Promise<NotificationPreference> {
    return this.updatePreference({
      notification_type: notificationType,
      enabled: true,
      channels: ["mail"],
    })
  }

  /**
   * Enable in-app notifications only
   * Convenience method to enable only database channel for a notification type
   *
   * @param notificationType - Notification type
   * @returns Updated preference
   */
  async enableInAppOnly(notificationType: string): Promise<NotificationPreference> {
    return this.updatePreference({
      notification_type: notificationType,
      enabled: true,
      channels: ["database"],
    })
  }

  /**
   * Get preference for specific notification type
   * Convenience method to get a single preference
   *
   * @param notificationType - Notification type
   * @returns Preference for the notification type
   */
  async getPreferenceByType(notificationType: string): Promise<NotificationPreference | undefined> {
    const preferences = await this.getPreferences()
    return preferences.find((pref) => pref.notification_type === notificationType)
  }

  /**
   * Check if notification type is enabled
   * Convenience method to check if a notification type is enabled
   *
   * @param notificationType - Notification type
   * @returns Whether the notification type is enabled
   */
  async isEnabled(notificationType: string): Promise<boolean> {
    const preference = await this.getPreferenceByType(notificationType)
    return preference?.enabled ?? false
  }

  /**
   * Enable all finding-related notifications
   * Convenience method for finding notifications
   *
   * @returns Updated preferences
   */
  async enableFindingNotifications(): Promise<NotificationPreference[]> {
    return this.bulkUpdatePreferences({
      preferences: [
        {
          notification_type: "finding_created",
          enabled: true,
          channels: ["database", "mail"],
        },
        {
          notification_type: "finding_status_changed",
          enabled: true,
          channels: ["database", "mail"],
        },
      ],
    })
  }

  /**
   * Enable all comment-related notifications
   * Convenience method for comment notifications
   *
   * @returns Updated preferences
   */
  async enableCommentNotifications(): Promise<NotificationPreference[]> {
    return this.bulkUpdatePreferences({
      preferences: [
        {
          notification_type: "comment_mention",
          enabled: true,
          channels: ["database", "mail"],
        },
        {
          notification_type: "comment_reply",
          enabled: true,
          channels: ["database", "mail"],
        },
      ],
    })
  }
}

// Export singleton instance
export const notificationPreferencesService = new NotificationPreferencesService()
