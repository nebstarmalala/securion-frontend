"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ApiProject, ApiScope, ApiFinding } from "@/lib/types/api"

interface ProjectStatsProps {
  project: ApiProject
  scopes?: ApiScope[]
  findings?: ApiFinding[]
}

export function ProjectStats({ project, scopes = [], findings = [] }: ProjectStatsProps) {
  // Calculate statistics
  const totalScopes = scopes.length
  const inScopeCount = scopes.filter(s => s.status === "in-scope").length
  const totalFindings = findings.length
  const criticalFindings = findings.filter(f => f.severity === "critical").length
  const highFindings = findings.filter(f => f.severity === "high").length
  const fixedFindings = findings.filter(f => f.status === "fixed").length
  const openFindings = findings.filter(f => f.status === "open").length

  // Calculate progress
  const scopeProgress = totalScopes > 0 ? (inScopeCount / totalScopes) * 100 : 0
  const fixRate = totalFindings > 0 ? (fixedFindings / totalFindings) * 100 : 0

  // Calculate project health score (0-100)
  const healthScore = calculateHealthScore({
    fixRate,
    criticalFindings,
    highFindings,
    openFindings,
    totalFindings,
  })

  // Calculate days remaining
  const endDate = new Date(project.end_date)
  const startDate = new Date(project.start_date)
  const today = new Date()
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const timeProgress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100)

  const isOverdue = daysRemaining < 0
  const isNearDeadline = daysRemaining <= 7 && daysRemaining >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Health Score */}
      <Card className={cn(
        "border-2 transition-all",
        healthScore >= 80 ? "border-green-200 dark:border-green-900" :
        healthScore >= 60 ? "border-yellow-200 dark:border-yellow-900" :
        "border-red-200 dark:border-red-900"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl font-bold",
                healthScore >= 80 ? "text-green-600 dark:text-green-400" :
                healthScore >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                "text-red-600 dark:text-red-400"
              )}>
                {healthScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <Progress
              value={healthScore}
              className={cn(
                "h-2",
                healthScore >= 80 ? "[&>div]:bg-green-500" :
                healthScore >= 60 ? "[&>div]:bg-yellow-500" :
                "[&>div]:bg-red-500"
              )}
            />
            <p className="text-xs text-muted-foreground">
              {healthScore >= 80 ? "Excellent project health" :
               healthScore >= 60 ? "Good project health" :
               healthScore >= 40 ? "Fair project health" :
               "Needs attention"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scope Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scope Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{inScopeCount}</span>
              <span className="text-sm text-muted-foreground">/ {totalScopes}</span>
            </div>
            <Progress value={scopeProgress} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {scopeProgress.toFixed(0)}% in scope
              </span>
              {scopeProgress === 100 && (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings Status */}
      <Card className={cn(
        criticalFindings > 0 || highFindings > 5 ? "border-2 border-red-200 dark:border-red-900" : ""
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Critical Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl font-bold",
                criticalFindings > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              )}>
                {criticalFindings}
              </span>
              <span className="text-sm text-muted-foreground">critical</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">High severity</span>
                <Badge variant="outline" className="text-xs">
                  {highFindings}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Open findings</span>
                <Badge variant="outline" className="text-xs">
                  {openFindings}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Remaining */}
      <Card className={cn(
        isOverdue ? "border-2 border-red-200 dark:border-red-900" :
        isNearDeadline ? "border-2 border-yellow-200 dark:border-yellow-900" : ""
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl font-bold",
                isOverdue ? "text-red-600 dark:text-red-400" :
                isNearDeadline ? "text-yellow-600 dark:text-yellow-400" :
                "text-foreground"
              )}>
                {isOverdue ? Math.abs(daysRemaining) : daysRemaining}
              </span>
              <span className="text-sm text-muted-foreground">
                days {isOverdue ? "overdue" : "left"}
              </span>
            </div>
            <Progress
              value={timeProgress}
              className={cn(
                "h-2",
                isOverdue ? "[&>div]:bg-red-500" :
                isNearDeadline ? "[&>div]:bg-yellow-500" :
                "[&>div]:bg-primary"
              )}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(timeProgress)}% elapsed</span>
              {isOverdue ? (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Rate */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Resolution Progress</CardTitle>
          <CardDescription>Track how findings are being addressed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{totalFindings}</p>
                <p className="text-xs text-muted-foreground">Total Findings</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fixedFindings}</p>
                <p className="text-xs text-muted-foreground">Fixed</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{openFindings}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{fixRate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Fix Rate</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Resolution Progress</span>
                <span className="font-medium">{fixRate.toFixed(1)}%</span>
              </div>
              <Progress value={fixRate} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Health score calculation
function calculateHealthScore(params: {
  fixRate: number
  criticalFindings: number
  highFindings: number
  openFindings: number
  totalFindings: number
}): number {
  const { fixRate, criticalFindings, highFindings, openFindings, totalFindings } = params

  let score = 100

  // Penalize for critical findings (10 points each, max 40 points)
  score -= Math.min(criticalFindings * 10, 40)

  // Penalize for high findings (5 points each, max 20 points)
  score -= Math.min(highFindings * 5, 20)

  // Reward for fix rate (max 30 points)
  score -= Math.max(30 - (fixRate * 0.3), 0)

  // Penalize for high ratio of open findings (max 10 points)
  if (totalFindings > 0) {
    const openRatio = openFindings / totalFindings
    score -= openRatio * 10
  }

  return Math.max(Math.round(score), 0)
}
