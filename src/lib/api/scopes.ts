/**
 * Scopes API Service
 * Handles all scope-related API operations
 */

import { apiClient, type ApiResponse, type PaginatedResponse } from "./client"
import type {
  ApiScope,
  CreateScopeInput,
  UpdateScopeInput,
  BulkCreateScopesInput,
  ListQueryParams,
} from "@/lib/types/api"

class ScopesService {
  /**
   * Get all scopes with optional filtering
   */
  async getScopes(params?: ListQueryParams): Promise<PaginatedResponse<ApiScope>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ApiScope>>>("/scopes", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to fetch scopes")
  }

  /**
   * Get single scope by ID
   */
  async getScope(scopeId: string): Promise<ApiScope> {
    const response = await apiClient.get<ApiResponse<ApiScope>>(`/scopes/${scopeId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to fetch scope")
  }

  /**
   * Create new scope
   */
  async createScope(data: CreateScopeInput): Promise<ApiScope> {
    const response = await apiClient.post<ApiResponse<ApiScope>>("/scopes", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create scope")
  }

  /**
   * Create multiple scopes at once
   */
  async bulkCreateScopes(data: BulkCreateScopesInput): Promise<ApiScope[]> {
    const response = await apiClient.post<ApiResponse<ApiScope[]>>("/scopes/bulk", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create scopes")
  }

  /**
   * Update existing scope
   */
  async updateScope(scopeId: string, data: UpdateScopeInput): Promise<ApiScope> {
    const response = await apiClient.put<ApiResponse<ApiScope>>(`/scopes/${scopeId}`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update scope")
  }

  /**
   * Delete scope
   */
  async deleteScope(scopeId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(`/scopes/${scopeId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to delete scope")
    }
  }

  /**
   * Get scopes for a specific project
   */
  async getProjectScopes(projectId: string): Promise<ApiScope[]> {
    const response = await this.getScopes({
      search: projectId,
      searchColumn: "project_id",
    })
    return response.data
  }

  /**
   * Get in-scope items only
   */
  async getInScopeItems(projectId?: string): Promise<ApiScope[]> {
    const params: ListQueryParams = {
      search: "in-scope",
      searchColumn: "status",
    }

    const response = await this.getScopes(params)
    let scopes = response.data

    // Filter by project if specified
    if (projectId) {
      scopes = scopes.filter((s) => s.project_id === projectId)
    }

    return scopes
  }
}

// Export singleton instance
export const scopesService = new ScopesService()
