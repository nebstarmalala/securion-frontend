"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { Project } from "@/lib/mock-data"
import { getStatusColor, getSeverityColor, getUserById, getTotalFindings } from "@/lib/mock-data"
import { Calendar, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const totalFindings = getTotalFindings(project)
  const teamMembers = project.team.map((id) => getUserById(id)).filter(Boolean)

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
              <CardDescription className="line-clamp-1">{project.client}</CardDescription>
            </div>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

          {/* Date Range & Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1.5" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{project.scopeCount} scopes</span>
            </div>
            <div className="flex items-center gap-1">
              {project.findingsCount.critical > 0 && (
                <Badge variant="outline" className={cn("h-5 px-1.5 text-xs", getSeverityColor("critical"))}>
                  {project.findingsCount.critical}
                </Badge>
              )}
              {project.findingsCount.high > 0 && (
                <Badge variant="outline" className={cn("h-5 px-1.5 text-xs", getSeverityColor("high"))}>
                  {project.findingsCount.high}
                </Badge>
              )}
              {project.findingsCount.medium > 0 && (
                <Badge variant="outline" className={cn("h-5 px-1.5 text-xs", getSeverityColor("medium"))}>
                  {project.findingsCount.medium}
                </Badge>
              )}
              {totalFindings === 0 && <span className="text-xs text-muted-foreground">No findings</span>}
            </div>
          </div>

          {/* Team & Tags */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 4).map((member) => (
                <Avatar key={member?.id} className="h-7 w-7 border-2 border-background">
                  <AvatarImage src={member?.avatar || "/placeholder.svg"} alt={member?.name} />
                  <AvatarFallback className="text-xs">
                    {member?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 4 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{project.team.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{project.lastUpdated}</span>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
