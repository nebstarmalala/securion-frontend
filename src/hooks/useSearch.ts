import { useQuery } from "@tanstack/react-query"
import { searchService } from "@/lib/api"
import type {
  SearchResult,
  SearchSuggestion,
  QuickFilter,
  SearchByTypeResult,
  SearchByTypeParams
} from "@/lib/types/api"

export function useSearch(query: string | undefined, params?: { page?: number; per_page?: number }) {
  return useQuery<SearchResult>({
    queryKey: ["search", query, params],
    queryFn: () => searchService.search(query!, params),
    enabled: !!query && query.length >= 2,
  })
}

export function useSearchSuggestions(query: string | undefined, limit?: number) {
  return useQuery<SearchSuggestion[]>({
    queryKey: ["search", "suggestions", query, limit],
    queryFn: () => searchService.suggestions(query!, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useQuickFilters() {
  return useQuery<QuickFilter[]>({
    queryKey: ["search", "quick-filters"],
    queryFn: () => searchService.getQuickFilters(),
    staleTime: Infinity, // Quick filters rarely change
  })
}

export function useExecuteQuickFilter(filterName: string | undefined, params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ["search", "quick-filters", filterName, params],
    queryFn: () => searchService.executeQuickFilter(filterName!, params),
    enabled: !!filterName,
  })
}

export function useSearchByType(
  type: "projects" | "findings" | "scopes" | "cves" | undefined,
  query: string | undefined,
  params?: SearchByTypeParams
) {
  return useQuery<SearchByTypeResult>({
    queryKey: ["search", type, query, params],
    queryFn: () => searchService.searchByType(type!, query!, params),
    enabled: !!type && !!query && query.length >= 2,
  })
}
