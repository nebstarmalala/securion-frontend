/**
 * Saved Searches API Service
 * Handles all saved search management API operations
 *
 * Features:
 * - Save complex search queries with filters
 * - Public/private saved searches
 * - Use count tracking
 * - Filter by entity type
 */

import { apiClient, type ApiResponse, type PaginatedApiResponse } from "./client"
import type {
  SavedSearch,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
  PaginatedData,
  QueryParams,
} from "@/lib/types/api"

class SavedSearchesService {
  /**
   * Get all saved searches
   * GET /saved-searches
   *
   * Query Parameters:
   * - page: Page number
   * - per_page: Items per page
   * - entity_type: Filter by entity type
   * - is_public: Filter by public/private
   *
   * @param params - Query parameters
   * @returns Paginated list of saved searches
   */
  async list(params?: QueryParams): Promise<PaginatedData<SavedSearch>> {
    const response = await apiClient.get<PaginatedApiResponse<SavedSearch>>(
      "/saved-searches",
      params
    )
    return response
  }

  /**
   * Get single saved search
   * GET /saved-searches/{savedSearch}
   *
   * @param savedSearchId - Saved search ID
   * @returns Saved search details
   */
  async get(savedSearchId: string): Promise<SavedSearch> {
    const response = await apiClient.get<ApiResponse<SavedSearch>>(
      `/saved-searches/${savedSearchId}`
    )
    return response.data
  }

  /**
   * Create new saved search
   * POST /saved-searches
   *
   * @param data - Saved search creation data
   * @returns Created saved search
   */
  async create(data: CreateSavedSearchInput): Promise<SavedSearch> {
    const response = await apiClient.post<ApiResponse<SavedSearch>>("/saved-searches", data)
    return response.data
  }

  /**
   * Update existing saved search
   * PUT /saved-searches/{savedSearch}
   *
   * @param savedSearchId - Saved search ID
   * @param data - Updated data
   * @returns Updated saved search
   */
  async update(savedSearchId: string, data: UpdateSavedSearchInput): Promise<SavedSearch> {
    const response = await apiClient.put<ApiResponse<SavedSearch>>(
      `/saved-searches/${savedSearchId}`,
      data
    )
    return response.data
  }

  /**
   * Delete saved search
   * DELETE /saved-searches/{savedSearch}
   *
   * @param savedSearchId - Saved search ID
   */
  async delete(savedSearchId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/saved-searches/${savedSearchId}`)
  }

  /**
   * Execute saved search
   * POST /saved-searches/{savedSearch}/execute
   *
   * @param savedSearchId - Saved search ID
   * @param additionalParams - Additional query parameters
   * @returns Search results
   */
  async execute(
    savedSearchId: string,
    additionalParams?: QueryParams
  ): Promise<{
    data: any[]
    meta: {
      saved_search_id: string
      total: number
      use_count: number
    }
  }> {
    const response = await apiClient.post<{
      data: any[]
      meta: {
        saved_search_id: string
        total: number
        use_count: number
      }
    }>(`/saved-searches/${savedSearchId}/execute`, additionalParams)
    return response
  }

  /**
   * Get public saved searches
   * Convenience method for public searches
   *
   * @param params - Query parameters
   * @returns List of public saved searches
   */
  async getPublicSearches(params?: QueryParams): Promise<PaginatedData<SavedSearch>> {
    return this.list({ ...params, is_public: true })
  }

  /**
   * Get my saved searches
   * Convenience method for user's own searches
   *
   * @param params - Query parameters
   * @returns List of user's saved searches
   */
  async getMySearches(params?: QueryParams): Promise<PaginatedData<SavedSearch>> {
    return this.list({ ...params, is_public: false })
  }

  /**
   * Get saved searches by entity type
   * Convenience method for filtering by entity type
   *
   * @param entityType - Entity type (projects, findings, scopes, cves)
   * @param params - Query parameters
   * @returns List of saved searches for entity type
   */
  async getByEntityType(
    entityType: string,
    params?: QueryParams
  ): Promise<PaginatedData<SavedSearch>> {
    return this.list({ ...params, entity_type: entityType })
  }

  /**
   * Get most used saved searches
   * Convenience method for popular searches
   *
   * @param limit - Number of searches to return
   * @returns List of most used saved searches
   */
  async getMostUsed(limit: number = 10): Promise<SavedSearch[]> {
    const response = await this.list({ per_page: limit, sort_by: "use_count", sort_order: "desc" })
    return response.data
  }
}

// Export singleton instance
export const savedSearchesService = new SavedSearchesService()
