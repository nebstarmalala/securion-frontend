import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { ProjectCard } from "@/components/project-card"
import { NewProjectDialog } from "@/components/new-project-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { projectsService } from "@/lib/api"
import { Search, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

export default function Projects() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await projectsService.getProjects({})
      setProjects(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects")
      console.error("Error fetching projects:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const openProjects = projects.filter((p) => ["active", "planning", "on-hold"].includes(p.status))
  const completedProjects = projects.filter((p) => p.status === "completed")

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

  return (
    <ProtectedRoute permissions={["project-view"]}>
      <DashboardLayout breadcrumbs={[{ label: "Projects" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground">Manage your penetration testing projects</p>
            </div>
            <NewProjectDialog onProjectCreated={fetchProjects} />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
                disabled={loading}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
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
          {loading ? (
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filterProjects(openProjects).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
                {filterProjects(openProjects).length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
                    <p className="text-lg font-medium">No projects found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new project</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filterProjects(completedProjects).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
                {filterProjects(completedProjects).length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
                    <p className="text-lg font-medium">No completed projects</p>
                    <p className="text-sm text-muted-foreground">Completed projects will appear here</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
