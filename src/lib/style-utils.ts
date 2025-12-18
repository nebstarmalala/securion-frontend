/**
 * Centralized Style Utilities
 *
 * This file contains all color helper functions and formatting utilities
 * used across the application for consistent styling.
 */

/**
 * Get color classes for severity levels
 * Used for findings, CVEs, and vulnerability severity
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "border-red-600 text-red-700 dark:text-red-400"
    case "high":
      return "border-orange-500 text-orange-700 dark:text-orange-400"
    case "medium":
      return "border-yellow-500 text-yellow-700 dark:text-yellow-400"
    case "low":
      return "border-blue-500 text-blue-700 dark:text-blue-400"
    case "info":
    case "informational":
      return "border-gray-500 text-gray-700 dark:text-gray-400"
    default:
      return "border-gray-400 text-gray-600 dark:text-gray-500"
  }
}

/**
 * Get background color classes for severity levels
 * Used for badges and severity indicators with filled backgrounds
 */
export const getSeverityBgColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-600 text-white dark:bg-red-700"
    case "high":
      return "bg-orange-500 text-white dark:bg-orange-600"
    case "medium":
      return "bg-yellow-500 text-white dark:bg-yellow-600"
    case "low":
      return "bg-blue-500 text-white dark:bg-blue-600"
    case "info":
    case "informational":
      return "bg-gray-500 text-white dark:bg-gray-600"
    default:
      return "bg-gray-400 text-white dark:bg-gray-500"
  }
}

/**
 * Get color classes for project status
 * Used for project status badges
 */
export const getProjectStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "active":
      return "border-green-500 text-green-700 dark:text-green-400"
    case "planning":
      return "border-blue-500 text-blue-700 dark:text-blue-400"
    case "on-hold":
    case "on hold":
      return "border-yellow-500 text-yellow-700 dark:text-yellow-400"
    case "completed":
      return "border-gray-500 text-gray-700 dark:text-gray-400"
    case "cancelled":
      return "border-red-500 text-red-700 dark:text-red-400"
    default:
      return "border-gray-400 text-gray-600 dark:text-gray-500"
  }
}

/**
 * Get color classes for scope status
 * Used for scope status badges
 */
export const getScopeStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "in-scope":
    case "in scope":
      return "border-green-500 text-green-700 dark:text-green-400"
    case "out-of-scope":
    case "out of scope":
      return "border-red-500 text-red-700 dark:text-red-400"
    case "pending":
      return "border-yellow-500 text-yellow-700 dark:text-yellow-400"
    default:
      return "border-gray-400 text-gray-600 dark:text-gray-500"
  }
}

/**
 * Get color classes for finding status
 * Used for finding status badges with background colors
 */
export const getFindingStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "open":
      return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900"
    case "confirmed":
      return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-900"
    case "fixed":
    case "resolved":
      return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900"
    case "false-positive":
    case "false positive":
      return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-900"
    case "accepted":
    case "accepted-risk":
      return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-900"
    case "in-progress":
    case "in progress":
      return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-900"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-900"
  }
}

/**
 * Get color classes for queue status
 * Used for queue monitoring status indicators
 */
export const getQueueStatusColor = (status?: string): string => {
  if (!status) return "border-gray-400 text-gray-600 dark:text-gray-500"

  switch (status.toLowerCase()) {
    case "healthy":
    case "active":
      return "border-green-500 text-green-700 dark:text-green-400"
    case "degraded":
    case "warning":
      return "border-yellow-500 text-yellow-700 dark:text-yellow-400"
    case "unhealthy":
    case "error":
    case "failed":
      return "border-red-500 text-red-700 dark:text-red-400"
    case "idle":
    case "paused":
      return "border-blue-500 text-blue-700 dark:text-blue-400"
    default:
      return "border-gray-400 text-gray-600 dark:text-gray-500"
  }
}

/**
 * Get color classes for general status (active/inactive)
 * Used for generic on/off states
 */
export const getActiveStatusColor = (isActive: boolean): string => {
  return isActive
    ? "border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950"
    : "border-gray-500 text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-950"
}

/**
 * Format date string to readable format
 * Example: "Jan 15, 2024"
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "N/A"
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return "Invalid date"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format date string with time
 * Example: "Jan 15, 2024 at 3:45 PM"
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "N/A"
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return "Invalid date"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * Get relative time from date string
 * Example: "5 minutes ago", "3 hours ago", "2 days ago"
 */
export const getRelativeTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "N/A"
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return "Invalid date"

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months !== 1 ? "s" : ""} ago`
  }
  const years = Math.floor(diffDays / 365)
  return `${years} year${years !== 1 ? "s" : ""} ago`
}

/**
 * Get short relative time (abbreviated)
 * Example: "5m", "3h", "2d"
 */
export const getShortRelativeTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "—"
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return "—"

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 30) return `${diffDays}d`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`
  return `${Math.floor(diffDays / 365)}y`
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

/**
 * Get initials from name
 * Example: "John Doe" -> "JD"
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Format file size to human readable format
 * Example: 1024 -> "1 KB", 1048576 -> "1 MB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

/**
 * Format number with commas
 * Example: 1000 -> "1,000", 1000000 -> "1,000,000"
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US")
}

/**
 * Get severity weight for sorting
 * Higher weight = more severe
 */
export const getSeverityWeight = (severity: string): number => {
  switch (severity.toLowerCase()) {
    case "critical":
      return 5
    case "high":
      return 4
    case "medium":
      return 3
    case "low":
      return 2
    case "info":
    case "informational":
      return 1
    default:
      return 0
  }
}

/**
 * Compare two severity values for sorting
 * Use with Array.sort()
 */
export const compareSeverity = (a: string, b: string): number => {
  return getSeverityWeight(b) - getSeverityWeight(a) // Descending order (critical first)
}
