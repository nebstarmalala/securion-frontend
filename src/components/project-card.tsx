import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ApiProject } from "@/lib/types/api"
import { getProjectStatusColor, getShortRelativeTime } from "@/lib/style-utils"

interface ProjectCardProps {
  project: ApiProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const client = project.client || "No client"
  const testType = project.test_type || "Not specified"

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
              <CardDescription className="line-clamp-1">{client}</CardDescription>
            </div>
            <Badge variant="outline" className={getProjectStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}

          {/* Date Range */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {new Date(project.start_date).toLocaleDateString('en-US', { timeZone: 'UTC' })} -{" "}
              {new Date(project.end_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
            </span>
          </div>

          {/* Test Type & Last Updated */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {testType}
            </Badge>
            <span className="text-xs text-muted-foreground">{getShortRelativeTime(project.updated_at)}</span>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
