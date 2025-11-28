/**
 * Notifications React Query Hooks
 *
 * Provides hooks for notification management including
 * listing, reading, deleting, and preference management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { notificationsService } from "../api/notifications"
import { notificationPreferencesService } from "../api/notification-preferences"
import type {
  UpdateNotificationPreferenceInput,
  BulkUpdateNotificationPreferencesInput,
  ListQueryParams,
} from "../types"
import { handleError } from "../errors"

// ============================================================================
// Query Keys Factory
// ============================================================================

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params?: ListQueryParams) => [...notificationKeys.lists(), params] as const,
  unread: (params?: ListQueryParams) => [...notificationKeys.all, "unread", params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,

  // Preferences
  preferences: {
    all: ["notification-preferences"] as const,
    list: () => [...notificationKeys.preferences.all, "list"] as const,
  },
}

// ============================================================================
// Notification Queries
// ============================================================================

/**
 * Hook to fetch paginated list of notifications
 */
export function useNotifications(params?: ListQueryParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsService.list(params),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to fetch unread notifications
 */
export function useUnreadNotifications(params?: ListQueryParams) {
  return useQuery({
    queryKey: notificationKeys.unread(params),
    queryFn: () => notificationsService.getUnread(params),
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to fetch unread notification count
 * Polls frequently for real-time updates
 */
export function useUnreadNotificationCount(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: options?.refetchInterval ?? 30 * 1000, // Poll every 30 seconds by default
  })
}

/**
 * Hook to fetch finding-related notifications
 */
export function useFindingNotifications(params?: ListQueryParams) {
  return useQuery({
    queryKey: [...notificationKeys.lists(), "finding", params],
    queryFn: () => notificationsService.getFindingNotifications(params),
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to fetch comment-related notifications
 */
export function useCommentNotifications(params?: ListQueryParams) {
  return useQuery({
    queryKey: [...notificationKeys.lists(), "comment", params],
    queryFn: () => notificationsService.getCommentNotifications(params),
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to fetch CVE-related notifications
 */
export function useCVENotifications(params?: ListQueryParams) {
  return useQuery({
    queryKey: [...notificationKeys.lists(), "cve", params],
    queryFn: () => notificationsService.getCVENotifications(params),
    staleTime: 30 * 1000,
  })
}

// ============================================================================
// Notification Mutations
// ============================================================================

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
    onError: (error) => {
      handleError(error, "Failed to mark notification as read")
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: (result) => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })

      toast.success("All notifications marked as read", {
        description: `${result.count} notification(s) marked as read.`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to mark all notifications as read")
    },
  })
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.delete(notificationId),
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })

      toast.success("Notification deleted")
    },
    onError: (error) => {
      handleError(error, "Failed to delete notification")
    },
  })
}

/**
 * Hook to delete all read notifications
 */
export function useDeleteAllReadNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.deleteAllRead(),
    onSuccess: (result) => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() })

      toast.success("Read notifications deleted", {
        description: `${result.count} notification(s) deleted.`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to delete read notifications")
    },
  })
}

// ============================================================================
// Notification Preference Queries
// ============================================================================

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences.list(),
    queryFn: () => notificationPreferencesService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// Notification Preference Mutations
// ============================================================================

/**
 * Hook to update a single notification preference
 */
export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateNotificationPreferenceInput) =>
      notificationPreferencesService.updatePreference(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences.list() })
      toast.success("Notification preference updated")
    },
    onError: (error) => {
      handleError(error, "Failed to update notification preference")
    },
  })
}

/**
 * Hook to bulk update notification preferences
 */
export function useBulkUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BulkUpdateNotificationPreferencesInput) =>
      notificationPreferencesService.bulkUpdatePreferences(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences.list() })
      toast.success("Notification preferences updated")
    },
    onError: (error) => {
      handleError(error, "Failed to update notification preferences")
    },
  })
}

/**
 * Hook to enable all notifications
 */
export function useEnableAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationPreferencesService.enableAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences.list() })
      toast.success("All notifications enabled")
    },
    onError: (error) => {
      handleError(error, "Failed to enable all notifications")
    },
  })
}

/**
 * Hook to disable all notifications
 */
export function useDisableAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationPreferencesService.disableAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences.list() })
      toast.success("All notifications disabled")
    },
    onError: (error) => {
      handleError(error, "Failed to disable all notifications")
    },
  })
}

/**
 * Hook to reset notification preferences to defaults
 */
export function useResetNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationPreferencesService.resetToDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences.list() })
      toast.success("Notification preferences reset to defaults")
    },
    onError: (error) => {
      handleError(error, "Failed to reset notification preferences")
    },
  })
}

// ============================================================================
// Combined Hooks
// ============================================================================

/**
 * Combined hook for notification management
 */
export function useNotificationManagement(params?: ListQueryParams) {
  const notifications = useNotifications(params)
  const unreadCount = useUnreadNotificationCount()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const deleteNotification = useDeleteNotification()
  const deleteAllRead = useDeleteAllReadNotifications()

  return {
    // Queries
    notifications,
    unreadCount: unreadCount.data ?? 0,
    isLoading: notifications.isLoading,
    error: notifications.error,

    // Mutations
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,

    // Mutation states
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
    isDeleting: deleteNotification.isPending,
    isDeletingAllRead: deleteAllRead.isPending,
  }
}

/**
 * Combined hook for notification preference management
 */
export function useNotificationPreferenceManagement() {
  const preferences = useNotificationPreferences()
  const updatePreference = useUpdateNotificationPreference()
  const bulkUpdate = useBulkUpdateNotificationPreferences()
  const enableAll = useEnableAllNotifications()
  const disableAll = useDisableAllNotifications()
  const reset = useResetNotificationPreferences()

  return {
    // Query
    preferences,
    isLoading: preferences.isLoading,
    error: preferences.error,

    // Mutations
    updatePreference,
    bulkUpdate,
    enableAll,
    disableAll,
    reset,

    // Mutation states
    isUpdating: updatePreference.isPending,
    isBulkUpdating: bulkUpdate.isPending,
    isEnablingAll: enableAll.isPending,
    isDisablingAll: disableAll.isPending,
    isResetting: reset.isPending,
  }
}

/**
 * Hook for notification bell/badge component
 * Provides just the unread count with frequent polling
 */
export function useNotificationBell() {
  const unreadCount = useUnreadNotificationCount({ refetchInterval: 15 * 1000 }) // Poll every 15 seconds
  const markAllAsRead = useMarkAllNotificationsAsRead()

  return {
    count: unreadCount.data ?? 0,
    isLoading: unreadCount.isLoading,
    markAllAsRead,
    isMarkingAllAsRead: markAllAsRead.isPending,
  }
}
