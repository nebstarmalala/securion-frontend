/**
 * Search Components
 * Centralized exports for all search-related components
 * Phase 5: Search & Discovery
 */

// Existing components
export { GlobalSearch } from '../global-search'
export { SavedSearches } from '../saved-searches'
export { QuickFilters as LegacyQuickFilters, CompactQuickFilters, FilterChip } from '../quick-filters'
export { AdvancedFilters } from '../advanced-filters'

export type { FilterChipProps } from '../quick-filters'
export type { QuickFiltersProps } from '../quick-filters'
export type { AdvancedFiltersProps } from '../advanced-filters'

// Phase 5: New search components
export {
  SearchTypeFilter,
  SearchAdvancedFilters,
  ActiveFilterBadges,
  type SearchType,
  type SearchFilterValues,
} from "./SearchFilters"

export {
  QuickFilters,
  useQuickFilterState,
  FINDING_QUICK_FILTERS,
  PROJECT_QUICK_FILTERS,
  CVE_QUICK_FILTERS,
  REPORT_QUICK_FILTERS,
  type QuickFilter,
} from "./QuickFilters"

export {
  SavedFilters,
  useSavedFilters,
  type SavedFilter,
} from "./SavedFilters"

export {
  SearchResultPreview,
  SearchResultsGrid,
} from "./SearchResultPreview"
