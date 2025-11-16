/**
 * Finding Details Page
 * Ultra-modern tabbed interface with beautiful animations and comprehensive information
 */

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  MoreVertical,
  Copy,
  ExternalLink,
  Shield,
  AlertCircle,
  FileText,
  Code,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  Activity,
  Calendar,
  User,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
  Target,
  Zap,
} from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ProtectedRoute } from "@/components/protected-route"
import { FindingFormDialog } from "@/components/finding-form-dialog"
import { CommentSection } from "@/components/comments"
import { AttachmentSection } from "@/components/attachments"
import { ActivityFeed } from "@/components/activity"
import { useFinding, useUpdateFindingStatus, useDeleteFinding, useFindingActivities } from "@/lib/hooks/useFindings"
import { projectsService, scopesService } from "@/lib/api"
import type { ApiProject, ApiScope, ApiFinding } from "@/lib/types/api"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Helper functions for styling
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "border-red-600 bg-red-50 text-red-700 dark:text-red-400 dark:bg-red-950"
    case "high":
      return "border-orange-500 bg-orange-50 text-orange-700 dark:text-orange-400 dark:bg-orange-950"
    case "medium":
      return "border-yellow-500 bg-yellow-50 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-950"
    case "low":
      return "border-blue-500 bg-blue-50 text-blue-700 dark:text-blue-400 dark:bg-blue-950"
    case "info":
      return "border-gray-500 bg-gray-50 text-gray-700 dark:text-gray-400 dark:bg-gray-950"
    default:
      return ""
  }
}

const getSeverityGradient = (severity: string) => {
  switch (severity) {
    case "critical":
      return "from-red-500/10 to-red-600/10"
    case "high":
      return "from-orange-500/10 to-orange-600/10"
    case "medium":
      return "from-yellow-500/10 to-yellow-600/10"
    case "low":
      return "from-blue-500/10 to-blue-600/10"
    case "info":
      return "from-gray-500/10 to-gray-600/10"
    default:
      return "from-gray-500/10 to-gray-600/10"
  }
}

const getFindingStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900"
    case "confirmed":
      return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-900"
    case "fixed":
      return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900"
    case "false-positive":
      return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-900"
    case "accepted":
      return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-900"
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

export default function FindingDetails() {
  const { id, scopeId, findingId } = useParams<{ id: string; scopeId: string; findingId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ApiProject | null>(null)
  const [scope, setScope] = useState<ApiScope | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("overview")

  // Use the new hooks
  const { data: findingResponse, isLoading, error: findingError, refetch } = useFinding(findingId)
  const updateStatusMutation = useUpdateFindingStatus()
  const deleteFindingMutation = useDeleteFinding()
  const { data: activitiesData } = useFindingActivities(findingId)

  const finding = findingResponse

  // Fetch project and scope data
  useEffect(() => {
    if (id && scopeId) {
      Promise.all([
        projectsService.getProject(id),
        scopesService.getScope(scopeId),
      ]).then(([projectData, scopeData]) => {
        setProject(projectData)
        setScope(scopeData)
      }).catch(err => {
        console.error("Error fetching project/scope data:", err)
        toast.error("Failed to load project data")
      })
    }
  }, [id, scopeId])

  const handleStatusUpdate = async (newStatus: ApiFinding["status"]) => {
    if (!findingId) return
    await updateStatusMutation.mutateAsync({ id: findingId, data: { status: newStatus } })
  }

  const handleDeleteFinding = async () => {
    if (!findingId || !confirm("Are you sure you want to delete this finding? This action cannot be undone.")) return

    await deleteFindingMutation.mutateAsync(findingId)
    navigate(`/projects/${id}/scopes/${scopeId}`)
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  if (isLoading) {
    return (
      <ProtectedRoute permissions={["project-view"]}>
        <DashboardLayout breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Loading..." }]}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3 space-y-6">
                <Skeleton className="h-96 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (findingError || !finding) {
    return (
      <ProtectedRoute permissions={["project-view"]}>
        <DashboardLayout breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Error" }]}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{findingError?.message || "Finding not found"}</AlertDescription>
          </Alert>
          <Link to={`/projects/${id}/scopes/${scopeId}`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scope
            </Button>
          </Link>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute permissions={["project-view"]}>
      <DashboardLayout
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: project?.name || "...", href: `/projects/${id}` },
          { label: "Scopes", href: `/projects/${id}` },
          { label: scope?.name || "...", href: `/projects/${id}/scopes/${scopeId}` },
          { label: finding.title },
        ]}
      >
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          {/* Back Button */}
          <Link to={`/projects/${id}/scopes/${scopeId}`}>
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Scope
            </Button>
          </Link>

          {/* Hero Header with Gradient Background */}
          <div className={cn(
            "relative rounded-xl border bg-gradient-to-br p-8 overflow-hidden",
            getSeverityGradient(finding.severity)
          )}>
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />

            <div className="relative flex items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className={cn("font-semibold border-2", getSeverityColor(finding.severity))}>
                    <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                    {finding.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={cn("font-medium border", getFindingStatusColor(finding.status))}>
                    {formatStatus(finding.status)}
                  </Badge>
                  {finding.cvss && (
                    <Badge variant="outline" className="font-mono font-bold border-2">
                      <Shield className="h-3.5 w-3.5 mr-1.5" />
                      CVSS {finding.cvss.score}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl font-bold tracking-tight">{finding.title}</h1>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">{formatVulnerabilityType(finding.vulnerability_type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Discovered by <span className="font-medium">{finding.discovered_by}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(finding.created_at)}</span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Finding
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyToClipboard(finding.title)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Title
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDeleteFinding}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Finding
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Content with Tabs */}
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Left Column - Main Tabbed Content */}
            <div className="lg:col-span-3">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                  <TabsTrigger value="overview" className="gap-2 py-2.5">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="gap-2 py-2.5">
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">Technical</span>
                  </TabsTrigger>
                  <TabsTrigger value="remediation" className="gap-2 py-2.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Remediation</span>
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="gap-2 py-2.5">
                    <Paperclip className="h-4 w-4" />
                    <span className="hidden sm:inline">Files</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2 py-2.5">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Activity</span>
                  </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {finding.description.split("\n\n").map((paragraph: string, index: number) => (
                          <p key={index} className="text-sm leading-relaxed mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {finding.cvss && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          CVSS Breakdown
                        </CardTitle>
                        <CardDescription>Common Vulnerability Scoring System v{finding.cvss.version}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Base Score</p>
                            <p className="text-3xl font-bold tabular-nums">{finding.cvss.score}</p>
                          </div>
                          <Badge className={cn("text-lg px-4 py-2", getSeverityColor(finding.severity))}>
                            {finding.severity.toUpperCase()}
                          </Badge>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Vector String</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-mono">
                              {finding.cvss.vector}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyToClipboard(finding.cvss!.vector)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* TECHNICAL DETAILS TAB */}
                <TabsContent value="technical" className="mt-6 space-y-6">
                  {finding.proof_of_concept ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Proof of Concept
                        </CardTitle>
                        <CardDescription>Reproduction steps and technical details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {finding.proof_of_concept.steps && finding.proof_of_concept.steps.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <ChevronRight className="h-4 w-4" />
                              Steps to Reproduce
                            </h4>
                            <ol className="space-y-2">
                              {finding.proof_of_concept.steps.map((step: string, index: number) => (
                                <li key={index} className="flex gap-3">
                                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  <span className="flex-1 text-sm pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {finding.proof_of_concept.payload && (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Payload
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyToClipboard(finding.proof_of_concept?.payload || "")}
                              >
                                <Copy className="h-3.5 w-3.5 mr-2" />
                                Copy
                              </Button>
                            </div>
                            <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto border">
                              {finding.proof_of_concept.payload}
                            </pre>
                          </div>
                        )}

                        {finding.proof_of_concept.screenshot && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3">Screenshot Evidence</h4>
                            <img
                              src={finding.proof_of_concept.screenshot}
                              alt="Proof of concept screenshot"
                              className="rounded-lg border max-w-full"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Code className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Technical Details</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          No proof of concept has been documented for this finding yet.
                        </p>
                        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Add Technical Details
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* REMEDIATION TAB */}
                <TabsContent value="remediation" className="mt-6 space-y-6">
                  {finding.remediation ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          Remediation Recommendations
                        </CardTitle>
                        <CardDescription>Steps to fix and prevent this vulnerability</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">{finding.remediation.summary}</div>
                        </div>

                        {finding.remediation.steps && finding.remediation.steps.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <ChevronRight className="h-4 w-4" />
                              Remediation Steps
                            </h4>
                            <ol className="space-y-2">
                              {finding.remediation.steps.map((step: string, index: number) => (
                                <li key={index} className="flex gap-3">
                                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  <span className="flex-1 text-sm pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {finding.remediation.priority && (
                          <div className="p-4 rounded-lg bg-muted">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Priority</p>
                            <Badge variant="secondary" className="text-sm">
                              {finding.remediation.priority}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Remediation Plan</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          No remediation recommendations have been documented yet.
                        </p>
                        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Add Remediation Plan
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* ATTACHMENTS TAB */}
                <TabsContent value="attachments" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Paperclip className="h-5 w-5" />
                        Attachments
                      </CardTitle>
                      <CardDescription>Upload evidence, screenshots, and related files</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AttachmentSection entityType="findings" entityId={findingId!} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ACTIVITY TAB */}
                <TabsContent value="activity" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Activity Timeline
                      </CardTitle>
                      <CardDescription>History of changes and updates to this finding</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ActivityFeed
                        filters={{ resource: "Finding", resource_id: findingId }}
                        showFilters={false}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Current Status</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          {formatStatus(finding.status)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusUpdate("open")}>
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate("confirmed")}>
                          Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate("fixed")}>
                          Fixed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate("false-positive")}>
                          False Positive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate("accepted")}>
                          Accepted Risk
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Severity</span>
                    <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                      {finding.severity}
                    </Badge>
                  </div>
                  {finding.cvss && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CVSS Score</span>
                      <code className="font-mono font-bold">{finding.cvss.score}</code>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discovered By</span>
                    <span className="font-medium">{finding.discovered_by}</span>
                  </div>
                  {finding.discovered_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discovered</span>
                      <span>{formatDate(finding.discovered_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(finding.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Last Updated
                    </span>
                    <span className="text-right">{getRelativeTime(finding.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Related CVEs */}
              {finding.cve_references && finding.cve_references.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Related CVEs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {finding.cve_references.map((cveId: string) => (
                        <Link key={cveId} to={`/cve-tracking/${cveId}`}>
                          <div className="group rounded-lg border p-3 transition-all hover:border-primary/50 hover:bg-accent">
                            <div className="flex items-center justify-between">
                              <code className="text-sm font-mono font-medium">{cveId}</code>
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {finding.tags && finding.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {finding.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Discussion
                  </CardTitle>
                  <CardDescription>Team comments and notes</CardDescription>
                </CardHeader>
                <CardContent>
                  <CommentSection entityType="Finding" entityId={findingId!} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Edit Dialog */}
          {editDialogOpen && (
            <FindingFormDialog
              mode="edit"
              scopeId={scopeId}
              findingId={findingId}
              initialData={{
                title: finding.title,
                severity: finding.severity,
                vulnerability_type: finding.vulnerability_type,
                cvss: JSON.stringify(finding.cvss) || "",
                status: finding.status,
                description: finding.description,
                remediation: finding.remediation?.summary || "",
                proof_of_concept: finding.proof_of_concept?.payload || "",
              }}
              onFindingUpdated={() => refetch()}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function Label({ className, children, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props}>{children}</label>
}
