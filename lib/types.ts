export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info"
export type ProjectStatus = "active" | "completed" | "on-hold" | "planning"
export type FindingStatus = "open" | "in-progress" | "resolved" | "accepted"
export type ScopeType = "web-app" | "api" | "network" | "mobile" | "infrastructure"
export type CVEStatus = "monitoring" | "affected" | "patched" | "not-applicable"

export interface ProjectPermissions {
  projectId: string
  permissions: string[]
}

export interface Report {
  id: string
  projectId: string
  projectName: string
  client: string
  reportType: "executive" | "technical" | "compliance"
  generatedDate: string
  generatedBy: string
  status: "draft" | "final" | "archived"
  version: string
  fileSize: string
  summary: {
    totalFindings: number
    criticalFindings: number
    highFindings: number
    mediumFindings: number
    lowFindings: number
    infoFindings: number
    scopesTested: number
    testDuration: string
    riskScore: number
  }
}
