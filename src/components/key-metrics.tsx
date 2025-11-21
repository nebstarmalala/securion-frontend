"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertOctagon, TrendingDown, TrendingUp, Calendar } from "lucide-react"
import { useDashboardOverview, useFindingStats, useProjectStats } from "@/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export function KeyMetrics() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview()
  const { data: findingStats, isLoading: findingsLoading } = useFindingStats()
  const { data: projectStats, isLoading: projectsLoading } = useProjectStats()

  const isLoading = overviewLoading || findingsLoading || projectsLoading

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  const avgRemediationDays = findingStats?.average_remediation_days || overview?.findings?.average_remediation_days || 0
  const overdueCount = findingStats?.overdue_count || overview?.findings?.overdue_count || 0
  const avgProjectDuration = projectStats?.average_duration_days || overview?.projects?.average_duration_days || 0
  const recentProjectsCount = projectStats?.recent_count || overview?.projects?.recent_count || 0
  const recentFindingsCount = findingStats?.recent_count || overview?.findings?.recent_count || 0

  // Calculate resolution rate
  const totalFindings = overview?.findings?.total || 0
  const fixedFindings = overview?.findings?.by_status?.fixed || 0
  const resolutionRate = totalFindings > 0 ? Math.round((fixedFindings / totalFindings) * 100) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Average Remediation Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Remediation Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRemediationDays.toFixed(1)} days</div>
          <p className="text-xs text-muted-foreground mt-1">
            Time to fix security findings
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Target: &lt;14 days</span>
              <span className={avgRemediationDays <= 14 ? "text-green-600" : "text-orange-600"}>
                {avgRemediationDays <= 14 ? "On track" : "Needs improvement"}
              </span>
            </div>
            <Progress value={Math.min((14 / avgRemediationDays) * 100, 100)} className="h-1" />
          </div>
        </CardContent>
      </Card>

      {/* Overdue Findings */}
      <Card className={overdueCount > 0 ? "border-destructive/50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Findings</CardTitle>
          <AlertOctagon className={`h-4 w-4 ${overdueCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${overdueCount > 0 ? "text-destructive" : ""}`}>
            {overdueCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Past remediation deadline
          </p>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="mt-3">
              Requires immediate attention
            </Badge>
          )}
          {overdueCount === 0 && (
            <Badge variant="secondary" className="mt-3 bg-green-100 text-green-800">
              All on schedule
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Resolution Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          {resolutionRate >= 50 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-orange-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resolutionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {fixedFindings} of {totalFindings} findings resolved
          </p>
          <div className="mt-3">
            <Progress value={resolutionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Project Duration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Project Duration</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgProjectDuration.toFixed(0)} days</div>
          <p className="text-xs text-muted-foreground mt-1">
            Average time to complete projects
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Recent projects: </span>
              <span className="font-medium">{recentProjectsCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Recent findings: </span>
              <span className="font-medium">{recentFindingsCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
