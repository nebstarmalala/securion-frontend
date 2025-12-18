// Re-export all API types for convenience
export * from "./types/api"

// Legacy types (kept for backward compatibility)
export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info"
export type ProjectStatus = "active" | "completed" | "on-hold" | "planning"
export type FindingStatus = "open" | "in-progress" | "resolved" | "accepted"
export type ScopeType = "web-app" | "api" | "network" | "mobile" | "infrastructure"
export type CVEStatus = "monitoring" | "affected" | "patched" | "not-applicable"

export interface ProjectPermissions {
  projectId: string
  permissions: string[]
}
