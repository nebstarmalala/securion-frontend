"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectCard } from "@/components/project-card"
import { NewProjectDialog } from "@/components/new-project-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { mockProjects } from "@/lib/mock-data"
import { Search } from "lucide-react"
import { useState } from "react"

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const openProjects = mockProjects.filter((p) => ["active", "planning", "on-hold"].includes(p.status))
  const completedProjects = mockProjects.filter((p) => p.status === "completed")

  const filterProjects = (projects: typeof mockProjects) => {
    return projects.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
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
          <NewProjectDialog />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

        {/* Tabs */}
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
      </div>
    </DashboardLayout>
  )
}
