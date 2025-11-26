import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsService } from "@/lib/api"
import type { Notification, PaginatedData, NotificationQueryParams } from "@/lib/types/api"

export function useNotifications(params?: NotificationQueryParams) {
  return useQuery<PaginatedData<Notification>>({
    queryKey: ["notifications", params],
    queryFn: () => notificationsService.list(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useUnreadNotifications(params?: { page?: number; per_page?: number }) {
  return useQuery<PaginatedData<Notification>>({
    queryKey: ["notifications", "unread", params],
    queryFn: () => notificationsService.getUnread(params),
    refetchInterval: 15000, // Refetch every 15 seconds
  })
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ["notifications", "unread", "count"],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useDeleteAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}