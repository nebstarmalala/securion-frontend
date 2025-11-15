"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  AlertCircle,
  FileText,
  Target,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { useProjectActivities } from "@/hooks"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface ProjectActivityFeedProps {
  projectId: string
}

export function ProjectActivityFeed({ projectId }: ProjectActivityFeedProps) {
  const { data, isLoading, error, refetch } = useProjectActivities(projectId, {
    per_page: 15,
  })

  const activities = data?.data || []

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          <CardDescription>Recent project activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load activity feed"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          <CardDescription>Recent project activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
            <CardDescription>Recent project activity</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Activity will appear here as team members work on the project
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {activities.map((activity: any) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  const { icon, iconColor, actionText } = getActivityMeta(activity)
  const Icon = icon

  const initials = activity.user?.username?.substring(0, 2).toUpperCase() || "U"
  const userName = activity.user?.name || activity.user?.username || "Unknown User"

  return (
    <div className="relative flex gap-4 group">
      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background",
          iconColor
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{userName}</span>{" "}
              <span className="text-muted-foreground">{actionText}</span>
              {activity.subject_type && activity.subject && (
                <>
                  {" "}
                  <span className="font-medium">{activity.subject.title || activity.subject.name}</span>
                </>
              )}
            </p>
            {activity.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {activity.description}
              </p>
            )}
          </div>
          <time className="text-xs text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </time>
        </div>

        {/* Metadata */}
        {activity.properties && Object.keys(activity.properties).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(activity.properties).slice(0, 3).map(([key, value]: [string, any]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {String(value)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getActivityMeta(activity: any): {
  icon: any
  iconColor: string
  actionText: string
} {
  const type = activity.log_name || activity.event || ""
  const description = activity.description?.toLowerCase() || ""

  // Project activities
  if (type.includes("project") || activity.subject_type?.includes("Project")) {
    if (description.includes("created")) {
      return {
        icon: FileText,
        iconColor: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
        actionText: "created project",
      }
    }
    if (description.includes("updated")) {
      return {
        icon: Edit,
        iconColor: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
        actionText: "updated project",
      }
    }
    if (description.includes("deleted")) {
      return {
        icon: Trash2,
        iconColor: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
        actionText: "deleted project",
      }
    }
  }

  // Scope activities
  if (type.includes("scope") || activity.subject_type?.includes("Scope")) {
    if (description.includes("created") || description.includes("added")) {
      return {
        icon: Target,
        iconColor: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
        actionText: "added scope",
      }
    }
    if (description.includes("updated")) {
      return {
        icon: Edit,
        iconColor: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
        actionText: "updated scope",
      }
    }
    if (description.includes("deleted") || description.includes("removed")) {
      return {
        icon: Trash2,
        iconColor: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
        actionText: "removed scope",
      }
    }
  }

  // Finding activities
  if (type.includes("finding") || activity.subject_type?.includes("Finding")) {
    if (description.includes("created") || description.includes("reported")) {
      return {
        icon: AlertTriangle,
        iconColor: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
        actionText: "reported finding",
      }
    }
    if (description.includes("fixed") || description.includes("resolved")) {
      return {
        icon: AlertTriangle,
        iconColor: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
        actionText: "fixed finding",
      }
    }
    if (description.includes("updated")) {
      return {
        icon: Edit,
        iconColor: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
        actionText: "updated finding",
      }
    }
  }

  // Team activities
  if (description.includes("assigned") || description.includes("added user")) {
    return {
      icon: UserPlus,
      iconColor: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      actionText: "added team member",
    }
  }
  if (description.includes("removed user") || description.includes("unassigned")) {
    return {
      icon: UserMinus,
      iconColor: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400",
      actionText: "removed team member",
    }
  }

  // Default
  return {
    icon: Activity,
    iconColor: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400",
    actionText: description || "performed action",
  }
}
