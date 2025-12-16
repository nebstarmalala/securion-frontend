/**
 * Workflows Page
 *
 * Manages workflow automations for the security dashboard.
 * Allows creation, editing, testing, and monitoring of automated workflows.
 */

import { useState } from "react"
import {
  Workflow,
  Plus,
  Search,
  RefreshCw,
  Filter,
  Play,
  Pause,
  TestTube,
  History,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useWorkflows,
  useCreateWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
  useToggleWorkflow,
  useTestWorkflow,
  useWorkflowExecutionStats,
  useAllWorkflowExecutions,
} from "@/lib/hooks/useWorkflows"
import type { Workflow as WorkflowType, CreateWorkflowInput } from "@/lib/types"

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<"workflows" | "executions" | "stats">("workflows")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [triggerFilter, setTriggerFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowType | null>(null)
  const [testingWorkflow, setTestingWorkflow] = useState<WorkflowType | null>(null)

  // Queries
  const { data: workflowsData, isLoading, refetch } = useWorkflows()
  const { data: statsData, isLoading: statsLoading } = useWorkflowExecutionStats()
  const { data: executionsData, isLoading: executionsLoading } = useAllWorkflowExecutions()

  // Mutations
  const createWorkflow = useCreateWorkflow()
  const updateWorkflow = useUpdateWorkflow()
  const deleteWorkflow = useDeleteWorkflow()
  const toggleWorkflow = useToggleWorkflow()
  const testWorkflow = useTestWorkflow()

  const workflows = workflowsData?.data || []
  const executions = executionsData?.data || []

  // Filter workflows
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      searchQuery === "" ||
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && workflow.is_active) ||
      (statusFilter === "inactive" && !workflow.is_active)

    const matchesTrigger = triggerFilter === "all" || workflow.trigger === triggerFilter

    return matchesSearch && matchesStatus && matchesTrigger
  })

  const handleToggle = async (workflowId: string) => {
    await toggleWorkflow.mutateAsync(workflowId)
  }

  const handleDelete = async (workflowId: string) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      await deleteWorkflow.mutateAsync(workflowId)
    }
  }

  const handleTest = (workflow: WorkflowType) => {
    setTestingWorkflow(workflow)
  }

  const runTest = async () => {
    if (!testingWorkflow) return
    await testWorkflow.mutateAsync({
      workflowId: testingWorkflow.id,
      input: {
        trigger_data: {
          // Sample test data
          finding_id: "test-123",
          severity: "high",
          status: "open",
        },
      },
    })
    setTestingWorkflow(null)
  }

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      finding_created: "Finding Created",
      finding_updated: "Finding Updated",
      project_created: "Project Created",
      status_changed: "Status Changed",
    }
    return labels[trigger] || trigger
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTriggerFilter("all")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || triggerFilter !== "all"

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: "Workflows" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workflow Automation</h1>
              <p className="text-muted-foreground mt-1">
                Automate tasks based on triggers and conditions
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflows.length}</div>
                <p className="text-xs text-muted-foreground">
                  {workflows.filter((w) => w.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData?.total_executions || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsData?.total_executions
                    ? Math.round((statsData.successful / statsData.total_executions) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.successful || 0} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsData?.average_duration_ms
                    ? `${Math.round(statsData.average_duration_ms)}ms`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Per execution</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Workflows
                <Badge variant="secondary">{workflows.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="executions" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Executions
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Workflows Tab */}
            <TabsContent value="workflows" className="space-y-4 mt-4">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search workflows..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={triggerFilter} onValueChange={setTriggerFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Triggers</SelectItem>
                        <SelectItem value="finding_created">Finding Created</SelectItem>
                        <SelectItem value="finding_updated">Finding Updated</SelectItem>
                        <SelectItem value="project_created">Project Created</SelectItem>
                        <SelectItem value="status_changed">Status Changed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Workflows List */}
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[120px]" />
                  ))}
                </div>
              ) : filteredWorkflows.length === 0 ? (
                <EmptyState
                  icon={Workflow}
                  title={hasActiveFilters ? "No workflows match your filters" : "No workflows yet"}
                  description={
                    hasActiveFilters
                      ? "Try adjusting your search criteria or filters"
                      : "Create your first workflow to automate tasks"
                  }
                  action={
                    hasActiveFilters ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Workflow
                      </Button>
                    )
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredWorkflows.map((workflow) => (
                    <Card key={workflow.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{workflow.name}</h3>
                              <Badge variant={workflow.is_active ? "default" : "secondary"}>
                                {workflow.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {workflow.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {workflow.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {getTriggerLabel(workflow.trigger)}
                              </span>
                              <span>
                                {workflow.conditions.length} condition(s)
                              </span>
                              <span>
                                {workflow.actions.length} action(s)
                              </span>
                              <span>
                                {workflow.execution_count} executions
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={workflow.is_active}
                              onCheckedChange={() => handleToggle(workflow.id)}
                            />

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleTest(workflow)}>
                                  <TestTube className="mr-2 h-4 w-4" />
                                  Test Workflow
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingWorkflow(workflow)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(workflow.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Executions Tab */}
            <TabsContent value="executions" className="space-y-4 mt-4">
              {executionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-[80px]" />
                  ))}
                </div>
              ) : executions.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No executions yet"
                  description="Workflow executions will appear here once workflows are triggered"
                />
              ) : (
                <div className="space-y-2">
                  {executions.map((execution) => (
                    <Card key={execution.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(execution.status)}
                            <div>
                              <p className="font-medium">{execution.workflow_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(execution.started_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                execution.status === "completed"
                                  ? "default"
                                  : execution.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {execution.status}
                            </Badge>
                            {execution.duration_ms && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {execution.duration_ms}ms
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Execution Statistics</CardTitle>
                  <CardDescription>Overview of workflow performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-[200px]" />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Successful Executions</p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-green-500"
                                style={{
                                  width: `${
                                    statsData?.total_executions
                                      ? (statsData.successful / statsData.total_executions) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {statsData?.successful || 0}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Failed Executions</p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-red-500"
                                style={{
                                  width: `${
                                    statsData?.total_executions
                                      ? (statsData.failed / statsData.total_executions) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{statsData?.failed || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Test Workflow Dialog */}
          <Dialog open={!!testingWorkflow} onOpenChange={() => setTestingWorkflow(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Workflow</DialogTitle>
                <DialogDescription>
                  Test "{testingWorkflow?.name}" with sample data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Data (JSON)</Label>
                  <Textarea
                    placeholder='{"finding_id": "test-123", "severity": "high"}'
                    className="font-mono text-sm"
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTestingWorkflow(null)}>
                  Cancel
                </Button>
                <Button onClick={runTest} disabled={testWorkflow.isPending}>
                  {testWorkflow.isPending ? "Testing..." : "Run Test"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create/Edit Workflow Dialog - Placeholder */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Workflow</DialogTitle>
                <DialogDescription>
                  Define triggers, conditions, and actions for your workflow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="My Workflow" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe what this workflow does..." />
                </div>
                <div className="space-y-2">
                  <Label>Trigger</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="finding_created">Finding Created</SelectItem>
                      <SelectItem value="finding_updated">Finding Updated</SelectItem>
                      <SelectItem value="project_created">Project Created</SelectItem>
                      <SelectItem value="status_changed">Status Changed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full workflow builder with conditions and actions will be available in the next update.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button disabled>Create Workflow</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
