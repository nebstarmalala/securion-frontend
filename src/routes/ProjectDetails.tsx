import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, MoreVertical, Calendar, Target, AlertTriangle, AlertCircle } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ScopeFormDialog } from "@/components/scope-form-dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { projectsService, scopesService, findingsService } from "@/lib/api"
import type { ApiProject, ApiScope, ApiFinding } from "@/lib/types/api"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// Helper functions for styling
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "border-green-500 text-green-700 dark:text-green-400"
    case "planning":
      return "border-blue-500 text-blue-700 dark:text-blue-400"
    case "on-hold":
      return "border-yellow-500 text-yellow-700 dark:text-yellow-400"
    case "completed":
      return "border-gray-500 text-gray-700 dark:text-gray-400"
    case "cancelled":
      return "border-red-500 text-red-700 dark:text-red-400"
    default:
      return ""
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "border-red-600 text-red-700 dark:text-red-400"
    case "high":
      return "border-orange-500 text-orange-700 dark:text-orange-400"
    case "medium":
      return "border-yellow-500 text-yellow-700 dark:text-yellow-400"
    case "low":
      return "border-blue-500 text-blue-700 dark:text-blue-400"
    case "info":
      return "border-gray-500 text-gray-700 dark:text-gray-400"
    default:
      return ""
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
}

interface FindingCounts {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ApiProject | null>(null)
  const [scopes, setScopes] = useState<ApiScope[]>([])
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

  useEffect(() => {
    if (id) {
      fetchProjectData()
    }
  }, [id])

  const fetchProjectData = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Fetch project details
      const projectData = await projectsService.getProject(id)
      setProject(projectData)

      // Fetch scopes for this project
      const scopesData = await scopesService.getProjectScopes(id)
      console.log("Scopes data received:", scopesData)
      const validScopes = Array.isArray(scopesData) ? scopesData : []
      console.log("Valid scopes:", validScopes)
      setScopes(validScopes)

      // Fetch all findings for all scopes in this project
      if (validScopes.length > 0) {
        const findingsPromises = validScopes.map((scope) => findingsService.getScopeFindings(scope.id))
        const findingsArrays = await Promise.all(findingsPromises)
        const allFindings = findingsArrays.flat().filter((f) => f !== null && f !== undefined)
        setFindings(allFindings)

        // Calculate finding counts by severity
        const counts: FindingCounts = {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        }
        allFindings.forEach((finding) => {
          if (finding && finding.severity) {
            counts[finding.severity]++
          }
        })
        setFindingCounts(counts)
      } else {
        // No scopes, so no findings
        setFindings([])
        setFindingCounts({
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        })
      }
    } catch (err) {
      console.error("Error fetching project data:", err)
      setError(err instanceof Error ? err.message : "Failed to load project data")
      toast.error("Failed to load project", {
        description: err instanceof Error ? err.message : "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!id || !confirm("Are you sure you want to delete this project? This action cannot be undone.")) return

    try {
      await projectsService.deleteProject(id)
      toast.success("Project deleted successfully")
      navigate("/projects")
    } catch (err) {
      console.error("Error deleting project:", err)
      toast.error("Failed to delete project", {
        description: err instanceof Error ? err.message : "An error occurred",
      })
    }
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

  if (error || !project) {
    return (
      <ProtectedRoute permissions={["project-view"]}>
        <DashboardLayout breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Error" }]}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Project not found"}</AlertDescription>
          </Alert>
          <Link to="/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const totalFindings = Object.values(findingCounts).reduce((a, b) => a + b, 0)
  const testType = project.test_type || "Not specified"
  const client = project.client || "Not specified"

  return (
    <ProtectedRoute permissions={["project-view"]}>
      <DashboardLayout breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.name }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link to="/projects">
                <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Projects
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <Badge variant="outline" className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{client}</p>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleDeleteProject}>
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Project Info Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Info */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                      <p className="text-sm">{project.description}</p>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Test Type</h3>
                        <Badge variant="secondary">{testType}</Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatDate(project.start_date)} - {formatDate(project.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Team */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Total Scopes</span>
                    </div>
                    <span className="text-2xl font-bold">{scopes.length}</span>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Total Findings</span>
                      </div>
                      <span className="text-2xl font-bold">{totalFindings}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getSeverityColor("critical")}>
                          Critical
                        </Badge>
                        <span className="font-medium">{findingCounts.critical}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getSeverityColor("high")}>
                          High
                        </Badge>
                        <span className="font-medium">{findingCounts.high}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getSeverityColor("medium")}>
                          Medium
                        </Badge>
                        <span className="font-medium">{findingCounts.medium}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getSeverityColor("low")}>
                          Low
                        </Badge>
                        <span className="font-medium">{findingCounts.low}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getSeverityColor("info")}>
                          Info
                        </Badge>
                        <span className="font-medium">{findingCounts.info}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDate(project.created_at)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-medium">{project.last_updated}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Scopes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scopes</CardTitle>
                  <CardDescription>Testing targets and endpoints for this project</CardDescription>
                </div>
                <ScopeFormDialog mode="add" projectId={id} onScopeCreated={fetchProjectData} />
              </div>
            </CardHeader>
            <CardContent>
              {scopes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No scopes yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add testing targets and endpoints to this project
                  </p>
                  <ScopeFormDialog mode="add" projectId={id} onScopeCreated={fetchProjectData} />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {scopes.map((scope) => {
                    // Calculate findings for this scope
                    const scopeFindings = findings.filter((f) => f.scope_id === scope.id)
                    const scopeFindingCounts = {
                      critical: scopeFindings.filter((f) => f.severity === "critical").length,
                      high: scopeFindings.filter((f) => f.severity === "high").length,
                      medium: scopeFindings.filter((f) => f.severity === "medium").length,
                      low: scopeFindings.filter((f) => f.severity === "low").length,
                      info: scopeFindings.filter((f) => f.severity === "info").length,
                    }
                    const scopeTotalFindings = scopeFindings.length

                    return (
                      <Link key={scope.id} to={`/projects/${project.id}/scopes/${scope.id}`}>
                        <Card className="group transition-all hover:shadow-md hover:border-primary/50">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base group-hover:text-primary transition-colors">
                                {scope.name}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {scope.type}
                              </Badge>
                            </div>
                            <code className="text-xs text-muted-foreground font-mono break-all">{scope.target}</code>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Status</span>
                              <Badge variant="secondary" className="text-xs">
                                {scope.status}
                              </Badge>
                            </div>
                            {scope.port && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Port</span>
                                <span className="font-medium">{scope.port}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Findings</span>
                              <span className="font-medium">{scopeTotalFindings}</span>
                            </div>
                            {scopeTotalFindings > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {scopeFindingCounts.critical > 0 && (
                                  <Badge variant="outline" className={getSeverityColor("critical")}>
                                    {scopeFindingCounts.critical} C
                                  </Badge>
                                )}
                                {scopeFindingCounts.high > 0 && (
                                  <Badge variant="outline" className={getSeverityColor("high")}>
                                    {scopeFindingCounts.high} H
                                  </Badge>
                                )}
                                {scopeFindingCounts.medium > 0 && (
                                  <Badge variant="outline" className={getSeverityColor("medium")}>
                                    {scopeFindingCounts.medium} M
                                  </Badge>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Updated {getRelativeTime(scope.updated_at)}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
