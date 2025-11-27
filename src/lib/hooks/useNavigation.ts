/**
 * Navigation Hook
 * Provides navigation helpers, breadcrumb generation, and keyboard shortcuts
 */

import { useEffect, useCallback, useMemo } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

export interface NavigationShortcut {
  key: string
  description: string
  action: () => void
}

// Route patterns for automatic breadcrumb generation
const ROUTE_PATTERNS = {
  dashboard: { pattern: /^\/$/, label: "Dashboard" },
  projects: { pattern: /^\/projects$/, label: "Projects" },
  projectDetails: { pattern: /^\/projects\/([^/]+)$/, label: "Project" },
  scopeDetails: { pattern: /^\/projects\/([^/]+)\/scopes\/([^/]+)$/, label: "Scope" },
  findingDetails: { pattern: /^\/projects\/([^/]+)\/scopes\/([^/]+)\/findings\/([^/]+)$/, label: "Finding" },
  cveTracking: { pattern: /^\/cve-tracking$/, label: "CVE Tracking" },
  cveDetails: { pattern: /^\/cve-tracking\/([^/]+)$/, label: "CVE" },
  reports: { pattern: /^\/reports$/, label: "Reports" },
  reportDetails: { pattern: /^\/reports\/([^/]+)$/, label: "Report" },
  settings: { pattern: /^\/settings$/, label: "Settings" },
  users: { pattern: /^\/users$/, label: "Users" },
  workflows: { pattern: /^\/workflows$/, label: "Workflows" },
  webhooks: { pattern: /^\/webhooks$/, label: "Webhooks" },
  integrations: { pattern: /^\/integrations$/, label: "Integrations" },
  templates: { pattern: /^\/templates$/, label: "Templates" },
  systemCache: { pattern: /^\/system\/cache$/, label: "Cache Management" },
  systemQueue: { pattern: /^\/system\/queue$/, label: "Queue Monitoring" },
  systemErrorLogs: { pattern: /^\/system\/error-logs$/, label: "Error Logs" },
} as const

// Navigation shortcuts (key sequences)
interface ShortcutDefinition {
  keys: string[]
  path: string
  description: string
}

const NAVIGATION_SHORTCUTS: ShortcutDefinition[] = [
  { keys: ["g", "h"], path: "/", description: "Go to Dashboard (Home)" },
  { keys: ["g", "p"], path: "/projects", description: "Go to Projects" },
  { keys: ["g", "c"], path: "/cve-tracking", description: "Go to CVE Tracking" },
  { keys: ["g", "r"], path: "/reports", description: "Go to Reports" },
  { keys: ["g", "s"], path: "/settings", description: "Go to Settings" },
  { keys: ["g", "u"], path: "/users", description: "Go to Users" },
  { keys: ["g", "w"], path: "/workflows", description: "Go to Workflows" },
  { keys: ["g", "i"], path: "/integrations", description: "Go to Integrations" },
]

/**
 * Hook to get the current route's parent information for back navigation
 */
export function useBackNavigation() {
  const location = useLocation()
  const params = useParams()

  const backInfo = useMemo(() => {
    const path = location.pathname

    // Finding details -> Scope
    if (path.match(/^\/projects\/([^/]+)\/scopes\/([^/]+)\/findings\/([^/]+)$/)) {
      return {
        path: `/projects/${params.id}/scopes/${params.scopeId}`,
        label: "Back to Scope",
        context: "scope",
      }
    }

    // Scope details -> Project
    if (path.match(/^\/projects\/([^/]+)\/scopes\/([^/]+)$/)) {
      return {
        path: `/projects/${params.id}`,
        label: "Back to Project",
        context: "project",
      }
    }

    // Project details -> Projects list
    if (path.match(/^\/projects\/([^/]+)$/)) {
      return {
        path: "/projects",
        label: "Back to Projects",
        context: "projects",
      }
    }

    // CVE details -> CVE Tracking
    if (path.match(/^\/cve-tracking\/([^/]+)$/)) {
      return {
        path: "/cve-tracking",
        label: "Back to CVE Tracking",
        context: "cve-tracking",
      }
    }

    // Report details -> Reports
    if (path.match(/^\/reports\/([^/]+)$/)) {
      return {
        path: "/reports",
        label: "Back to Reports",
        context: "reports",
      }
    }

    // System pages -> Dashboard
    if (path.startsWith("/system/")) {
      return {
        path: "/",
        label: "Back to Dashboard",
        context: "dashboard",
      }
    }

    return null
  }, [location.pathname, params])

  return backInfo
}

/**
 * Hook to enable keyboard navigation shortcuts
 */
export function useKeyboardNavigation(enabled: boolean = true) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleKeySequence = useCallback((keys: string[]) => {
    const shortcut = NAVIGATION_SHORTCUTS.find(
      s => s.keys.length === keys.length && s.keys.every((k, i) => k === keys[i])
    )

    if (shortcut && shortcut.path !== location.pathname) {
      navigate(shortcut.path)
      return true
    }
    return false
  }, [navigate, location.pathname])

  useEffect(() => {
    if (!enabled) return

    let keySequence: string[] = []
    let timeoutId: number | null = null

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger in input fields or textareas
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return
      }

      // Clear previous timeout
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }

      // Add key to sequence
      keySequence.push(event.key.toLowerCase())

      // Check if we have a matching shortcut
      const handled = handleKeySequence(keySequence)

      if (handled) {
        keySequence = []
        event.preventDefault()
      } else {
        // Reset sequence after 1 second of no input
        timeoutId = window.setTimeout(() => {
          keySequence = []
        }, 1000)
      }

      // Limit sequence length to prevent memory issues
      if (keySequence.length > 3) {
        keySequence = keySequence.slice(-2)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [enabled, handleKeySequence])

  return NAVIGATION_SHORTCUTS
}

/**
 * Hook to get quick jump targets based on current context
 */
export function useQuickJump() {
  const location = useLocation()
  const params = useParams()

  const quickJumpTargets = useMemo(() => {
    const path = location.pathname
    const targets: { label: string; href: string; type: string }[] = []

    // On finding details, can jump to other findings in same scope, or to related CVEs
    if (path.match(/^\/projects\/([^/]+)\/scopes\/([^/]+)\/findings\/([^/]+)$/)) {
      targets.push(
        { label: "Scope", href: `/projects/${params.id}/scopes/${params.scopeId}`, type: "scope" },
        { label: "Project", href: `/projects/${params.id}`, type: "project" },
        { label: "All Projects", href: "/projects", type: "projects" }
      )
    }

    // On scope details, can jump to project or projects list
    if (path.match(/^\/projects\/([^/]+)\/scopes\/([^/]+)$/)) {
      targets.push(
        { label: "Project", href: `/projects/${params.id}`, type: "project" },
        { label: "All Projects", href: "/projects", type: "projects" }
      )
    }

    // On project details, can jump to projects list
    if (path.match(/^\/projects\/([^/]+)$/)) {
      targets.push(
        { label: "All Projects", href: "/projects", type: "projects" }
      )
    }

    // On CVE details, can jump to CVE tracking
    if (path.match(/^\/cve-tracking\/([^/]+)$/)) {
      targets.push(
        { label: "All CVEs", href: "/cve-tracking", type: "cve-tracking" }
      )
    }

    // On report details, can jump to reports list
    if (path.match(/^\/reports\/([^/]+)$/)) {
      targets.push(
        { label: "All Reports", href: "/reports", type: "reports" }
      )
    }

    return targets
  }, [location.pathname, params])

  return quickJumpTargets
}

/**
 * Get all available navigation shortcuts
 */
export function getNavigationShortcuts(): ShortcutDefinition[] {
  return NAVIGATION_SHORTCUTS
}
