import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { StatCard } from "@/components/stat-card"
import { FindingsChart } from "@/components/findings-chart"
import { AffectedServicesTable } from "@/components/affected-services-table"
import { ActivityTimeline } from "@/components/activity-timeline"
import { TeamLeaderboard } from "@/components/team-leaderboard"
import { KeyMetrics } from "@/components/key-metrics"
import { CveCriticalAlerts } from "@/components/cve-critical-alerts"
import {
  QuickActions,
  RecentlyViewed,
  OnboardingChecklist,
  TesterDashboard,
  ManagerDashboard,
  AdminDashboard,
} from "@/components/dashboard"
import {
  FolderKanban,
  AlertTriangle,
  Shield,
  Users,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertOctagon,
  Info,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { useDashboardOverview } from "@/hooks"
import { useAuth } from "@/lib/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

type DashboardView = "default" | "tester" | "manager" | "admin"

export default function Dashboard() {
  const { data: overview, isLoading: loading, error, refetch } = useDashboardOverview()
  const { user, hasRole } = useAuth()
  const [dashboardView, setDashboardView] = useState<DashboardView>("default")

  // Determine default view based on user role
  const getDefaultView = (): DashboardView => {
    if (hasRole("admin") || hasRole("super-admin")) return "admin"
    if (hasRole("manager")) return "manager"
    return "tester"
  }

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header with View Switcher */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.username || "User"}!</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Switcher */}
              <Tabs value={dashboardView} onValueChange={(v) => setDashboardView(v as DashboardView)}>
                <TabsList>
                  <TabsTrigger value="default">Overview</TabsTrigger>
                  <TabsTrigger value="tester">Tester</TabsTrigger>
                  <TabsTrigger value="manager">Manager</TabsTrigger>
                  {(hasRole("admin") || hasRole("super-admin")) && (
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
              {!loading && (
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              )}
            </div>
          </div>

          {/* Onboarding Checklist - Only for new users */}
          <OnboardingChecklist />

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error instanceof Error ? error.message : "Failed to load dashboard data"}</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Role-Based Dashboard Views */}
          {dashboardView === "tester" && <TesterDashboard />}
          {dashboardView === "manager" && <ManagerDashboard />}
          {dashboardView === "admin" && <AdminDashboard />}

          {/* Default Overview Dashboard */}
          {dashboardView === "default" && (
            <>
              {/* Quick Actions Panel */}
              <QuickActions />

              {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : overview ? (
              <>
                <StatCard
                  title="Total Projects"
                  value={overview?.projects?.total ?? 0}
                  icon={FolderKanban}
                  subtitle={`${overview?.projects?.by_status?.active ?? 0} active`}
                />
                <StatCard
                  title="Total Findings"
                  value={overview?.findings?.total ?? 0}
                  icon={AlertTriangle}
                  subtitle={`${(overview?.findings?.by_severity?.critical ?? 0) + (overview?.findings?.by_severity?.high ?? 0)} critical/high`}
                  className={
                    (overview?.findings?.by_severity?.critical ?? 0) > 0 ? "border-destructive/20" : undefined
                  }
                />
                <StatCard
                  title="CVE Alerts"
                  value={overview?.cves?.affected_services ?? 0}
                  icon={Shield}
                  subtitle={`${overview?.cves?.critical_count ?? 0} critical`}
                  className={(overview?.cves?.critical_count ?? 0) > 0 ? "border-destructive/20" : undefined}
                />
                <StatCard
                  title="Team Members"
                  value={overview?.team?.active_users ?? 0}
                  icon={Users}
                  subtitle={`${overview?.team?.total_users ?? 0} total users`}
                />
              </>
            ) : null}
          </div>

          {/* Key Metrics - New Enhanced Section */}
          <KeyMetrics />

          {/* Critical CVE Alerts - Prominent placement */}
          <CveCriticalAlerts />

          {/* Detailed Statistics Grid with Tabs for better organization */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="findings">Findings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Projects Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-primary" />
                      Projects by Status
                    </CardTitle>
                    <CardDescription>Distribution of all projects</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <>
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </>
                    ) : overview ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Planning</span>
                          </div>
                          <Badge variant="secondary">{overview?.projects?.by_status?.planning ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Active</span>
                          </div>
                          <Badge className="bg-green-500">{overview?.projects?.by_status?.active ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertOctagon className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">On Hold</span>
                          </div>
                          <Badge variant="outline">{overview?.projects?.by_status?.["on-hold"] ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                          <Badge className="bg-emerald-500">{overview?.projects?.by_status?.completed ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Cancelled</span>
                          </div>
                          <Badge variant="secondary">{overview?.projects?.by_status?.cancelled ?? 0}</Badge>
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Findings by Severity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Findings by Severity
                    </CardTitle>
                    <CardDescription>Security vulnerability breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <>
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </>
                    ) : overview ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-red-500" />
                              Critical
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.critical ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.critical ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-orange-500" />
                              High
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.high ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.high ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-yellow-500" />
                              Medium
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.medium ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.medium ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500" />
                              Low
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.low ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.low ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Info className="h-3 w-3 text-gray-500" />
                              Info
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.info ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.info ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Findings by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Findings by Status
                    </CardTitle>
                    <CardDescription>Resolution progress tracking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <>
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </>
                    ) : overview ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Open</span>
                          <Badge variant="destructive">{overview?.findings?.by_status?.open ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Confirmed</span>
                          <Badge className="bg-orange-500">{overview?.findings?.by_status?.confirmed ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Fixed</span>
                          <Badge className="bg-green-500">{overview?.findings?.by_status?.fixed ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">False Positive</span>
                          <Badge variant="secondary">{overview?.findings?.by_status?.["false-positive"] ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Accepted</span>
                          <Badge variant="outline">{overview?.findings?.by_status?.accepted ?? 0}</Badge>
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <TeamLeaderboard />
            </TabsContent>

            <TabsContent value="findings" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Findings by Severity
                    </CardTitle>
                    <CardDescription>Detailed vulnerability severity breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <>
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </>
                    ) : overview ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-red-500" />
                              Critical
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.critical ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.critical ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-orange-500" />
                              High
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.high ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.high ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-yellow-500" />
                              Medium
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.medium ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.medium ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500" />
                              Low
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.low ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.low ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Info className="h-3 w-3 text-gray-500" />
                              Info
                            </span>
                            <span className="text-sm font-bold">{overview?.findings?.by_severity?.info ?? 0}</span>
                          </div>
                          <Progress
                            value={((overview?.findings?.by_severity?.info ?? 0) / (overview?.findings?.total ?? 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Findings by Status
                    </CardTitle>
                    <CardDescription>Resolution progress tracking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <>
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </>
                    ) : overview ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Open</span>
                          <Badge variant="destructive">{overview?.findings?.by_status?.open ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Confirmed</span>
                          <Badge className="bg-orange-500">{overview?.findings?.by_status?.confirmed ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Fixed</span>
                          <Badge className="bg-green-500">{overview?.findings?.by_status?.fixed ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">False Positive</span>
                          <Badge variant="secondary">{overview?.findings?.by_status?.["false-positive"] ?? 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Accepted</span>
                          <Badge variant="outline">{overview?.findings?.by_status?.accepted ?? 0}</Badge>
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Findings Trend Chart */}
          {!loading && overview && <FindingsChart />}
          {loading && <Skeleton className="h-80" />}

          {/* Two Column Layout - Data Tables and Activity */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Affected Services Table */}
              {!loading && overview && <AffectedServicesTable />}
              {loading && <Skeleton className="h-96" />}
            </div>
            <div className="space-y-6">
              {/* Activity Timeline */}
              {!loading && overview && <ActivityTimeline />}
              {loading && <Skeleton className="h-96" />}

              {/* Recently Viewed */}
              <RecentlyViewed />
            </div>
          </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
