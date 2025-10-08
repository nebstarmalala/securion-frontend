// Mock data for Securion penetration testing platform

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info"
export type ProjectStatus = "active" | "completed" | "on-hold" | "planning"
export type FindingStatus = "open" | "in-progress" | "resolved" | "accepted"
export type ScopeType = "web-app" | "api" | "network" | "mobile" | "infrastructure"
export type CVEStatus = "monitoring" | "affected" | "patched" | "not-applicable"
export type ReportType = "technical" | "executive"

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  status: string
  projectPermissions: ProjectPermissions[]
  assignedProjects: string[]
  joinedDate: string
}

export interface ProjectPermissions {
  projectId: string
  permissions: string[]
}

export interface Project {
  id: string
  name: string
  client: string
  description: string
  status: ProjectStatus
  testType: string
  startDate: string
  endDate: string
  tags: string[]
  team: string[]
  scopeCount: number
  findingsCount: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  progress: number
  lastUpdated: string
  createdBy: string
  createdAt: string
}

export interface Scope {
  id: string
  projectId: string
  name: string
  type: ScopeType
  target: string
  port?: number
  protocol?: string
  status: string
  notes: string
  tags: string[]
  services: { name: string; version: string }[]
  findingsCount: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  lastTested: string
}

export interface Finding {
  id: string
  projectId: string
  scopeId: string
  title: string
  severity: SeverityLevel
  vulnType: string
  cvss: number
  status: FindingStatus
  description: string
  proofOfConcept: {
    steps: string[]
    payload: string
    request: string
    response: string
  }
  remediation: {
    recommendations: string
    references: string[]
  }
  relatedCVEs: string[]
  tags: string[]
  assignedTo: string
  discoveredBy: string
  discoveredAt: string
  lastUpdated: string
}

export interface CVE {
  id: string
  cveId: string
  cvss: number
  severity: SeverityLevel
  description: string
  publishedDate: string
  modifiedDate: string
  status: CVEStatus
  affectedProjects: number
  affectedProducts: {
    vendor: string
    product: string
    versionRange: string
  }[]
  references: string[]
}

export interface Activity {
  id: string
  userId: string
  action: string
  resourceType: "project" | "scope" | "finding" | "cve"
  resourceId: string
  resourceName: string
  timestamp: string
}

export interface Report {
  id: string
  projectId: string
  projectName: string
  client: string
  reportType: ReportType
  generatedDate: string
  generatedBy: string
  status: string
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

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Rivera",
    email: "alex.rivera@securion.com",
    role: "Lead Pentester",
    avatar: "/professional-male.jpg",
    status: "active",
    projectPermissions: [
      { projectId: "1", permissions: ["admin", "projects", "findings", "cves", "reports", "settings"] },
      { projectId: "2", permissions: ["admin", "projects", "findings", "cves", "reports"] },
      { projectId: "4", permissions: ["projects", "findings", "reports"] },
    ],
    assignedProjects: ["1", "2", "4"],
    joinedDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@securion.com",
    role: "Senior Security Analyst",
    avatar: "/professional-female.png",
    status: "active",
    projectPermissions: [
      { projectId: "1", permissions: ["projects", "findings", "cves", "reports"] },
      { projectId: "3", permissions: ["projects", "findings", "reports"] },
    ],
    assignedProjects: ["1", "3"],
    joinedDate: "2023-03-20",
  },
  {
    id: "3",
    name: "Marcus Johnson",
    email: "marcus.johnson@securion.com",
    role: "Security Researcher",
    avatar: "/professional-male-2.jpg",
    status: "active",
    projectPermissions: [
      { projectId: "2", permissions: ["projects", "findings", "cves"] },
      { projectId: "4", permissions: ["projects", "findings"] },
      { projectId: "6", permissions: ["projects", "findings", "reports"] },
    ],
    assignedProjects: ["2", "4", "6"],
    joinedDate: "2023-06-10",
  },
  {
    id: "4",
    name: "Emily Watson",
    email: "emily.watson@securion.com",
    role: "Junior Pentester",
    avatar: "/professional-female-2.jpg",
    status: "active",
    projectPermissions: [{ projectId: "3", permissions: ["projects", "findings"] }],
    assignedProjects: ["3"],
    joinedDate: "2024-01-05",
  },
  {
    id: "5",
    name: "David Kim",
    email: "david.kim@securion.com",
    role: "Security Consultant",
    avatar: "/professional-male-3.jpg",
    status: "inactive",
    projectPermissions: [],
    assignedProjects: [],
    joinedDate: "2022-11-12",
  },
]

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: "1",
    name: "FinTech API Security Assessment",
    client: "SecureBank Corp",
    description:
      "Comprehensive security assessment of banking API infrastructure including authentication, authorization, and data protection mechanisms.",
    status: "active",
    testType: "API Penetration Test",
    startDate: "2025-01-15",
    endDate: "2025-02-28",
    tags: ["api", "fintech", "high-priority"],
    team: ["1", "2", "3"],
    scopeCount: 8,
    findingsCount: { critical: 3, high: 7, medium: 12, low: 8, info: 5 },
    progress: 65,
    lastUpdated: "2 hours ago",
    createdBy: "1",
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "E-Commerce Platform Audit",
    client: "ShopNow Inc",
    description:
      "Full-stack security audit of e-commerce platform including payment processing, user authentication, and data storage.",
    status: "active",
    testType: "Web Application Test",
    startDate: "2025-01-20",
    endDate: "2025-03-15",
    tags: ["web-app", "e-commerce", "pci-dss"],
    team: ["1", "4"],
    scopeCount: 12,
    findingsCount: { critical: 1, high: 4, medium: 9, low: 15, info: 8 },
    progress: 45,
    lastUpdated: "5 hours ago",
    createdBy: "1",
    createdAt: "2025-01-20",
  },
  {
    id: "3",
    name: "Healthcare Portal Security Review",
    client: "MediCare Systems",
    description: "HIPAA-compliant security review of patient portal and electronic health records system.",
    status: "planning",
    testType: "Web Application Test",
    startDate: "2025-02-01",
    endDate: "2025-03-30",
    tags: ["healthcare", "hipaa", "compliance"],
    team: ["2", "3"],
    scopeCount: 6,
    findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    progress: 10,
    lastUpdated: "1 day ago",
    createdBy: "2",
    createdAt: "2025-01-25",
  },
  {
    id: "4",
    name: "Mobile Banking App Assessment",
    client: "SecureBank Corp",
    description: "Security assessment of iOS and Android mobile banking applications.",
    status: "active",
    testType: "Mobile Application Test",
    startDate: "2025-01-10",
    endDate: "2025-02-20",
    tags: ["mobile", "ios", "android", "fintech"],
    team: ["3", "4"],
    scopeCount: 4,
    findingsCount: { critical: 2, high: 5, medium: 8, low: 6, info: 3 },
    progress: 75,
    lastUpdated: "3 hours ago",
    createdBy: "3",
    createdAt: "2025-01-10",
  },
  {
    id: "5",
    name: "Cloud Infrastructure Pentest",
    client: "TechStart Solutions",
    description: "Penetration testing of AWS cloud infrastructure including IAM, S3, EC2, and RDS configurations.",
    status: "completed",
    testType: "Infrastructure Test",
    startDate: "2024-12-01",
    endDate: "2025-01-15",
    tags: ["cloud", "aws", "infrastructure"],
    team: ["1", "2", "4"],
    scopeCount: 15,
    findingsCount: { critical: 1, high: 3, medium: 11, low: 18, info: 12 },
    progress: 100,
    lastUpdated: "2 weeks ago",
    createdBy: "1",
    createdAt: "2024-12-01",
  },
  {
    id: "6",
    name: "Corporate Network Assessment",
    client: "GlobalTech Industries",
    description:
      "Internal network penetration test including Active Directory, network segmentation, and endpoint security.",
    status: "on-hold",
    testType: "Network Penetration Test",
    startDate: "2025-01-05",
    endDate: "2025-02-10",
    tags: ["network", "internal", "active-directory"],
    team: ["2", "3"],
    scopeCount: 20,
    findingsCount: { critical: 4, high: 8, medium: 15, low: 10, info: 7 },
    progress: 30,
    lastUpdated: "1 week ago",
    createdBy: "2",
    createdAt: "2025-01-05",
  },
]

// Mock CVEs
export const mockCVEs: CVE[] = [
  {
    id: "1",
    cveId: "CVE-2025-0001",
    cvss: 9.8,
    severity: "critical",
    description:
      "Critical remote code execution vulnerability in Apache Struts 2 allowing unauthenticated attackers to execute arbitrary code.",
    publishedDate: "2025-01-20",
    modifiedDate: "2025-01-22",
    status: "affected",
    affectedProjects: 2,
    affectedProducts: [{ vendor: "Apache", product: "Struts", versionRange: "2.0.0 - 2.5.30" }],
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2025-0001"],
  },
  {
    id: "2",
    cveId: "CVE-2025-0042",
    cvss: 8.1,
    severity: "high",
    description:
      "SQL injection vulnerability in popular CMS allowing authenticated users to extract sensitive database information.",
    publishedDate: "2025-01-18",
    modifiedDate: "2025-01-19",
    status: "monitoring",
    affectedProjects: 0,
    affectedProducts: [{ vendor: "WordPress", product: "Core", versionRange: "6.0 - 6.4.2" }],
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2025-0042"],
  },
  {
    id: "3",
    cveId: "CVE-2025-0123",
    cvss: 7.5,
    severity: "high",
    description: "Authentication bypass in JWT implementation allowing attackers to forge valid tokens.",
    publishedDate: "2025-01-15",
    modifiedDate: "2025-01-16",
    status: "affected",
    affectedProjects: 1,
    affectedProducts: [{ vendor: "jsonwebtoken", product: "npm package", versionRange: "< 9.0.0" }],
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2025-0123"],
  },
]

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: "1",
    userId: "1",
    action: "created a critical finding",
    resourceType: "finding",
    resourceId: "1",
    resourceName: "SQL Injection in Login Form",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    userId: "2",
    action: "updated project status",
    resourceType: "project",
    resourceId: "2",
    resourceName: "E-Commerce Platform Audit",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    userId: "3",
    action: "added new scope",
    resourceType: "scope",
    resourceId: "5",
    resourceName: "Mobile API Endpoint",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    userId: "4",
    action: "marked CVE as patched",
    resourceType: "cve",
    resourceId: "2",
    resourceName: "CVE-2025-0042",
    timestamp: "1 day ago",
  },
  {
    id: "5",
    userId: "1",
    action: "completed project",
    resourceType: "project",
    resourceId: "5",
    resourceName: "Cloud Infrastructure Pentest",
    timestamp: "2 weeks ago",
  },
]

// Mock Reports
export const mockReports: Report[] = [
  {
    id: "1",
    projectId: "5",
    projectName: "Cloud Infrastructure Pentest",
    client: "TechStart Solutions",
    reportType: "technical",
    generatedDate: "2025-01-15",
    generatedBy: "1",
    status: "final",
    version: "1.0",
    fileSize: "2.4 MB",
    summary: {
      totalFindings: 45,
      criticalFindings: 1,
      highFindings: 3,
      mediumFindings: 11,
      lowFindings: 18,
      infoFindings: 12,
      scopesTested: 15,
      testDuration: "45 days",
      riskScore: 7.2,
    },
  },
  {
    id: "2",
    projectId: "5",
    projectName: "Cloud Infrastructure Pentest",
    client: "TechStart Solutions",
    reportType: "executive",
    generatedDate: "2025-01-15",
    generatedBy: "1",
    status: "final",
    version: "1.0",
    fileSize: "1.8 MB",
    summary: {
      totalFindings: 45,
      criticalFindings: 1,
      highFindings: 3,
      mediumFindings: 11,
      lowFindings: 18,
      infoFindings: 12,
      scopesTested: 15,
      testDuration: "45 days",
      riskScore: 7.2,
    },
  },
]

// Helper functions
export function getSeverityColor(severity: SeverityLevel): string {
  const colors = {
    critical: "text-chart-1 bg-chart-1/10 border-chart-1/20",
    high: "text-chart-2 bg-chart-2/10 border-chart-2/20",
    medium: "text-chart-3 bg-chart-3/10 border-chart-3/20",
    low: "text-chart-4 bg-chart-4/10 border-chart-4/20",
    info: "text-chart-5 bg-chart-5/10 border-chart-5/20",
  }
  return colors[severity]
}

export function getStatusColor(status: ProjectStatus | FindingStatus): string {
  const colors = {
    active: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900",
    completed: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-900",
    "on-hold":
      "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-900",
    planning:
      "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950 dark:border-purple-900",
    open: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900",
    "in-progress": "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-900",
    resolved: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900",
    accepted: "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-900",
  }
  return colors[status]
}

export function getTotalFindings(project: Project): number {
  return Object.values(project.findingsCount).reduce((a, b) => a + b, 0)
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id)
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((project) => project.id === id)
}

export function getReportsByProjectId(projectId: string) {
  return mockReports.filter((report) => report.projectId === projectId)
}

export function getReportById(id: string) {
  return mockReports.find((report) => report.id === id)
}
