"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getProjectById, getSeverityColor } from "@/lib/mock-data"
import { ArrowLeft, MoreVertical, Copy, ExternalLink, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScopeFormDialog } from "@/components/scope-form-dialog"
import { FindingFormDialog } from "@/components/finding-form-dialog"
import { useState } from "react"

// Mock scope data
const mockScopeDetails = {
  id: "1",
  name: "Main API Gateway",
  type: "api",
  target: "https://api.securebank.com",
  port: 443,
  protocol: "HTTPS",
  status: "active",
  notes: "Primary API gateway handling all external requests. Implements OAuth 2.0 authentication.",
  tags: ["production", "critical", "external-facing"],
  services: [
    { name: "nginx", version: "1.21.0" },
    { name: "Node.js", version: "18.16.0" },
    { name: "PostgreSQL", version: "14.5" },
  ],
  findingsCount: { critical: 2, high: 3, medium: 5, low: 4, info: 2 },
  lastTested: "2 hours ago",
}

// Mock findings for this scope
const mockFindings = [
  {
    id: "1",
    title: "SQL Injection in User Search Endpoint",
    severity: "critical" as const,
    vulnType: "Injection",
    cvss: 9.8,
    status: "open" as const,
    assignedTo: "Alex Rivera",
    date: "2025-01-28",
    description: "The user search endpoint is vulnerable to SQL injection attacks.",
    impact: "Attackers can extract sensitive database information.",
    remediation: "Use parameterized queries to prevent SQL injection.",
    poc: "' OR '1'='1",
  },
  {
    id: "2",
    title: "Broken Authentication - JWT Token Validation",
    severity: "critical" as const,
    vulnType: "Authentication",
    cvss: 9.1,
    status: "in-progress" as const,
    assignedTo: "Sarah Chen",
    date: "2025-01-27",
    description: "JWT tokens are not properly validated.",
    impact: "Attackers can forge valid authentication tokens.",
    remediation: "Implement proper JWT signature verification.",
    poc: "eyJhbGciOiJub25lIn0...",
  },
  {
    id: "3",
    title: "Cross-Site Scripting (XSS) in Profile Page",
    severity: "high" as const,
    vulnType: "XSS",
    cvss: 7.4,
    status: "open" as const,
    assignedTo: "Marcus Johnson",
    date: "2025-01-26",
    description: "User profile page does not sanitize input properly.",
    impact: "Attackers can execute malicious scripts in victim browsers.",
    remediation: "Implement proper input sanitization and output encoding.",
    poc: "<script>alert('XSS')</script>",
  },
  {
    id: "4",
    title: "Insecure Direct Object Reference",
    severity: "high" as const,
    vulnType: "Access Control",
    cvss: 7.1,
    status: "resolved" as const,
    assignedTo: "Alex Rivera",
    date: "2025-01-25",
    description: "Users can access other users' data by manipulating IDs.",
    impact: "Unauthorized access to sensitive user information.",
    remediation: "Implement proper authorization checks.",
    poc: "GET /api/users/123",
  },
  {
    id: "5",
    title: "Missing Rate Limiting on API Endpoints",
    severity: "medium" as const,
    vulnType: "Security Misconfiguration",
    cvss: 5.3,
    status: "open" as const,
    assignedTo: "Emily Watson",
    date: "2025-01-24",
    description: "API endpoints do not implement rate limiting.",
    impact: "Attackers can perform brute force attacks.",
    remediation: "Implement rate limiting on all API endpoints.",
    poc: "Automated script making 1000 requests per second.",
  },
]

// Mock CVEs
const relatedCVEs = [
  { id: "CVE-2025-0001", severity: "critical" as const, cvss: 9.8, description: "RCE in Apache Struts" },
  { id: "CVE-2025-0123", severity: "high" as const, cvss: 7.5, description: "JWT Authentication Bypass" },
]

export default function ScopeDetailsPage({ params }: { params: { id: string; scopeId: string } }) {
  const project = getProjectById(params.id)
  const [editingFinding, setEditingFinding] = useState<(typeof mockFindings)[0] | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  if (!project) {
    notFound()
  }

  const scope = mockScopeDetails
  const totalFindings = Object.values(scope.findingsCount).reduce((a, b) => a + b, 0)

  const handleEditFinding = (finding: (typeof mockFindings)[0]) => {
    setEditingFinding(finding)
    setEditDialogOpen(true)
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Projects", href: "/projects" },
        { label: project.name, href: `/projects/${project.id}` },
        { label: "Scopes" },
        { label: scope.name },
      ]}
    >
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link href={`/projects/${params.id}`}>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Project
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{scope.name}</h1>
              <Badge variant="outline">{scope.type}</Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900"
              >
                {scope.status}
              </Badge>
            </div>
            <code className="text-sm text-muted-foreground font-mono">{scope.target}</code>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ScopeFormDialog
                mode="edit"
                initialData={{
                  name: scope.name,
                  type: scope.type,
                  target: scope.target,
                  port: scope.port.toString(),
                  protocol: scope.protocol,
                  notes: scope.notes,
                  tags: scope.tags,
                }}
                trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit Scope</DropdownMenuItem>}
              />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Scope Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Target</h3>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">{scope.target}</code>
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Port & Protocol</h3>
                    <p className="text-sm">
                      {scope.port} / {scope.protocol}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <p className="text-sm">{scope.notes}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {scope.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Services</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {scope.services.map((service, index) => (
                      <div key={index} className="rounded-lg border border-border bg-muted/50 p-3">
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground">Version {service.version}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & CVEs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Total Findings</span>
                    <span className="text-2xl font-bold">{totalFindings}</span>
                  </div>
                  <div className="space-y-2">
                    {(["critical", "high", "medium", "low"] as const).map((severity) => (
                      <div key={severity} className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getSeverityColor(severity)}>
                          {severity}
                        </Badge>
                        <span className="font-medium">{scope.findingsCount[severity]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Last Tested</span>
                  <p className="text-sm font-medium mt-1">{scope.lastTested}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related CVEs</CardTitle>
                <CardDescription>Known vulnerabilities affecting this scope</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedCVEs.map((cve) => (
                    <Link key={cve.id} href={`/cve-tracking/${cve.id}`}>
                      <div className="group rounded-lg border border-border p-3 transition-all hover:border-primary/50 hover:bg-muted/50">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <code className="text-sm font-mono font-medium">{cve.id}</code>
                          <Badge variant="outline" className={getSeverityColor(cve.severity)}>
                            {cve.cvss}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{cve.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                          <span>View Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Findings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Findings</CardTitle>
                <CardDescription>Security vulnerabilities discovered in this scope</CardDescription>
              </div>
              <FindingFormDialog mode="add" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>CVSS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFindings.map((finding) => (
                  <TableRow key={finding.id} className="group hover:bg-muted/50">
                    <TableCell>
                      <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                        {finding.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/projects/${params.id}/scopes/${params.scopeId}/findings/${finding.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {finding.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {finding.vulnType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm font-mono">{finding.cvss}</code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          finding.status === "open"
                            ? "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900"
                            : finding.status === "in-progress"
                              ? "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-900"
                              : "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900"
                        }
                      >
                        {finding.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{finding.assignedTo}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{finding.date}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditFinding(finding)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Finding
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Finding Dialog */}
        {editingFinding && (
          <FindingFormDialog
            mode="edit"
            initialData={{
              title: editingFinding.title,
              severity: editingFinding.severity,
              vulnType: editingFinding.vulnType,
              cvss: editingFinding.cvss.toString(),
              status: editingFinding.status,
              assignedTo: editingFinding.assignedTo,
              description: editingFinding.description,
              impact: editingFinding.impact,
              remediation: editingFinding.remediation,
              poc: editingFinding.poc,
            }}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
