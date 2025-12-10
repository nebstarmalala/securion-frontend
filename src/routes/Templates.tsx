/**
 * Templates Page
 *
 * Displays and manages all template types (project, finding, scope).
 * Features a library-style interface with search, filtering, and creation.
 */

import { useState } from "react"
import {
  FolderKanban,
  AlertTriangle,
  Globe,
  Plus,
  Search,
  RefreshCw,
  Filter,
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
import { Card, CardContent } from "@/components/ui/card"
import {
  TemplateCard,
  CreateTemplateDialog,
  UseTemplateDialog,
} from "@/components/templates"
import {
  useProjectTemplates,
  useFindingTemplates,
  useScopeTemplates,
  useDeleteProjectTemplate,
  useDeleteFindingTemplate,
  useDeleteScopeTemplate,
} from "@/lib/hooks/useTemplates"
import type { ProjectTemplate, FindingTemplate, ScopeTemplate } from "@/lib/types"

type TemplateType = "project" | "finding" | "scope"
type Template = ProjectTemplate | FindingTemplate | ScopeTemplate

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<TemplateType>("project")
  const [searchQuery, setSearchQuery] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUseDialog, setShowUseDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [usingTemplate, setUsingTemplate] = useState<Template | null>(null)

  // Queries for each template type
  const {
    data: projectTemplates,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useProjectTemplates()
  const {
    data: findingTemplates,
    isLoading: findingsLoading,
    refetch: refetchFindings,
  } = useFindingTemplates()
  const {
    data: scopeTemplates,
    isLoading: scopesLoading,
    refetch: refetchScopes,
  } = useScopeTemplates()

  // Mutations
  const deleteProjectTemplate = useDeleteProjectTemplate()
  const deleteFindingTemplate = useDeleteFindingTemplate()
  const deleteScopeTemplate = useDeleteScopeTemplate()

  // Get current template data based on active tab
  const getCurrentTemplates = () => {
    switch (activeTab) {
      case "project":
        return projectTemplates?.data || []
      case "finding":
        return findingTemplates?.data || []
      case "scope":
        return scopeTemplates?.data || []
    }
  }

  const isLoading = () => {
    switch (activeTab) {
      case "project":
        return projectsLoading
      case "finding":
        return findingsLoading
      case "scope":
        return scopesLoading
    }
  }

  // Filter templates
  const filteredTemplates = getCurrentTemplates().filter((template) => {
    // Search filter
    const name = "title" in template ? template.title : template.name
    const description = template.description || ""
    const matchesSearch =
      searchQuery === "" ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())

    // Visibility filter
    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "public" && template.is_public) ||
      (visibilityFilter === "private" && !template.is_public)

    return matchesSearch && matchesVisibility
  })

  const handleRefresh = () => {
    refetchProjects()
    refetchFindings()
    refetchScopes()
  }

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setShowCreateDialog(true)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowCreateDialog(true)
  }

  const handleUseTemplate = (template: Template) => {
    setUsingTemplate(template)
    setShowUseDialog(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    switch (activeTab) {
      case "project":
        await deleteProjectTemplate.mutateAsync(templateId)
        break
      case "finding":
        await deleteFindingTemplate.mutateAsync(templateId)
        break
      case "scope":
        await deleteScopeTemplate.mutateAsync(templateId)
        break
    }
  }

  const handleDuplicateTemplate = (template: Template) => {
    // For duplicate, we open create dialog with template data
    setEditingTemplate(null)
    setShowCreateDialog(true)
    // The create dialog will need to be extended to accept initial data
  }

  const clearFilters = () => {
    setSearchQuery("")
    setVisibilityFilter("all")
  }

  const hasActiveFilters = searchQuery || visibilityFilter !== "all"

  const getTabIcon = (type: TemplateType) => {
    switch (type) {
      case "project":
        return FolderKanban
      case "finding":
        return AlertTriangle
      case "scope":
        return Globe
    }
  }

  const getTabLabel = (type: TemplateType) => {
    switch (type) {
      case "project":
        return "Projects"
      case "finding":
        return "Findings"
      case "scope":
        return "Scopes"
    }
  }

  const getTabCount = (type: TemplateType) => {
    switch (type) {
      case "project":
        return projectTemplates?.data.length || 0
      case "finding":
        return findingTemplates?.data.length || 0
      case "scope":
        return scopeTemplates?.data.length || 0
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: "Templates" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Template Library</h1>
              <p className="text-muted-foreground mt-1">
                Reusable templates for projects, findings, and scopes
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TemplateType)}>
            <TabsList>
              {(["project", "finding", "scope"] as TemplateType[]).map((type) => {
                const Icon = getTabIcon(type)
                return (
                  <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {getTabLabel(type)}
                    <Badge variant="secondary" className="ml-1">
                      {getTabCount(type)}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Filters */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select
                    value={visibilityFilter}
                    onValueChange={(value: any) => setVisibilityFilter(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Templates</SelectItem>
                      <SelectItem value="public">Public Only</SelectItem>
                      <SelectItem value="private">Private Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap mt-4">
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
                {visibilityFilter !== "all" && (
                  <Badge variant="secondary" className="gap-2">
                    {visibilityFilter === "public" ? "Public" : "Private"}
                    <button
                      onClick={() => setVisibilityFilter("all")}
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

            {/* Template Lists */}
            {(["project", "finding", "scope"] as TemplateType[]).map((type) => (
              <TabsContent key={type} value={type} className="space-y-4 mt-4">
                {isLoading() ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-[160px]" />
                    ))}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <EmptyState
                    icon={getTabIcon(type)}
                    title={
                      hasActiveFilters
                        ? "No templates match your filters"
                        : `No ${type} templates yet`
                    }
                    description={
                      hasActiveFilters
                        ? "Try adjusting your search criteria or filters"
                        : `Create your first ${type} template to get started`
                    }
                    action={
                      hasActiveFilters ? (
                        <Button variant="outline" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      ) : (
                        <Button onClick={handleCreateTemplate}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create {getTabLabel(type).slice(0, -1)} Template
                        </Button>
                      )
                    }
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        type={type}
                        onUse={handleUseTemplate}
                        onEdit={handleEditTemplate}
                        onDelete={handleDeleteTemplate}
                        onDuplicate={handleDuplicateTemplate}
                        isDeleting={
                          deleteProjectTemplate.isPending ||
                          deleteFindingTemplate.isPending ||
                          deleteScopeTemplate.isPending
                        }
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Dialogs */}
          <CreateTemplateDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            type={activeTab}
            template={editingTemplate}
            onSuccess={() => {
              handleRefresh()
              setEditingTemplate(null)
            }}
          />

          <UseTemplateDialog
            open={showUseDialog}
            onOpenChange={setShowUseDialog}
            template={usingTemplate}
            type={activeTab}
            onSuccess={() => {
              setUsingTemplate(null)
            }}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
