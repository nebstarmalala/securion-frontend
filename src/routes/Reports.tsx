/**
 * Reports Page
 *
 * Displays all reports with filtering, generation, and export capabilities.
 * Integrated with real API endpoints.
 */

import { useState } from "react"
import { Link } from "react-router-dom"
import {
  FileText,
  Plus,
  Download,
  RefreshCw,
  Search,
  Eye,
  FileType,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ReportCard,
  GenerateReportDialog,
  ReportStatusList,
  SaveReportTemplateDialog,
  ExportDialog,
} from "@/components/reports"
import {
  useReports,
  useDeleteReport,
  useDownloadReport,
  useSavedReportTemplates,
  useDeleteSavedReportTemplate,
} from "@/lib/hooks/useReports"
import type { Report, SavedReportTemplate } from "@/lib/types"
import type { ReportFilters } from "@/lib/api/reports"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("reports")
  const [filters, setFilters] = useState<ReportFilters>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SavedReportTemplate | null>(null)

  // Queries
  const {
    data: reportsData,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useReports(filters)
  const {
    data: templatesData,
    isLoading: templatesLoading,
    refetch: refetchTemplates,
  } = useSavedReportTemplates()

  // Mutations
  const deleteReport = useDeleteReport()
  const downloadReport = useDownloadReport()
  const deleteTemplate = useDeleteSavedReportTemplate()

  // Filter reports by search query
  const filteredReports =
    reportsData?.data.filter(
      (report) =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.project_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  // Separate reports by status
  const activeReports = filteredReports.filter(
    (r) => r.status === "pending" || r.status === "generating"
  )
  const completedReports = filteredReports.filter((r) => r.status === "completed")
  const failedReports = filteredReports.filter((r) => r.status === "failed")

  const handleDownload = async (report: Report) => {
    await downloadReport.mutateAsync({
      reportId: report.id,
      filename: `${report.title}.${report.format}`,
    })
  }

  const handleDeleteReport = async (reportId: string) => {
    await deleteReport.mutateAsync(reportId)
  }

  const handleEditTemplate = (template: SavedReportTemplate) => {
    setEditingTemplate(template)
    setShowSaveTemplateDialog(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplate.mutateAsync(templateId)
  }

  const handleRefresh = () => {
    refetchReports()
    refetchTemplates()
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery("")
  }

  const hasActiveFilters = searchQuery || filters.report_type || filters.format || filters.status

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: "Reports" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              <p className="text-muted-foreground mt-1">
                Generate, manage, and export reports for your projects
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => setShowExportDialog(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={() => setShowGenerateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
                {reportsData && (
                  <Badge variant="secondary" className="ml-1">
                    {reportsData.data.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileType className="h-4 w-4" />
                Templates
                {templatesData && (
                  <Badge variant="secondary" className="ml-1">
                    {templatesData.data.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search reports..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Select
                      value={filters.report_type || "all"}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          report_type: value === "all" ? undefined : (value as any),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.format || "all"}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          format: value === "all" ? undefined : (value as any),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All formats</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.status || "all"}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: value === "all" ? undefined : (value as any),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="generating">Generating</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-2">
                      Search: {searchQuery}
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.report_type && (
                    <Badge variant="secondary" className="gap-2">
                      Type: {filters.report_type}
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, report_type: undefined }))
                        }
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.format && (
                    <Badge variant="secondary" className="gap-2">
                      Format: {filters.format}
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, format: undefined }))
                        }
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge variant="secondary" className="gap-2">
                      Status: {filters.status}
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, status: undefined }))
                        }
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>
              )}

              {/* Active Reports (Generating) */}
              {activeReports.length > 0 && (
                <ReportStatusList
                  reports={activeReports}
                  onComplete={() => refetchReports()}
                />
              )}

              {/* Reports List */}
              {reportsLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-9 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title={hasActiveFilters ? "No reports match your filters" : "No reports yet"}
                  description={
                    hasActiveFilters
                      ? "Try adjusting your search criteria or filters"
                      : "Generate your first penetration testing report to get started"
                  }
                  action={
                    hasActiveFilters ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowGenerateDialog(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    )
                  }
                />
              ) : (
                <div className="space-y-6">
                  {/* Completed Reports */}
                  {completedReports.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Completed ({completedReports.length})
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {completedReports.map((report) => (
                          <ReportCard
                            key={report.id}
                            report={report}
                            onDownload={handleDownload}
                            onDelete={handleDeleteReport}
                            onView={(r) => {}}
                            isDownloading={downloadReport.isPending}
                            isDeleting={deleteReport.isPending}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failed Reports */}
                  {failedReports.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-destructive">
                        Failed ({failedReports.length})
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {failedReports.map((report) => (
                          <ReportCard
                            key={report.id}
                            report={report}
                            onDelete={handleDeleteReport}
                            isDeleting={deleteReport.isPending}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Save your report configurations as templates for quick reuse
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(null)
                    setShowSaveTemplateDialog(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>

              {templatesLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[140px]" />
                  ))}
                </div>
              ) : templatesData?.data.length === 0 ? (
                <EmptyState
                  icon={FileType}
                  title="No templates yet"
                  description="Save your report settings as templates for quick reuse"
                  action={
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingTemplate(null)
                        setShowSaveTemplateDialog(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templatesData?.data.map((template) => (
                    <Card
                      key={template.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {template.is_public ? "Public" : "Private"}
                          </Badge>
                        </div>
                        {template.description && (
                          <CardDescription className="line-clamp-2">
                            {template.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{template.report_type}</span>
                          <span>•</span>
                          <span className="uppercase">{template.format}</span>
                          <span>•</span>
                          <span>Used {template.use_count}x</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditTemplate(template)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          <GenerateReportDialog
            open={showGenerateDialog}
            onOpenChange={setShowGenerateDialog}
            onSuccess={() => refetchReports()}
          />

          <ExportDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            onSuccess={() => {}}
          />

          <SaveReportTemplateDialog
            open={showSaveTemplateDialog}
            onOpenChange={setShowSaveTemplateDialog}
            template={editingTemplate}
            onSuccess={() => {
              refetchTemplates()
              setEditingTemplate(null)
            }}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
