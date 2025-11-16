/**
 * CVE Details Page
 * Comprehensive CVE information with matching findings, affected services, and actionable insights
 */

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Shield,
  AlertCircle,
  FileText,
  Globe,
  Package,
  Zap,
  RefreshCw,
  Link as LinkIcon,
  Clock,
  Calendar,
  Activity,
  MoreVertical,
  Search,
  Download,
  Target,
  Server,
} from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ProtectedRoute } from "@/components/protected-route"
import { useCVE, useMatchCVE, useDeleteCVE } from "@/lib/hooks/useCVEs"
import { CommentSection } from "@/components/comments"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Helper functions
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
    default:
      return "border-gray-500 bg-gray-50 text-gray-700 dark:text-gray-400 dark:bg-gray-950"
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
    default:
      return "from-gray-500/10 to-gray-600/10"
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default function CVEDetails() {
  const { cveId } = useParams<{ cveId: string }>()
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState("overview")

  // Use the new hooks
  const { data: cveResponse, isLoading, error: cveError, refetch } = useCVE(cveId)
  const matchCVEMutation = useMatchCVE()
  const deleteCVEMutation = useDeleteCVE()

  const cve = cveResponse?.data

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const handleMatchCVE = async () => {
    if (!cveId) return
    await matchCVEMutation.mutateAsync(cveId)
    refetch()
  }

  const handleDeleteCVE = async () => {
    if (!cveId || !confirm("Are you sure you want to delete this CVE tracking entry?")) return
    await deleteCVEMutation.mutateAsync(cveId)
    navigate("/cve-tracking")
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout breadcrumbs={[{ label: "CVE Tracking", href: "/cve-tracking" }, { label: "Loading..." }]}>
          <div className="space-y-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-32 w-full" />
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

  if (cveError || !cve) {
    return (
      <ProtectedRoute>
        <DashboardLayout breadcrumbs={[{ label: "CVE Tracking", href: "/cve-tracking" }, { label: "Error" }]}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cveError?.message || "CVE not found"}</AlertDescription>
          </Alert>
          <Link to="/cve-tracking">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to CVE Tracking
            </Button>
          </Link>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout
        breadcrumbs={[
          { label: "CVE Tracking", href: "/cve-tracking" },
          { label: cve.cve_id },
        ]}
      >
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          {/* Back Button */}
          <Link to="/cve-tracking">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CVE Tracking
            </Button>
          </Link>

          {/* Hero Header with Gradient Background */}
          <div className={cn(
            "relative rounded-xl border bg-gradient-to-br p-8 overflow-hidden",
            getSeverityGradient(cve.severity)
          )}>
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />

            <div className="relative flex items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className={cn("font-semibold border-2", getSeverityColor(cve.severity))}>
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    {cve.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="font-mono font-bold border-2">
                    <Shield className="h-3.5 w-3.5 mr-1.5" />
                    CVSS {cve.cvss_score}
                  </Badge>
                  {cve.is_critical && (
                    <Badge variant="destructive" className="font-semibold animate-pulse">
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      CRITICAL
                    </Badge>
                  )}
                  {cve.affected_services_count > 0 && (
                    <Badge variant="outline" className="font-semibold border-orange-500 bg-orange-50 text-orange-700">
                      <Server className="h-3.5 w-3.5 mr-1.5" />
                      {cve.affected_services_count} Services Affected
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl font-bold tracking-tight font-mono">{cve.cve_id}</h1>

                <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
                  {cve.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Published {getRelativeTime(cve.published_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated {getRelativeTime(cve.last_modified_date)}</span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleMatchCVE} disabled={matchCVEMutation.isPending}>
                    <RefreshCw className={cn("mr-2 h-4 w-4", matchCVEMutation.isPending && "animate-spin")} />
                    Match to Services
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyToClipboard(cve.cve_id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy CVE ID
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyToClipboard(cve.cvss_vector)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy CVSS Vector
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDeleteCVE}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Delete CVE Tracking
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
                <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                  <TabsTrigger value="overview" className="gap-2 py-2.5">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="products" className="gap-2 py-2.5">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Products</span>
                  </TabsTrigger>
                  <TabsTrigger value="impact" className="gap-2 py-2.5">
                    <Target className="h-4 w-4" />
                    <span className="hidden sm:inline">Impact</span>
                  </TabsTrigger>
                  <TabsTrigger value="references" className="gap-2 py-2.5">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">References</span>
                  </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        CVSS Breakdown
                      </CardTitle>
                      <CardDescription>Common Vulnerability Scoring System v3.1</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-6 rounded-lg bg-muted">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Base Score</p>
                          <p className="text-5xl font-bold tabular-nums">{cve.cvss_score}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={cn("text-xl px-6 py-3", getSeverityColor(cve.severity))}>
                            {cve.severity.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">Severity Level</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Vector String</Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded-lg bg-muted px-4 py-3 text-sm font-mono border">
                            {cve.cvss_vector}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(cve.cvss_vector)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          This vector defines the characteristics and severity of the vulnerability
                        </p>
                      </div>

                      <Separator />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Published Date</p>
                          <p className="text-base font-semibold">{formatDate(cve.published_date)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Last Modified</p>
                          <p className="text-base font-semibold">{formatDate(cve.last_modified_date)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-sm leading-relaxed">{cve.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* PRODUCTS TAB */}
                <TabsContent value="products" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Affected Products
                      </CardTitle>
                      <CardDescription>
                        Software and versions impacted by this vulnerability
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {cve.affected_products && cve.affected_products.length > 0 ? (
                        <div className="space-y-3">
                          {cve.affected_products.map((product, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                              <Package className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{product}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Product Data</h3>
                          <p className="text-sm text-muted-foreground">
                            Affected product information is not available for this CVE
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* IMPACT TAB */}
                <TabsContent value="impact" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {cve.affected_services_count > 0 ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        Impact Assessment
                      </CardTitle>
                      <CardDescription>
                        {cve.affected_services_count > 0
                          ? `This CVE affects ${cve.affected_services_count} ${cve.affected_services_count === 1 ? "service" : "services"} in your projects`
                          : "This CVE does not affect any services in your projects"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {cve.tracked_services && cve.tracked_services.length > 0 ? (
                        <div className="space-y-3">
                          {cve.tracked_services.map((trackedService, index) => (
                            <div
                              key={index}
                              className={cn(
                                "p-4 rounded-lg border",
                                trackedService.isAffected
                                  ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                                  : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                {trackedService.isAffected ? (
                                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                ) : (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <p className="font-semibold text-sm">{trackedService.service}</p>
                                    <Badge
                                      variant={trackedService.isAffected ? "destructive" : "default"}
                                      className="shrink-0"
                                    >
                                      {trackedService.isAffected ? "Affected" : "Not Affected"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Project: {trackedService.projectId}</span>
                                    <span>Scope: {trackedService.scopeId}</span>
                                  </div>
                                  {trackedService.isAffected && (
                                    <div className="mt-3 flex gap-2">
                                      <Button variant="outline" size="sm">
                                        <Search className="h-3.5 w-3.5 mr-2" />
                                        Create Finding
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        Mark Patched
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Services Affected</h3>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            This CVE does not impact any services in your current projects
                          </p>
                          <Button variant="outline" size="sm" className="mt-4" onClick={handleMatchCVE}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Re-match Services
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* REFERENCES TAB */}
                <TabsContent value="references" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        External References
                      </CardTitle>
                      <CardDescription>
                        Additional resources and documentation about this vulnerability
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {cve.references && cve.references.length > 0 ? (
                        <div className="space-y-2">
                          {cve.references.map((ref, index) => (
                            <a
                              key={index}
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent transition-all"
                            >
                              <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0" />
                              <span className="flex-1 text-sm break-all group-hover:text-primary">{ref}</span>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <Globe className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No References Available</h3>
                          <p className="text-sm text-muted-foreground">
                            No external references have been documented for this CVE
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CVSS Score</span>
                    <span className="text-2xl font-bold tabular-nums">{cve.cvss_score}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Affected Services</span>
                    <span className="text-2xl font-bold tabular-nums">{cve.affected_services_count}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Severity</span>
                    <Badge className={getSeverityColor(cve.severity)}>
                      {cve.severity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div className="h-full w-px bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-semibold">Published</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(cve.published_date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(cve.published_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div className="h-full w-px bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-semibold">Last Modified</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(cve.last_modified_date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(cve.last_modified_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-muted" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Tracked Since</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(cve.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleMatchCVE}
                    disabled={matchCVEMutation.isPending}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", matchCVEMutation.isPending && "animate-spin")} />
                    Match to Services
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export CVE Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on NVD
                  </Button>
                </CardContent>
              </Card>

              {/* Discussion Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Discussion</CardTitle>
                  <CardDescription>Team notes and comments</CardDescription>
                </CardHeader>
                <CardContent>
                  <CommentSection entityType="CveTracking" entityId={cveId!} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function Label({ className, children, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props}>{children}</label>
}
