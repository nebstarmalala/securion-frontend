import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { FindingsChart } from "@/components/findings-chart"
import { AffectedServicesTable } from "@/components/affected-services-table"
import { ActivityTimeline } from "@/components/activity-timeline"
import { FolderKanban, AlertTriangle, Shield, TrendingUp } from "lucide-react"
import { mockProjects, mockCVEs, getTotalFindings } from "@/lib/mock-data"

export default function DashboardPage() {
  const activeProjects = mockProjects.filter((p) => p.status === "active").length
  const totalFindings = mockProjects.reduce((acc, project) => acc + getTotalFindings(project), 0)
  const criticalCVEs = mockCVEs.filter((c) => c.status === "affected").length
  const avgCompletion = Math.round(mockProjects.reduce((acc, p) => acc + p.progress, 0) / mockProjects.length)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to Securion</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Projects"
            value={mockProjects.length}
            icon={FolderKanban}
            trend={{ value: 12, isPositive: true }}
            subtitle={`${activeProjects} active`}
          />
          <StatCard
            title="Total Findings"
            value={totalFindings}
            icon={AlertTriangle}
            trend={{ value: 8, isPositive: false }}
            subtitle="Across all projects"
          />
          <StatCard
            title="CVE Alerts"
            value={criticalCVEs}
            icon={Shield}
            subtitle="Requiring attention"
            className="border-destructive/20"
          />
          <StatCard
            title="Completion Rate"
            value={`${avgCompletion}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
            subtitle="Average progress"
          />
        </div>

        {/* Findings Trend Chart */}
        <FindingsChart />

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AffectedServicesTable />
          </div>
          <div>
            <ActivityTimeline />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
