/**
 * Webhooks API Service
 *
 * Handles all webhook management operations including
 * webhook CRUD, delivery tracking, testing, and secret management.
 */

import { apiClient, type ApiResponse, type PaginatedResponse } from "./client"
import type {
  Webhook,
  WebhookDelivery,
  WebhookEvent,
  CreateWebhookInput,
  UpdateWebhookInput,
  ListQueryParams,
} from "../types"

// ============================================================================
// Types
// ============================================================================

export interface WebhookFilters extends ListQueryParams {
  is_active?: boolean
  event?: string
  created_by?: string
}

export interface WebhookDeliveryFilters extends ListQueryParams {
  webhook_id?: string
  status?: "pending" | "success" | "failed"
  event?: string
  date_from?: string
  date_to?: string
}

export interface TestWebhookResult {
  success: boolean
  response_code: number
  response_body?: string
  error?: string
  duration_ms: number
}

// ============================================================================
// Webhooks Service
// ============================================================================

class WebhooksService {
  // --------------------------------------------------------------------------
  // Webhook CRUD
  // --------------------------------------------------------------------------

  /**
   * Get paginated list of webhooks
   * GET /webhooks
   */
  async getWebhooks(params?: WebhookFilters): Promise<PaginatedResponse<Webhook>> {
    return await apiClient.get<PaginatedResponse<Webhook>>("/webhooks", params)
  }

  /**
   * Get a single webhook by ID
   * GET /webhooks/{webhook}
   */
  async getWebhook(webhookId: string): Promise<Webhook> {
    const response = await apiClient.get<ApiResponse<Webhook>>(`/webhooks/${webhookId}`)
    return response.data
  }

  /**
   * Create a new webhook
   * POST /webhooks
   */
  async createWebhook(data: CreateWebhookInput): Promise<Webhook> {
    const response = await apiClient.post<ApiResponse<Webhook>>("/webhooks", data)
    return response.data
  }

  /**
   * Update an existing webhook
   * PUT /webhooks/{webhook}
   */
  async updateWebhook(webhookId: string, data: UpdateWebhookInput): Promise<Webhook> {
    const response = await apiClient.put<ApiResponse<Webhook>>(`/webhooks/${webhookId}`, data)
    return response.data
  }

  /**
   * Delete a webhook
   * DELETE /webhooks/{webhook}
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await apiClient.delete(`/webhooks/${webhookId}`)
  }

  // --------------------------------------------------------------------------
  // Webhook Actions
  // --------------------------------------------------------------------------

  /**
   * Get available webhook events
   * GET /webhooks/events
   */
  async getAvailableEvents(): Promise<WebhookEvent[]> {
    const response = await apiClient.get<ApiResponse<WebhookEvent[]>>("/webhooks/events")
    return response.data
  }

  /**
   * Toggle webhook active status (enable/disable)
   * POST /webhooks/{webhook}/toggle
   */
  async toggleWebhook(webhookId: string): Promise<Webhook> {
    const response = await apiClient.post<ApiResponse<Webhook>>(
      `/webhooks/${webhookId}/toggle`
    )
    return response.data
  }

  /**
   * Test webhook delivery
   * POST /webhooks/{webhook}/test
   */
  async testWebhook(webhookId: string): Promise<TestWebhookResult> {
    const response = await apiClient.post<ApiResponse<TestWebhookResult>>(
      `/webhooks/${webhookId}/test`
    )
    return response.data
  }

  /**
   * Regenerate webhook secret
   * POST /webhooks/{webhook}/regenerate-secret
   */
  async regenerateSecret(webhookId: string): Promise<{ secret: string }> {
    const response = await apiClient.post<ApiResponse<{ secret: string }>>(
      `/webhooks/${webhookId}/regenerate-secret`
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Webhook Deliveries
  // --------------------------------------------------------------------------

  /**
   * Get delivery history for a specific webhook
   * GET /webhooks/{webhook}/deliveries
   */
  async getWebhookDeliveries(
    webhookId: string,
    params?: WebhookDeliveryFilters
  ): Promise<PaginatedResponse<WebhookDelivery>> {
    return await apiClient.get<PaginatedResponse<WebhookDelivery>>(
      `/webhooks/${webhookId}/deliveries`,
      params
    )
  }

  /**
   * Get a single delivery by ID
   * GET /webhooks/deliveries/{delivery}
   */
  async getDelivery(deliveryId: string): Promise<WebhookDelivery> {
    const response = await apiClient.get<ApiResponse<WebhookDelivery>>(
      `/webhooks/deliveries/${deliveryId}`
    )
    return response.data
  }

  /**
   * Retry a failed delivery
   * POST /webhooks/deliveries/{delivery}/retry
   */
  async retryDelivery(deliveryId: string): Promise<WebhookDelivery> {
    const response = await apiClient.post<ApiResponse<WebhookDelivery>>(
      `/webhooks/deliveries/${deliveryId}/retry`
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Convenience Aliases (for React Query compatibility)
  // --------------------------------------------------------------------------

  list = this.getWebhooks.bind(this)
  get = this.getWebhook.bind(this)
  create = this.createWebhook.bind(this)
  update = this.updateWebhook.bind(this)
  delete = this.deleteWebhook.bind(this)
  getEvents = this.getAvailableEvents.bind(this)
  toggle = this.toggleWebhook.bind(this)
  test = this.testWebhook.bind(this)
  regenerate = this.regenerateSecret.bind(this)
  getDeliveries = this.getWebhookDeliveries.bind(this)
  retry = this.retryDelivery.bind(this)
}

// Export singleton instance
export const webhooksService = new WebhooksService()
