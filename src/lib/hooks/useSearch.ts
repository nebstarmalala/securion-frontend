/**
 * Search React Query Hooks
 * Comprehensive hooks for global search, type-specific search, and autocomplete
 *
 * Features:
 * - Debounced search queries for performance
 * - Real-time autocomplete suggestions
 * - Search history management
 * - Quick filters
 * - Type-specific search with filters
 * - Optimized caching and prefetching
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { searchService } from "@/lib/api/search"
import type { SearchParams, GlobalSearchResponse, SearchSuggestion, QuickFilter } from "@/lib/api/search"
import { toast } from "sonner"
import { handleError } from "@/lib/errors"
import { useEffect, useState, useMemo, useCallback } from "react"

/**
 * Query Keys Factory
 * Centralized query key management for search operations
 */
export const searchKeys = {
  all: ["search"] as const,
  global: () => [...searchKeys.all, "global"] as const,
  globalQuery: (params: SearchParams) => [...searchKeys.global(), params] as const,
  type: (type: string) => [...searchKeys.all, "type", type] as const,
  typeQuery: (type: string, params: SearchParams) => [...searchKeys.type(type), params] as const,
  suggestions: () => [...searchKeys.all, "suggestions"] as const,
  suggestionsQuery: (query: string) => [...searchKeys.suggestions(), query] as const,
  quickFilters: () => [...searchKeys.all, "quick-filters"] as const,
  quickFilterExecution: (filterName: string) => [...searchKeys.quickFilters(), filterName] as const,
  history: () => [...searchKeys.all, "history"] as const,
}

/**
 * Debounce hook for search input
 * Delays the execution of search queries until user stops typing
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Global Search Hook
 * Search across all entity types (projects, findings, scopes, CVEs)
 *
 * @param params - Search parameters including query string and filters
 * @param options - React Query options
 * @returns Global search results with metadata
 *
 * @example
 * const { data, isLoading } = useGlobalSearch({ q: "SQL injection", page: 1 })
 */
export function useGlobalSearch(
  params: SearchParams,
  options?: Omit<UseQueryOptions<GlobalSearchResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: searchKeys.globalQuery(params),
    queryFn: () => searchService.globalSearch(params),
    enabled: !!params.q && params.q.trim().length >= 2, // Require at least 2 characters
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

/**
 * Debounced Global Search Hook
 * Automatically debounces search queries for better UX
 *
 * @param query - Search query string
 * @param additionalParams - Additional search parameters
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Debounced global search results
 *
 * @example
 * const { data, isLoading } = useDebouncedGlobalSearch(searchInput, { page: 1 })
 */
export function useDebouncedGlobalSearch(
  query: string,
  additionalParams?: Omit<SearchParams, "q">,
  debounceMs: number = 300
) {
  const debouncedQuery = useDebounce(query, debounceMs)

  const params: SearchParams = useMemo(
    () => ({
      q: debouncedQuery,
      ...additionalParams,
    }),
    [debouncedQuery, additionalParams]
  )

  return useGlobalSearch(params, {
    enabled: debouncedQuery.length >= 2, // Require at least 2 characters
  })
}

/**
 * Type-Specific Search Hook
 * Search within a specific entity type with advanced filters
 *
 * @param type - Entity type to search
 * @param params - Search parameters
 * @param options - React Query options
 * @returns Type-specific search results
 *
 * @example
 * const { data } = useSearchByType("findings", {
 *   q: "XSS",
 *   severity: "critical",
 *   status: "open"
 * })
 */
export function useSearchByType(
  type: "projects" | "findings" | "scopes" | "cves",
  params: SearchParams,
  options?: Omit<UseQueryOptions<any>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: searchKeys.typeQuery(type, params),
    queryFn: () => searchService.searchByType(type, params),
    enabled: !!params.q && params.q.trim().length >= 2, // Require at least 2 characters
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  })
}

/**
 * Debounced Type-Specific Search Hook
 * Type-specific search with automatic debouncing
 *
 * @param type - Entity type to search
 * @param query - Search query string
 * @param additionalParams - Additional search parameters
 * @param debounceMs - Debounce delay in milliseconds
 * @returns Debounced type-specific search results
 */
export function useDebouncedSearchByType(
  type: "projects" | "findings" | "scopes" | "cves",
  query: string,
  additionalParams?: Omit<SearchParams, "q">,
  debounceMs: number = 300
) {
  const debouncedQuery = useDebounce(query, debounceMs)

  const params: SearchParams = useMemo(
    () => ({
      q: debouncedQuery,
      ...additionalParams,
    }),
    [debouncedQuery, additionalParams]
  )

  return useSearchByType(type, params, {
    enabled: debouncedQuery.length >= 2,
  })
}

/**
 * Search Suggestions Hook (Autocomplete)
 * Get real-time autocomplete suggestions as user types
 *
 * @param query - Current search query
 * @param limit - Maximum number of suggestions
 * @param debounceMs - Debounce delay in milliseconds
 * @returns Autocomplete suggestions
 *
 * @example
 * const { data: suggestions } = useSearchSuggestions(searchInput, 10)
 */
export function useSearchSuggestions(
  query: string,
  limit: number = 10,
  debounceMs: number = 200
) {
  const debouncedQuery = useDebounce(query, debounceMs)

  return useQuery({
    queryKey: searchKeys.suggestionsQuery(debouncedQuery),
    queryFn: () => searchService.getSuggestions(debouncedQuery, limit),
    enabled: !!debouncedQuery && debouncedQuery.trim().length >= 2, // Require at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes (suggestions change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Quick Filters Hook
 * Get list of available quick filters
 *
 * @returns List of quick filters
 *
 * @example
 * const { data: filters } = useQuickFilters()
 */
export function useQuickFilters() {
  return useQuery({
    queryKey: searchKeys.quickFilters(),
    queryFn: () => searchService.getQuickFilters(),
    staleTime: 60 * 60 * 1000, // 1 hour (filters rarely change)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

/**
 * Execute Quick Filter Hook
 * Execute a predefined quick filter
 *
 * @param filterName - Name of the quick filter to execute
 * @param page - Page number
 * @param perPage - Items per page
 * @returns Quick filter results
 *
 * @example
 * const { data } = useExecuteQuickFilter("critical-findings", 1, 20)
 */
export function useExecuteQuickFilter(
  filterName: string,
  page?: number,
  perPage?: number
) {
  return useQuery({
    queryKey: searchKeys.quickFilterExecution(filterName),
    queryFn: () => searchService.executeQuickFilter(filterName, page, perPage),
    enabled: !!filterName,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Search History Hook
 * Manage local search history in localStorage
 *
 * @param maxHistory - Maximum number of history items to keep
 * @returns Search history with add/clear methods
 *
 * @example
 * const { history, addToHistory, clearHistory } = useSearchHistory()
 */
export function useSearchHistory(maxHistory: number = 10) {
  const STORAGE_KEY = "securion_search_history"

  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const addToHistory = useCallback(
    (query: string) => {
      if (!query || query.trim().length < 2) return

      setHistory((prev) => {
        // Remove duplicates and add to front
        const filtered = prev.filter((item) => item !== query)
        const updated = [query, ...filtered].slice(0, maxHistory)

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
          // Silently fail if localStorage is not available
        }

        return updated
      })
    },
    [maxHistory]
  )

  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }, [])

  const removeFromHistory = useCallback((query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item !== query)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        // Silently fail if localStorage is not available
      }
      return updated
    })
  }, [])

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  }
}

/**
 * Prefetch Search Results
 * Prefetch search results for better UX (e.g., on hover)
 *
 * @returns Prefetch function
 *
 * @example
 * const prefetchSearch = usePrefetchSearch()
 * prefetchSearch({ q: "SQL injection" })
 */
export function usePrefetchSearch() {
  const queryClient = useQueryClient()

  return useCallback(
    (params: SearchParams) => {
      queryClient.prefetchQuery({
        queryKey: searchKeys.globalQuery(params),
        queryFn: () => searchService.globalSearch(params),
        staleTime: 5 * 60 * 1000,
      })
    },
    [queryClient]
  )
}

/**
 * Combined Search Hook
 * All-in-one hook for search functionality with debouncing, suggestions, and history
 *
 * @param query - Search query string
 * @param options - Configuration options
 * @returns Combined search state and helpers
 *
 * @example
 * const {
 *   results,
 *   suggestions,
 *   history,
 *   isLoading,
 *   addToHistory
 * } = useCombinedSearch(searchInput, { debounceMs: 300 })
 */
export function useCombinedSearch(
  query: string,
  options?: {
    debounceMs?: number
    types?: ("projects" | "findings" | "scopes" | "cves")[]
    additionalParams?: Omit<SearchParams, "q">
  }
) {
  const { debounceMs = 300, additionalParams } = options || {}

  // Main search results
  const searchResults = useDebouncedGlobalSearch(query, additionalParams, debounceMs)

  // Autocomplete suggestions
  const suggestions = useSearchSuggestions(query, 10, 200)

  // Search history
  const searchHistory = useSearchHistory()

  return {
    // Search results
    results: searchResults.data,
    isLoading: searchResults.isLoading,
    isError: searchResults.isError,
    error: searchResults.error,

    // Suggestions
    suggestions: suggestions.data || [],
    suggestionsLoading: suggestions.isLoading,

    // History
    history: searchHistory.history,
    addToHistory: searchHistory.addToHistory,
    clearHistory: searchHistory.clearHistory,
    removeFromHistory: searchHistory.removeFromHistory,

    // Utilities
    refetch: searchResults.refetch,
  }
}
