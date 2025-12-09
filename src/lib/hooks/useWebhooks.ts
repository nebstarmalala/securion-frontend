/**
 * Webhooks React Query Hooks
 *
 * Provides hooks for webhook management including
 * CRUD operations, delivery tracking, testing, and secret management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  webhooksService,
  type WebhookFilters,
  type WebhookDeliveryFilters,
} from "../api/webhooks"
import type { CreateWebhookInput, UpdateWebhookInput } from "../types"
import { handleError } from "../errors"

// ============================================================================
// Query Keys Factory
// ============================================================================

export const webhookKeys = {
  all: ["webhooks"] as const,
  lists: () => [...webhookKeys.all, "list"] as const,
  list: (filters?: WebhookFilters) => [...webhookKeys.lists(), filters] as const,
  details: () => [...webhookKeys.all, "detail"] as const,
  detail: (id: string) => [...webhookKeys.details(), id] as const,
  events: () => [...webhookKeys.all, "events"] as const,

  // Deliveries
  deliveries: {
    all: ["webhook-deliveries"] as const,
    byWebhook: (webhookId: string, filters?: WebhookDeliveryFilters) =>
      [...webhookKeys.deliveries.all, "webhook", webhookId, filters] as const,
    details: () => [...webhookKeys.deliveries.all, "detail"] as const,
    detail: (id: string) => [...webhookKeys.deliveries.details(), id] as const,
  },
}

// ============================================================================
// Webhook Queries
// ============================================================================

/**
 * Hook to fetch paginated list of webhooks
 */
export function useWebhooks(filters?: WebhookFilters) {
  return useQuery({
    queryKey: webhookKeys.list(filters),
    queryFn: () => webhooksService.getWebhooks(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch a single webhook by ID
 */
export function useWebhook(webhookId: string | undefined) {
  return useQuery({
    queryKey: webhookKeys.detail(webhookId!),
    queryFn: () => webhooksService.getWebhook(webhookId!),
    enabled: !!webhookId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch available webhook events
 */
export function useWebhookEvents() {
  return useQuery({
    queryKey: webhookKeys.events(),
    queryFn: () => webhooksService.getAvailableEvents(),
    staleTime: 60 * 60 * 1000, // 1 hour (static data)
  })
}

/**
 * Hook to fetch active webhooks only
 */
export function useActiveWebhooks(filters?: Omit<WebhookFilters, "is_active">) {
  return useWebhooks({ ...filters, is_active: true })
}

/**
 * Hook to fetch webhooks by event type
 */
export function useWebhooksByEvent(
  event: string,
  filters?: Omit<WebhookFilters, "event">
) {
  return useWebhooks({ ...filters, event })
}

// ============================================================================
// Webhook Mutations
// ============================================================================

/**
 * Hook to create a new webhook
 */
export function useCreateWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWebhookInput) => webhooksService.createWebhook(data),
    onSuccess: (newWebhook) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
      toast.success("Webhook created successfully", {
        description: `"${newWebhook.name}" is now ${newWebhook.is_active ? "active" : "inactive"}.`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create webhook")
    },
  })
}

/**
 * Hook to update an existing webhook
 */
export function useUpdateWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookInput }) =>
      webhooksService.updateWebhook(id, data),
    onSuccess: (updatedWebhook, { id }) => {
      queryClient.setQueryData(webhookKeys.detail(id), updatedWebhook)
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
      toast.success("Webhook updated successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to update webhook")
    },
  })
}

/**
 * Hook to delete a webhook
 */
export function useDeleteWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (webhookId: string) => webhooksService.deleteWebhook(webhookId),
    onSuccess: (_, webhookId) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
      queryClient.removeQueries({ queryKey: webhookKeys.detail(webhookId) })
      toast.success("Webhook deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete webhook")
    },
  })
}

/**
 * Hook to toggle webhook active status
 */
export function useToggleWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (webhookId: string) => webhooksService.toggleWebhook(webhookId),
    onSuccess: (updatedWebhook, webhookId) => {
      queryClient.setQueryData(webhookKeys.detail(webhookId), updatedWebhook)
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
      toast.success(
        updatedWebhook.is_active ? "Webhook enabled" : "Webhook disabled",
        {
          description: `"${updatedWebhook.name}" is now ${updatedWebhook.is_active ? "active" : "inactive"}.`,
        }
      )
    },
    onError: (error) => {
      handleError(error, "Failed to toggle webhook")
    },
  })
}

/**
 * Hook to test a webhook
 */
export function useTestWebhook() {
  return useMutation({
    mutationFn: (webhookId: string) => webhooksService.testWebhook(webhookId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Webhook test successful", {
          description: `Response: ${result.response_code} (${result.duration_ms}ms)`,
        })
      } else {
        toast.error("Webhook test failed", {
          description: result.error || `Response: ${result.response_code}`,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to test webhook")
    },
  })
}

/**
 * Hook to regenerate webhook secret
 */
export function useRegenerateWebhookSecret() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (webhookId: string) => webhooksService.regenerateSecret(webhookId),
    onSuccess: (result, webhookId) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.detail(webhookId) })
      toast.success("Webhook secret regenerated", {
        description: "Make sure to update your endpoint with the new secret.",
      })
      return result.secret
    },
    onError: (error) => {
      handleError(error, "Failed to regenerate webhook secret")
    },
  })
}

// ============================================================================
// Delivery Queries
// ============================================================================

/**
 * Hook to fetch deliveries for a specific webhook
 */
export function useWebhookDeliveries(
  webhookId: string | undefined,
  filters?: WebhookDeliveryFilters
) {
  return useQuery({
    queryKey: webhookKeys.deliveries.byWebhook(webhookId!, filters),
    queryFn: () => webhooksService.getWebhookDeliveries(webhookId!, filters),
    enabled: !!webhookId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to fetch a single delivery by ID
 */
export function useWebhookDelivery(deliveryId: string | undefined) {
  return useQuery({
    queryKey: webhookKeys.deliveries.detail(deliveryId!),
    queryFn: () => webhooksService.getDelivery(deliveryId!),
    enabled: !!deliveryId,
    staleTime: 30 * 1000,
  })
}

// ============================================================================
// Delivery Mutations
// ============================================================================

/**
 * Hook to retry a failed delivery
 */
export function useRetryWebhookDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deliveryId: string) => webhooksService.retryDelivery(deliveryId),
    onSuccess: (delivery) => {
      // Invalidate deliveries for this webhook
      queryClient.invalidateQueries({
        queryKey: webhookKeys.deliveries.byWebhook(delivery.webhook_id),
      })
      queryClient.setQueryData(webhookKeys.deliveries.detail(delivery.id), delivery)

      if (delivery.status === "success") {
        toast.success("Delivery retry successful")
      } else {
        toast.warning("Delivery retry attempted", {
          description: `Status: ${delivery.status}. Attempts: ${delivery.attempts}`,
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to retry delivery")
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to prefetch a webhook
 */
export function usePrefetchWebhook() {
  const queryClient = useQueryClient()

  return (webhookId: string) => {
    queryClient.prefetchQuery({
      queryKey: webhookKeys.detail(webhookId),
      queryFn: () => webhooksService.getWebhook(webhookId),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Combined hook for webhook management
 */
export function useWebhookManagement(filters?: WebhookFilters) {
  const webhooks = useWebhooks(filters)
  const webhookEvents = useWebhookEvents()
  const createWebhook = useCreateWebhook()
  const updateWebhook = useUpdateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const toggleWebhook = useToggleWebhook()
  const testWebhook = useTestWebhook()
  const regenerateSecret = useRegenerateWebhookSecret()
  const prefetchWebhook = usePrefetchWebhook()

  return {
    // Queries
    webhooks,
    webhookEvents,
    isLoading: webhooks.isLoading || webhookEvents.isLoading,
    error: webhooks.error || webhookEvents.error,

    // Mutations
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
    regenerateSecret,

    // Utilities
    prefetchWebhook,

    // Mutation states
    isCreating: createWebhook.isPending,
    isUpdating: updateWebhook.isPending,
    isDeleting: deleteWebhook.isPending,
    isToggling: toggleWebhook.isPending,
    isTesting: testWebhook.isPending,
    isRegenerating: regenerateSecret.isPending,
  }
}

/**
 * Combined hook for webhook delivery monitoring
 */
export function useWebhookDeliveryMonitoring(webhookId: string) {
  const deliveries = useWebhookDeliveries(webhookId)
  const retryDelivery = useRetryWebhookDelivery()

  return {
    deliveries,
    isLoading: deliveries.isLoading,
    error: deliveries.error,

    // Mutations
    retryDelivery,

    // Mutation states
    isRetrying: retryDelivery.isPending,
  }
}
