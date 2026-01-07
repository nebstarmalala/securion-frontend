/**
 * Dashboard Context
 *
 * Centralized state management for dashboard filters and interactivity.
 * Allows all widgets, charts, and components to share filter state.
 */

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'

// Types
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical'
export type Status = 'open' | 'confirmed' | 'false-positive' | 'fixed' | 'accepted'
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived'

export interface DateRange {
  start: Date
  end: Date
}

export interface DashboardFilters {
  dateRange: DateRange
  severities: Set<Severity>
  statuses: Set<Status>
  projectIds: string[]
  searchQuery: string
}

export interface DashboardContextValue {
  // Filter state
  filters: DashboardFilters

  // Filter actions
  setDateRange: (dateRange: DateRange) => void
  toggleSeverity: (severity: Severity) => void
  toggleStatus: (status: Status) => void
  setProjectIds: (projectIds: string[]) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void

  // Helper states
  isFiltering: boolean
  activeFilterCount: number
}

// Default date range: Last 30 days
const getDefaultDateRange = (): DateRange => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return { start, end }
}

const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: getDefaultDateRange(),
  severities: new Set<Severity>(),
  statuses: new Set<Status>(),
  projectIds: [],
  searchQuery: '',
}

// Create context
const DashboardContext = createContext<DashboardContextValue | undefined>(undefined)

// Provider component
interface DashboardProviderProps {
  children: ReactNode
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)

  // Date range setter
  const setDateRange = useCallback((dateRange: DateRange) => {
    setFilters(prev => ({ ...prev, dateRange }))
  }, [])

  // Toggle severity filter
  const toggleSeverity = useCallback((severity: Severity) => {
    setFilters(prev => {
      const severities = new Set(prev.severities)
      if (severities.has(severity)) {
        severities.delete(severity)
      } else {
        severities.add(severity)
      }
      return { ...prev, severities }
    })
  }, [])

  // Toggle status filter
  const toggleStatus = useCallback((status: Status) => {
    setFilters(prev => {
      const statuses = new Set(prev.statuses)
      if (statuses.has(status)) {
        statuses.delete(status)
      } else {
        statuses.add(status)
      }
      return { ...prev, statuses }
    })
  }, [])

  // Project IDs setter
  const setProjectIds = useCallback((projectIds: string[]) => {
    setFilters(prev => ({ ...prev, projectIds }))
  }, [])

  // Search query setter
  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // Check if currently filtering
  const isFiltering = useMemo(() => {
    return (
      filters.severities.size > 0 ||
      filters.statuses.size > 0 ||
      filters.projectIds.length > 0 ||
      filters.searchQuery.length > 0
    )
  }, [filters])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return (
      filters.severities.size +
      filters.statuses.size +
      (filters.projectIds.length > 0 ? 1 : 0) +
      (filters.searchQuery.length > 0 ? 1 : 0)
    )
  }, [filters])

  const value: DashboardContextValue = {
    filters,
    setDateRange,
    toggleSeverity,
    toggleStatus,
    setProjectIds,
    setSearchQuery,
    clearFilters,
    isFiltering,
    activeFilterCount,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

// Custom hook to use dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

// Date range preset helpers
export const DATE_RANGE_PRESETS = {
  today: () => {
    const today = new Date()
    return { start: new Date(today.setHours(0, 0, 0, 0)), end: new Date() }
  },
  yesterday: () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return { start: new Date(yesterday.setHours(0, 0, 0, 0)), end: new Date(yesterday.setHours(23, 59, 59, 999)) }
  },
  last7Days: () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    return { start, end }
  },
  last30Days: () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    return { start, end }
  },
  last90Days: () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 90)
    return { start, end }
  },
  thisMonth: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start, end: new Date() }
  },
  lastMonth: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    return { start, end }
  },
} as const

// Severity and status constants
export const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info']
export const STATUSES: Status[] = ['open', 'confirmed', 'false-positive', 'fixed', 'accepted']
export const PROJECT_STATUSES: ProjectStatus[] = ['planning', 'active', 'on-hold', 'completed', 'archived']

// Color mapping for consistent styling
export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'rose',
  high: 'orange',
  medium: 'amber',
  low: 'blue',
  info: 'gray',
}

export const STATUS_COLORS: Record<Status, string> = {
  open: 'rose',
  confirmed: 'orange',
  'false-positive': 'gray',
  fixed: 'emerald',
  accepted: 'blue',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'blue',
  active: 'emerald',
  'on-hold': 'amber',
  completed: 'green',
  archived: 'gray',
}
