import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, MoreVertical, Copy, Edit, AlertCircle } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ScopeFormDialog } from "@/components/scope-form-dialog"
import { FindingFormDialog } from "@/components/finding-form-dialog"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { projectsService, scopesService, findingsService } from "@/lib/api"
import type { ApiProject, ApiScope, ApiFinding, ScopeService } from "@/lib/types/api"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  getScopeStatusColor as getStatusColor,
  getSeverityColor,
  getFindingStatusColor,
  formatDate,
  getRelativeTime,
} from "@/lib/style-utils"

const formatVulnerabilityType = (type: string) => {
  const typeMap: Record<string, string> = {
    "injection": "Injection",
    "authentication": "Broken Authentication",
    "xss": "Cross-Site Scripting",
    "access-control": "Broken Access Control",
    "security-misconfiguration": "Security Misconfiguration",
    "cryptographic-failures": "Cryptographic Failures",
    "ssrf": "Server-Side Request Forgery",
    "deserialization": "Insecure Deserialization",
    "vulnerable-components": "Vulnerable Components",
    "other": "Other",
  }
  return typeMap[type] || type.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    "open": "Open",
    "confirmed": "Confirmed",
    "fixed": "Fixed",
    "false-positive": "False Positive",
    "accepted": "Accepted Risk",
  }
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

interface FindingCounts {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export default function ScopeDetails() {
  const { id, scopeId } = useParams<{ id: string; scopeId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ApiProject | null>(null)
  const [scope, setScope] = useState<ApiScope | null>(null)
  const [findings, setFindings] = useState<ApiFinding[]>([])
  const [findingCounts, setFindingCounts] = useState<FindingCounts>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingFinding, setEditingFinding] = useState<ApiFinding | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editScopeDialogOpen, setEditScopeDialogOpen] = useState(false)

  useEffect(() => {
    if (id && scopeId) {
      fetchScopeData()
    }
  }, [id, scopeId])

  const fetchScopeData = async () => {
    if (!id || !scopeId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch project details
      const projectData = await projectsService.getProject(id)
      setProject(projectData)

      // Fetch scope details
      const scopeData = await scopesService.getScope(scopeId)
      setScope(scopeData)

      // Fetch findings for this scope
      const findingsData = await findingsService.getScopeFindings(scopeId)
      const validFindings = Array.isArray(findingsData) ? findingsData : []
      setFindings(validFindings)

      // Calculate finding counts by severity
      const counts: FindingCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      }
      validFindings.forEach((finding) => {
        if (finding && finding.severity && finding.severity in counts) {
          counts[finding.severity as keyof FindingCounts]++
        }
      })
      setFindingCounts(counts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scope data")
      toast.error("Failed to load scope", {
        description: err instanceof Error ? err.message : "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteScope = async () => {
    if (!scopeId || !confirm("Are you sure you want to delete this scope? This action cannot be undone.")) return

    try {
      await scopesService.deleteScope(scopeId)
      toast.success("Scope deleted successfully")
      navigate(`/projects/${id}`)
    } catch (err) {
      toast.error("Failed to delete scope", {
        description: err instanceof Error ? err.message : "An error occurred",
      })
    }
  }

  const handleDeleteFinding = async (findingId: string) => {
    if (!confirm("Are you sure you want to delete this finding? This action cannot be undone.")) return

    try {
      await findingsService.deleteFinding(findingId)
      toast.success("Finding deleted successfully")
      fetchScopeData() // Refresh data
    } catch (err) {
      toast.error("Failed to delete finding", {
        description: err instanceof Error ? err.message : "An error occurred",
      })
    }
  }

  const handleEditFinding = (finding: ApiFinding) => {
    setEditingFinding(finding)
    setEditDialogOpen(true)
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  if (loading) {
    return (
      <ProtectedRoute permissions={["project-view"]}>
        <DashboardLayout breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Loading..." }]}>
          <div className="space-y-6">
            <Skeleton className="h-12 w-2/3" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !project || !scope) {
    return (
      <ProtectedRoute permissions={["project-view"]}>
        <DashboardLayout breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Error" }]}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Scope not found"}</AlertDescription>
          </Alert>
          <Link to={`/projects/${id}`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </Link>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const totalFindings = Object.values(findingCounts).reduce((a, b) => a + b, 0)

  return (
    <ProtectedRoute permissions={["project-view"]}>
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
              <Link to={`/projects/${id}`}>
                <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{scope.name}</h1>
                <Badge variant="outline">{scope.type}</Badge>
                <Badge variant="outline" className={getStatusColor(scope.status)}>
                  {scope.status}
                </Badge>
              </div>
              <code className="text-sm text-muted-foreground font-mono">{scope.target}</code>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditScopeDialogOpen(true)}>
                  Edit Scope
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDeleteScope}>
                  Delete Scope
                </DropdownMenuItem>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => handleCopyToClipboard(scope.target)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {(scope.port || scope.protocol) && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Port & Protocol</h3>
                        <p className="text-sm">
                          {scope.port ? scope.port : "N/A"} / {scope.protocol || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {scope.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                      <p className="text-sm">{scope.notes}</p>
                    </div>
                  )}

                  {scope.tags && scope.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {scope.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {scope.services && scope.services.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Services</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {scope.services.map((service, index: number) => (
                          <div key={index} className="rounded-lg border border-border bg-muted/50 p-3">
                            <p className="font-medium text-sm">{service.name}</p>
                            {service.version && (
                              <p className="text-xs text-muted-foreground mt-1">Version: {service.version}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      {(["critical", "high", "medium", "low", "info"] as const).map((severity) => (
                        <div key={severity} className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className={getSeverityColor(severity)}>
                            {severity}
                          </Badge>
                          <span className="font-medium">{findingCounts[severity]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <p className="text-sm font-medium mt-1">{getRelativeTime(scope.updated_at)}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Created</span>
                    <p className="text-sm font-medium mt-1">{formatDate(scope.created_at)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related CVEs</CardTitle>
                  <CardDescription>Known vulnerabilities affecting this scope</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">No CVE tracking data available yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Feature coming soon</p>
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
                <FindingFormDialog mode="add" scopeId={scopeId} onFindingCreated={fetchScopeData} />
              </div>
            </CardHeader>
            <CardContent>
              {findings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No findings yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add security findings discovered during testing
                  </p>
                  <FindingFormDialog mode="add" scopeId={scopeId} onFindingCreated={fetchScopeData} />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>CVSS</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings.map((finding) => (
                      <TableRow key={finding.id} className="group hover:bg-muted/50">
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                            {finding.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/projects/${id}/scopes/${scopeId}/findings/${finding.id}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {finding.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {formatVulnerabilityType(finding.vulnerability_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {finding.cvss ? (
                            <code className="text-sm font-mono">{finding.cvss.score}</code>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getFindingStatusColor(finding.status)}>
                            {formatStatus(finding.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(finding.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditFinding(finding)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Finding
                              </DropdownMenuItem>
                              <Link to={`/projects/${id}/scopes/${scopeId}/findings/${finding.id}`}>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteFinding(finding.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Finding Dialog */}
          {editingFinding && (
            <FindingFormDialog
              mode="edit"
              scopeId={scopeId}
              findingId={editingFinding.id}
              initialData={{
                title: editingFinding.title,
                severity: editingFinding.severity,
                vulnerability_type: editingFinding.vulnerability_type,
                cvss: editingFinding.cvss?.score.toString() || "",
                status: editingFinding.status,
                description: editingFinding.description,
                remediation: editingFinding.remediation?.summary || "",
                proof_of_concept: editingFinding.proof_of_concept?.payload || "",
              }}
              onFindingUpdated={fetchScopeData}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
            />
          )}

          {/* Edit Scope Dialog */}
          <ScopeFormDialog
            mode="edit"
            projectId={id}
            scopeId={scopeId}
            initialData={{
              name: scope.name,
              type: scope.type,
              target: scope.target,
              port: scope.port?.toString() || "",
              protocol: scope.protocol || "",
              notes: scope.notes || "",
              tags: scope.tags || [],
              services: scope.services || [],
              status: scope.status,
            }}
            onScopeUpdated={fetchScopeData}
            open={editScopeDialogOpen}
            onOpenChange={setEditScopeDialogOpen}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
