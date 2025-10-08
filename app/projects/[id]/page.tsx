import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getProjectById,
  getStatusColor,
  getSeverityColor,
  getUserById,
  getTotalFindings,
  getReportsByProjectId,
} from "@/lib/mock-data"
import { ArrowLeft, MoreVertical, Calendar, Target, AlertTriangle, FileText } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScopeFormDialog } from "@/components/scope-form-dialog"

// Mock scopes data for the project
const mockScopes = [
  {
    id: "1",
    name: "Main API Gateway",
    type: "api",
    target: "https://api.securebank.com",
    status: "active",
    findingsCount: { critical: 2, high: 3, medium: 5, low: 4, info: 2 },
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    name: "Authentication Service",
    type: "api",
    target: "https://auth.securebank.com",
    status: "active",
    findingsCount: { critical: 1, high: 2, medium: 3, low: 2, info: 1 },
    lastUpdated: "5 hours ago",
  },
  {
    id: "3",
    name: "Payment Processing",
    type: "api",
    target: "https://payments.securebank.com",
    status: "completed",
    findingsCount: { critical: 0, high: 2, medium: 4, low: 2, info: 2 },
    lastUpdated: "1 day ago",
  },
]

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = getProjectById(params.id)

  if (!project) {
    notFound()
  }

  const totalFindings = getTotalFindings(project)
  const teamMembers = project.team.map((id) => getUserById(id)).filter(Boolean)
  const projectReports = getReportsByProjectId(params.id)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.name }]}>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link href="/projects">
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
            <p className="text-muted-foreground">{project.client}</p>
          </div>
          <div className="flex gap-2">
            {projectReports.length > 0 && (
              <Link href={`/reports/${projectReports[0].id}`}>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Report
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
                      <Badge variant="secondary">{project.testType}</Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(project.startDate).toLocaleDateString()} -{" "}
                          {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Progress</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Overall Completion</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>

                  {project.tags.length > 0 && (
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
                  <span className="text-2xl font-bold">{project.scopeCount}</span>
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
                      <span className="font-medium">{project.findingsCount.critical}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className={getSeverityColor("high")}>
                        High
                      </Badge>
                      <span className="font-medium">{project.findingsCount.high}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className={getSeverityColor("medium")}>
                        Medium
                      </Badge>
                      <span className="font-medium">{project.findingsCount.medium}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className={getSeverityColor("low")}>
                        Low
                      </Badge>
                      <span className="font-medium">{project.findingsCount.low}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member?.id} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member?.avatar || "/placeholder.svg"} alt={member?.name} />
                        <AvatarFallback>
                          {member?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{member?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member?.role}</p>
                      </div>
                    </div>
                  ))}
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
              <ScopeFormDialog mode="add" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockScopes.map((scope) => {
                const scopeTotalFindings = Object.values(scope.findingsCount).reduce((a, b) => a + b, 0)
                return (
                  <Link key={scope.id} href={`/projects/${project.id}/scopes/${scope.id}`}>
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
                          <span className="text-muted-foreground">Findings</span>
                          <span className="font-medium">{scopeTotalFindings}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {scope.findingsCount.critical > 0 && (
                            <Badge variant="outline" className={getSeverityColor("critical")}>
                              {scope.findingsCount.critical} C
                            </Badge>
                          )}
                          {scope.findingsCount.high > 0 && (
                            <Badge variant="outline" className={getSeverityColor("high")}>
                              {scope.findingsCount.high} H
                            </Badge>
                          )}
                          {scope.findingsCount.medium > 0 && (
                            <Badge variant="outline" className={getSeverityColor("medium")}>
                              {scope.findingsCount.medium} M
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Updated {scope.lastUpdated}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
