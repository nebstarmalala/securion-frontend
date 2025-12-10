import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectCard } from "@/components/project-card"
import { ProjectWizard } from "@/components/forms/ProjectWizard"
import { EmptyState } from "@/components/empty-state"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useQueryClient } from "@tanstack/react-query"
import { useProjects } from "@/hooks"
import { Search, AlertCircle, FolderKanban, RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function Projects() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()

  // Fetch projects using the useProjects hook
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useProjects({})

  // response is a PaginatedResponse with { data: [], links: {...}, meta: {...} }
  const projects = response?.data || []
  const openProjects = projects.filter((p: any) => ["active", "planning", "on-hold"].includes(p.status))
  const completedProjects = projects.filter((p: any) => p.status === "completed")

  const filterProjects = (projectsList: any[]) => {
    return projectsList.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }

  const handleProjectCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    toast.success("Project created successfully", {
      description: "Your new project has been added to the list.",
    })
  }

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: "Refreshing projects...",
      success: "Projects refreshed successfully",
      error: "Failed to refresh projects",
    })
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Projects" }]}>
      <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground">Manage your penetration testing projects</p>
            </div>
            <div className="flex gap-2">
              {!isLoading && (
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              )}
              <ProjectWizard onProjectCreated={handleProjectCreated} />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error loading projects</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error instanceof Error ? error.message : "Failed to load projects"}</span>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex gap-4 border-b">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4 rounded-lg border p-6">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          ) : projects.length === 0 ? (
            /* Empty State - No projects at all */
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Get started by creating your first penetration testing project. You can add scopes, findings, and generate reports."
              action={<ProjectWizard onProjectCreated={handleProjectCreated} />}
            />
          ) : (
            /* Tabs */
            <Tabs defaultValue="open" className="space-y-6">
              <TabsList>
                <TabsTrigger value="open" className="gap-2">
                  Open Projects
                  <Badge variant="secondary">{openProjects.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  Completed
                  <Badge variant="secondary">{completedProjects.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="open" className="space-y-6">
                {filterProjects(openProjects).length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title={searchQuery || statusFilter !== "all" ? "No projects match your filters" : "No open projects"}
                    description={
                      searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search criteria or filters"
                        : "Create a new project to get started"
                    }
                    action={
                      searchQuery || statusFilter !== "all" ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("")
                            setStatusFilter("all")
                          }}
                        >
                          Clear Filters
                        </Button>
                      ) : (
                        <ProjectWizard onProjectCreated={handleProjectCreated} />
                      )
                    }
                  />
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filterProjects(openProjects).map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                {filterProjects(completedProjects).length === 0 ? (
                  <EmptyState
                    icon={FolderKanban}
                    title={
                      searchQuery || statusFilter !== "all" ? "No projects match your filters" : "No completed projects"
                    }
                    description={
                      searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "Completed projects will appear here once you mark them as complete"
                    }
                    action={
                      searchQuery || statusFilter !== "all" ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("")
                            setStatusFilter("all")
                          }}
                        >
                          Clear Filters
                        </Button>
                      ) : null
                    }
                  />
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filterProjects(completedProjects).map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
    </DashboardLayout>
  )
}
