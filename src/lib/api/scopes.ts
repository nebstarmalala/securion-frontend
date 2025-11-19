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
    // API client already throws errors for failed requests
    // Paginated responses return { data: [], links: {...}, meta: {...} } directly
    return await apiClient.get<PaginatedResponse<ApiScope>>("/scopes", params)
  }

  /**
   * Get single scope by ID
   */
  async getScope(scopeId: string): Promise<ApiScope> {
    const response = await apiClient.get<ApiResponse<ApiScope>>(`/scopes/${scopeId}`)
    return response.data
  }

  /**
   * Create new scope
   */
  async createScope(data: CreateScopeInput): Promise<ApiScope> {
    const response = await apiClient.post<ApiResponse<ApiScope>>("/scopes", data)
    return response.data
  }

  /**
   * Create multiple scopes at once
   */
  async bulkCreateScopes(data: BulkCreateScopesInput): Promise<ApiScope[]> {
    const response = await apiClient.post<ApiResponse<ApiScope[]>>("/scopes/bulk", data)
    return response.data
  }

  /**
   * Update existing scope
   */
  async updateScope(scopeId: string, data: UpdateScopeInput): Promise<ApiScope> {
    const response = await apiClient.put<ApiResponse<ApiScope>>(`/scopes/${scopeId}`, data)
    return response.data
  }

  /**
   * Delete scope
   */
  async deleteScope(scopeId: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/scopes/${scopeId}`)
    // API client throws error if request fails, so if we reach here, it succeeded
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

  /**
   * Get scope activities
   */
  async getScopeActivities(scopeId: string, params?: ListQueryParams): Promise<PaginatedResponse<any>> {
    return await apiClient.get<PaginatedResponse<any>>(`/scopes/${scopeId}/activities`, params)
  }

  // Convenience aliases for hook compatibility
  list = this.getScopes.bind(this)
  get = this.getScope.bind(this)
  create = this.createScope.bind(this)
  bulkCreate = this.bulkCreateScopes.bind(this)
  update = this.updateScope.bind(this)
  delete = this.deleteScope.bind(this)
  getActivities = this.getScopeActivities.bind(this)
}

// Export singleton instance
export const scopesService = new ScopesService()
