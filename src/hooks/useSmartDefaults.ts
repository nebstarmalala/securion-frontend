/**
 * Smart Defaults Hook
 *
 * Provides intelligent default values for forms based on:
 * - User preferences stored in localStorage
 * - Recent usage patterns
 * - Current context (project, scope, etc.)
 * - Role-based defaults
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

// ============================================================================
// Types
// ============================================================================

export type EntityType = "project" | "scope" | "finding" | "report"

export interface ProjectDefaults {
  status: string
  testType: string
  tags: string[]
}

export interface ScopeDefaults {
  type: string
  status: string
  protocol: string
  port?: number
}

export interface FindingDefaults {
  severity: string
  status: string
  vulnerability_type: string
}

export interface ReportDefaults {
  format: string
  type: string
  include_executive_summary: boolean
  include_technical_details: boolean
  include_remediation: boolean
}

export interface SmartDefaultsConfig {
  project?: Partial<ProjectDefaults>
  scope?: Partial<ScopeDefaults>
  finding?: Partial<FindingDefaults>
  report?: Partial<ReportDefaults>
}

interface UserPreferences {
  lastUsed: {
    project: Partial<ProjectDefaults>
    scope: Partial<ScopeDefaults>
    finding: Partial<FindingDefaults>
    report: Partial<ReportDefaults>
  }
  favorites: {
    tags: string[]
    vulnerabilityTypes: string[]
  }
  history: {
    recentProjects: string[]
    recentClients: string[]
  }
}

const STORAGE_KEY = "securion_smart_defaults"

// ============================================================================
// Default System Values
// ============================================================================

const SYSTEM_DEFAULTS: SmartDefaultsConfig = {
  project: {
    status: "planning",
    testType: "black-box",
    tags: [],
  },
  scope: {
    type: "domain",
    status: "in-scope",
    protocol: "https",
    port: 443,
  },
  finding: {
    severity: "medium",
    status: "open",
    vulnerability_type: "other",
  },
  report: {
    format: "pdf",
    type: "technical",
    include_executive_summary: true,
    include_technical_details: true,
    include_remediation: true,
  },
}

// Role-based default overrides
const ROLE_DEFAULTS: Record<string, Partial<SmartDefaultsConfig>> = {
  admin: {
    report: {
      type: "executive",
      include_executive_summary: true,
    },
  },
  manager: {
    report: {
      type: "executive",
      include_executive_summary: true,
    },
  },
  tester: {
    report: {
      type: "technical",
      include_technical_details: true,
    },
  },
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSmartDefaults() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)

  // Load preferences from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPreferences(JSON.parse(stored))
      } else {
        // Initialize with empty preferences
        const initial: UserPreferences = {
          lastUsed: {
            project: {},
            scope: {},
            finding: {},
            report: {},
          },
          favorites: {
            tags: [],
            vulnerabilityTypes: [],
          },
          history: {
            recentProjects: [],
            recentClients: [],
          },
        }
        setPreferences(initial)
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Save preferences to storage
  const savePreferences = useCallback((newPrefs: UserPreferences) => {
    setPreferences(newPrefs)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Get defaults for a specific entity type
  const getDefaults = useCallback(
    <T extends EntityType>(
      entityType: T,
      context?: { projectId?: string; scopeId?: string }
    ): SmartDefaultsConfig[T] => {
      // Start with system defaults
      const systemDefaults = { ...SYSTEM_DEFAULTS[entityType] }

      // Apply role-based defaults
      const userRole = user?.role || "tester"
      const roleDefaults = ROLE_DEFAULTS[userRole]?.[entityType] || {}

      // Apply user's last used values
      const lastUsed = preferences?.lastUsed[entityType] || {}

      // Merge in order: system < role < lastUsed
      return {
        ...systemDefaults,
        ...roleDefaults,
        ...lastUsed,
      } as SmartDefaultsConfig[T]
    },
    [user, preferences]
  )

  // Record usage for learning
  const recordUsage = useCallback(
    <T extends EntityType>(entityType: T, values: Partial<SmartDefaultsConfig[T]>) => {
      if (!preferences) return

      const newPrefs: UserPreferences = {
        ...preferences,
        lastUsed: {
          ...preferences.lastUsed,
          [entityType]: {
            ...preferences.lastUsed[entityType],
            ...values,
          },
        },
      }

      // Track tags in favorites
      if (entityType === "project" && (values as any).tags) {
        const tags = (values as any).tags as string[]
        const existingTags = new Set(preferences.favorites.tags)
        tags.forEach((tag) => existingTags.add(tag))
        newPrefs.favorites.tags = Array.from(existingTags).slice(0, 20) // Keep last 20
      }

      // Track vulnerability types in favorites
      if (entityType === "finding" && (values as any).vulnerability_type) {
        const vulnType = (values as any).vulnerability_type as string
        const existingTypes = new Set(preferences.favorites.vulnerabilityTypes)
        existingTypes.add(vulnType)
        newPrefs.favorites.vulnerabilityTypes = Array.from(existingTypes).slice(0, 10)
      }

      savePreferences(newPrefs)
    },
    [preferences, savePreferences]
  )

  // Add to history
  const addToHistory = useCallback(
    (type: "project" | "client", value: string) => {
      if (!preferences) return

      const historyKey = type === "project" ? "recentProjects" : "recentClients"
      const existing = preferences.history[historyKey]
      const updated = [value, ...existing.filter((v) => v !== value)].slice(0, 10)

      savePreferences({
        ...preferences,
        history: {
          ...preferences.history,
          [historyKey]: updated,
        },
      })
    },
    [preferences, savePreferences]
  )

  // Get favorite tags
  const favoriteTags = useMemo(() => {
    return preferences?.favorites.tags || []
  }, [preferences])

  // Get favorite vulnerability types
  const favoriteVulnerabilityTypes = useMemo(() => {
    return preferences?.favorites.vulnerabilityTypes || []
  }, [preferences])

  // Get recent clients
  const recentClients = useMemo(() => {
    return preferences?.history.recentClients || []
  }, [preferences])

  // Reset preferences
  const resetPreferences = useCallback(() => {
    const initial: UserPreferences = {
      lastUsed: {
        project: {},
        scope: {},
        finding: {},
        report: {},
      },
      favorites: {
        tags: [],
        vulnerabilityTypes: [],
      },
      history: {
        recentProjects: [],
        recentClients: [],
      },
    }
    savePreferences(initial)
  }, [savePreferences])

  return {
    getDefaults,
    recordUsage,
    addToHistory,
    favoriteTags,
    favoriteVulnerabilityTypes,
    recentClients,
    resetPreferences,
  }
}

// ============================================================================
// Individual Entity Hooks
// ============================================================================

export function useProjectDefaults() {
  const { getDefaults, recordUsage, addToHistory, favoriteTags, recentClients } = useSmartDefaults()

  const defaults = useMemo(() => getDefaults("project"), [getDefaults])

  const recordProjectUsage = useCallback(
    (values: Partial<ProjectDefaults>, clientName?: string) => {
      recordUsage("project", values)
      if (clientName) {
        addToHistory("client", clientName)
      }
    },
    [recordUsage, addToHistory]
  )

  return {
    defaults,
    recordUsage: recordProjectUsage,
    favoriteTags,
    recentClients,
  }
}

export function useScopeDefaults(context?: { projectId?: string }) {
  const { getDefaults, recordUsage } = useSmartDefaults()

  const defaults = useMemo(() => getDefaults("scope", context), [getDefaults, context])

  const recordScopeUsage = useCallback(
    (values: Partial<ScopeDefaults>) => {
      recordUsage("scope", values)
    },
    [recordUsage]
  )

  return {
    defaults,
    recordUsage: recordScopeUsage,
  }
}

export function useFindingDefaults(context?: { projectId?: string; scopeId?: string }) {
  const { getDefaults, recordUsage, favoriteVulnerabilityTypes } = useSmartDefaults()

  const defaults = useMemo(() => getDefaults("finding", context), [getDefaults, context])

  const recordFindingUsage = useCallback(
    (values: Partial<FindingDefaults>) => {
      recordUsage("finding", values)
    },
    [recordUsage]
  )

  return {
    defaults,
    recordUsage: recordFindingUsage,
    favoriteVulnerabilityTypes,
  }
}

export function useReportDefaults() {
  const { getDefaults, recordUsage } = useSmartDefaults()

  const defaults = useMemo(() => getDefaults("report"), [getDefaults])

  const recordReportUsage = useCallback(
    (values: Partial<ReportDefaults>) => {
      recordUsage("report", values)
    },
    [recordUsage]
  )

  return {
    defaults,
    recordUsage: recordReportUsage,
  }
}
