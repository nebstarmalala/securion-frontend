/**
 * Role-Based Dashboard Views
 * Different dashboard content based on user role
 */

import { Link } from "react-router-dom"
import {
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Activity,
  AlertCircle,
  Briefcase,
  Target,
  Shield,
  Server,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/contexts/auth-context"
import { useDashboardOverview } from "@/hooks"
import { cn } from "@/lib/utils"

/**
 * Tester View
 * Focus on: My assigned projects, recent findings, pending tasks
 */
export function TesterDashboard() {
  const { user } = useAuth()
  const { data: overview, isLoading } = useDashboardOverview()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {user?.username}!</h2>
              <p className="text-muted-foreground">Here's your testing overview</p>
            </div>
            <div className="flex gap-2">
              <Link to="/projects">
                <Button>
                  <FolderKanban className="mr-2 h-4 w-4" />
                  My Projects
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          icon={<Briefcase className="h-5 w-5" />}
          label="Active Projects"
          value={overview?.projects?.by_status?.active ?? 0}
          trend={`${overview?.projects?.total ?? 0} total`}
          color="blue"
        />
        <StatsCard
          icon={<Target className="h-5 w-5" />}
          label="Scopes Testing"
          value={overview?.scopes?.testing ?? 0}
          trend={`${overview?.scopes?.total ?? 0} total`}
          color="purple"
        />
        <StatsCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Open Findings"
          value={overview?.findings?.by_status?.open ?? 0}
          trend="Needs attention"
          color="orange"
          highlight={overview?.findings?.by_status?.open > 0}
        />
        <StatsCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Fixed This Week"
          value={overview?.findings?.by_status?.fixed ?? 0}
          trend="Great progress!"
          color="green"
        />
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <TaskItem
                title="Review SQL Injection findings"
                project="Acme Corp Portal"
                priority="high"
                dueIn="2 days"
              />
              <TaskItem
                title="Complete scope testing"
                project="TechStart API"
                priority="medium"
                dueIn="5 days"
              />
              <TaskItem
                title="Update remediation steps"
                project="FinanceApp"
                priority="low"
                dueIn="1 week"
              />
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        {/* Recent Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Recent Findings
            </CardTitle>
            <CardDescription>Latest vulnerabilities discovered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <FindingItem
                title="Cross-Site Scripting (XSS)"
                severity="high"
                project="Acme Corp"
                time="2 hours ago"
              />
              <FindingItem
                title="Missing Rate Limiting"
                severity="medium"
                project="TechStart"
                time="5 hours ago"
              />
              <FindingItem
                title="Information Disclosure"
                severity="low"
                project="FinanceApp"
                time="1 day ago"
              />
            </div>
            <Link to="/projects">
              <Button variant="outline" className="w-full mt-4">
                View All Findings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Manager View
 * Focus on: Team overview, project status, report deadlines
 */
export function ManagerDashboard() {
  const { data: overview, isLoading } = useDashboardOverview()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const totalProjects = overview?.projects?.total ?? 0
  const completedProjects = overview?.projects?.by_status?.completed ?? 0
  const progressPercent = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          icon={<FolderKanban className="h-5 w-5" />}
          label="Total Projects"
          value={overview?.projects?.total ?? 0}
          trend={`${overview?.projects?.by_status?.active ?? 0} active`}
          color="blue"
        />
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          label="Team Members"
          value={overview?.team?.active_users ?? 0}
          trend={`${overview?.team?.total_users ?? 0} total`}
          color="purple"
        />
        <StatsCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Critical Findings"
          value={(overview?.findings?.by_severity?.critical ?? 0) + (overview?.findings?.by_severity?.high ?? 0)}
          trend="Needs review"
          color="red"
          highlight
        />
        <StatsCard
          icon={<FileText className="h-5 w-5" />}
          label="Reports Due"
          value={3}
          trend="This week"
          color="orange"
        />
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Project Progress
          </CardTitle>
          <CardDescription>Overall completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="grid gap-4 md:grid-cols-4 pt-4">
              <ProjectStatusCard
                status="Planning"
                count={overview?.projects?.by_status?.planning ?? 0}
                color="blue"
              />
              <ProjectStatusCard
                status="Active"
                count={overview?.projects?.by_status?.active ?? 0}
                color="green"
              />
              <ProjectStatusCard
                status="On Hold"
                count={overview?.projects?.by_status?.["on-hold"] ?? 0}
                color="orange"
              />
              <ProjectStatusCard
                status="Completed"
                count={overview?.projects?.by_status?.completed ?? 0}
                color="emerald"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Team Performance
            </CardTitle>
            <CardDescription>Findings by team member this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TeamMemberRow name="John Doe" findings={24} rank={1} />
              <TeamMemberRow name="Jane Smith" findings={18} rank={2} />
              <TeamMemberRow name="Bob Wilson" findings={15} rank={3} />
              <TeamMemberRow name="Alice Brown" findings={12} rank={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Reports and project milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <DeadlineItem
                title="Acme Corp Final Report"
                date="Dec 15, 2024"
                daysLeft={3}
              />
              <DeadlineItem
                title="TechStart Phase 1 Complete"
                date="Dec 18, 2024"
                daysLeft={6}
              />
              <DeadlineItem
                title="Q4 Security Review"
                date="Dec 28, 2024"
                daysLeft={16}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Admin View
 * Focus on: System health, user activity, error counts
 */
export function AdminDashboard() {
  const { data: overview, isLoading } = useDashboardOverview()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          icon={<Server className="h-5 w-5" />}
          label="System Health"
          value="98%"
          trend="All systems normal"
          color="green"
        />
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          label="Active Users"
          value={overview?.team?.active_users ?? 0}
          trend="Last 24 hours"
          color="blue"
        />
        <StatsCard
          icon={<Activity className="h-5 w-5" />}
          label="API Requests"
          value="12.4K"
          trend="Today"
          color="purple"
        />
        <StatsCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Errors"
          value={5}
          trend="Last 24 hours"
          color="red"
          highlight={5 > 0}
        />
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/users">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground">Manage users and permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/system/cache">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Cache Management</h3>
                  <p className="text-sm text-muted-foreground">View and clear system cache</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/system/error-logs">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Error Logs</h3>
                  <p className="text-sm text-muted-foreground">View system errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

// Helper Components

function StatsCard({
  icon,
  label,
  value,
  trend,
  color,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  trend: string
  color: "blue" | "purple" | "green" | "orange" | "red" | "emerald"
  highlight?: boolean
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    green: "bg-green-500/10 text-green-500",
    orange: "bg-orange-500/10 text-orange-500",
    red: "bg-red-500/10 text-red-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
  }

  return (
    <Card className={cn(highlight && "border-red-500/30")}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", colorClasses[color])}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{trend}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectStatusCard({
  status,
  count,
  color,
}: {
  status: string
  count: number
  color: string
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-muted/50">
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm text-muted-foreground">{status}</p>
    </div>
  )
}

function TaskItem({
  title,
  project,
  priority,
  dueIn,
}: {
  title: string
  project: string
  priority: "high" | "medium" | "low"
  dueIn: string
}) {
  const priorityColors = {
    high: "bg-red-500",
    medium: "bg-orange-500",
    low: "bg-blue-500",
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <div className={cn("h-2 w-2 rounded-full", priorityColors[priority])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{project}</p>
      </div>
      <Badge variant="outline" className="shrink-0">{dueIn}</Badge>
    </div>
  )
}

function FindingItem({
  title,
  severity,
  project,
  time,
}: {
  title: string
  severity: "critical" | "high" | "medium" | "low"
  project: string
  time: string
}) {
  const severityColors = {
    critical: "text-red-500 bg-red-500/10",
    high: "text-orange-500 bg-orange-500/10",
    medium: "text-yellow-500 bg-yellow-500/10",
    low: "text-blue-500 bg-blue-500/10",
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <Badge className={severityColors[severity]}>{severity}</Badge>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{project}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </div>
  )
}

function TeamMemberRow({
  name,
  findings,
  rank,
}: {
  name: string
  findings: number
  rank: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
        {rank}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{name}</p>
      </div>
      <Badge variant="secondary">{findings} findings</Badge>
    </div>
  )
}

function DeadlineItem({
  title,
  date,
  daysLeft,
}: {
  title: string
  date: string
  daysLeft: number
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <Badge
        variant={daysLeft <= 3 ? "destructive" : "secondary"}
        className="shrink-0"
      >
        {daysLeft} days
      </Badge>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}
