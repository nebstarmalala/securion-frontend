import { apiClient } from './client'

/**
 * Search-related Types
 */

export interface SearchItem {
  id: string
  type: string
  title: string
  description: string
  metadata: Record<string, any>
  score: number
  url: string
}

export interface SearchResult {
  projects: SearchItem[]
  findings: SearchItem[]
  scopes: SearchItem[]
  cves: SearchItem[]
}

export interface SearchMeta {
  total_results: number
  results_by_type: {
    projects: number
    findings: number
    scopes: number
    cves: number
  }
  query: string
  search_time: string
}

export interface GlobalSearchResponse {
  data: SearchResult
  meta: SearchMeta
}

export interface SearchSuggestion {
  value: string
  type: string
  id: string
}

export interface QuickFilter {
  name: string
  label: string
  description: string
  entity_type: string
}

export interface SearchParams {
  q: string
  page?: number
  per_page?: number
  // Type-specific filters
  severity?: string
  status?: string
  [key: string]: any
}

/**
 * Search Service
 *
 * Provides search functionality across all entities
 */
class SearchService {
  /**
   * Global search across all entities
   * GET /api/search?q={query}
   */
  async globalSearch(params: SearchParams): Promise<GlobalSearchResponse> {
    // Validate query parameter
    if (!params.q || params.q.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long')
    }

    const response = await apiClient.get<GlobalSearchResponse>('/search', { params })
    return response.data
  }

  /**
   * Get search suggestions for autocomplete
   * GET /api/search/suggestions?q={query}&limit={10}
   */
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    // Validate query parameter
    if (!query || query.trim().length < 2) {
      return [] // Return empty array for short queries instead of making API call
    }

    const response = await apiClient.get<{ data: SearchSuggestion[] }>('/search/suggestions', {
      params: { q: query, limit }
    })
    return response.data.data
  }

  /**
   * Get available quick filters
   * GET /api/search/quick-filters
   */
  async getQuickFilters(): Promise<QuickFilter[]> {
    const response = await apiClient.get<{ data: QuickFilter[] }>('/search/quick-filters')
    return response.data.data
  }

  /**
   * Execute a quick filter
   * GET /api/search/quick-filters/{filterName}
   */
  async executeQuickFilter(
    filterName: string,
    page?: number,
    perPage?: number
  ): Promise<{ data: any[]; meta: { filter_name: string; total: number } }> {
    const response = await apiClient.get(`/search/quick-filters/${filterName}`, {
      params: { page, per_page: perPage }
    })
    return response.data
  }

  /**
   * Search specific entity type
   * GET /api/search/{type}?q={query}
   */
  async searchByType(
    type: 'projects' | 'findings' | 'scopes' | 'cves',
    params: SearchParams
  ): Promise<{
    data: SearchItem[]
    meta: {
      type: string
      total: number
      query: string
      search_time: string
    }
  }> {
    // Validate query parameter
    if (!params.q || params.q.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long')
    }

    const response = await apiClient.get(`/search/${type}`, { params })
    return response.data
  }

  /**
   * Search projects
   */
  async searchProjects(params: SearchParams) {
    return this.searchByType('projects', params)
  }

  /**
   * Search findings
   */
  async searchFindings(params: SearchParams) {
    return this.searchByType('findings', params)
  }

  /**
   * Search scopes
   */
  async searchScopes(params: SearchParams) {
    return this.searchByType('scopes', params)
  }

  /**
   * Search CVEs
   */
  async searchCVEs(params: SearchParams) {
    return this.searchByType('cves', params)
  }
}

export const searchService = new SearchService()
