import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderKanban, AlertTriangle, Target, Shield, AlertCircle, User } from "lucide-react"
import { Link } from "react-router-dom"
import { useActivityFeed } from "@/hooks"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Activity } from "@/lib/types/api"

const iconMap: Record<Activity["resource"], React.ComponentType<any>> = {
  Project: FolderKanban,
  Finding: AlertTriangle,
  Scope: Target,
  CveTracking: Shield,
  User: User,
}

const getResourceLink = (resource: string, resourceId: string) => {
  switch (resource) {
    case "Project":
      return `/projects/${resourceId}`
    case "Finding":
      return `/projects/findings/${resourceId}`
    case "Scope":
      return `/projects/scopes/${resourceId}`
    case "CveTracking":
      return `/cve-tracking/${resourceId}`
    default:
      return "#"
  }
}

export function ActivityTimeline() {
  const { data, isLoading, error } = useActivityFeed({ per_page: 8 })

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all projects</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <>
            <div className="space-y-4">
              {data.data.map((activity) => {
                const Icon = iconMap[activity.resource] || FolderKanban
                const resourceLink = getResourceLink(activity.resource, activity.resource_id)

                const username = activity.user?.username || activity.user?.email || "Unknown"
                const initials = username.substring(0, 2).toUpperCase()

                return (
                  <div key={activity.id} className="flex gap-4 group">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm">
                          <span className="font-medium">{username}</span>{" "}
                          <span className="text-muted-foreground">{activity.description}</span>
                        </p>
                      </div>
                      {activity.metadata?.name && (
                        <Link
                          to={resourceLink}
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {activity.metadata.name}
                        </Link>
                      )}
                      <p className="text-xs text-muted-foreground">{activity.timestamp_human}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link to="/activities" className="mt-4 block text-center text-sm text-primary hover:underline">
              View All Activity
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        )}
      </CardContent>
    </Card>
  )
}
