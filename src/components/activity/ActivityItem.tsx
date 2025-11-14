import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Plus,
  Edit,
  Trash2,
  UserPlus,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  FileText,
  FolderOpen,
} from "lucide-react"
import type { Activity } from "@/lib/types/api"

interface ActivityItemProps {
  activity: Activity
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = getActivityIcon(activity.action, activity.resource)

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className={cn(
        "flex-shrink-0 rounded-full p-2",
        getActionColor(activity.action)
      )}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {activity.user.name || activity.user.email}
              </span>
              <span className="text-sm text-muted-foreground">
                {activity.description}
              </span>
            </div>

            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {renderMetadata(activity.metadata)}
              </div>
            )}

            {activity.related_user && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  Assigned to:
                </span>
                <Badge variant="outline" className="text-xs">
                  {activity.related_user.name || activity.related_user.email}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 text-xs text-muted-foreground">
            {activity.timestamp_human}
          </div>
        </div>
      </div>
    </div>
  )
}

function getActivityIcon(action: string, resource: string) {
  if (action === "created") return Plus
  if (action === "updated") return Edit
  if (action === "deleted") return Trash2
  if (action === "assigned") return UserPlus
  if (action === "commented") return MessageSquare
  if (action === "confirmed") return CheckCircle
  if (action === "fixed") return CheckCircle

  // Resource-based icons
  if (resource === "Finding") return AlertCircle
  if (resource === "Project") return FolderOpen
  if (resource === "Scope") return FileText

  return FileText
}

function getActionColor(action: string): string {
  const colorMap: Record<string, string> = {
    created: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    updated: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    deleted: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    assigned: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    commented: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    fixed: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  }

  return colorMap[action] || "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
}

function renderMetadata(metadata: Record<string, any>) {
  const badges = []

  if (metadata.severity) {
    badges.push(
      <Badge
        key="severity"
        variant={getSeverityVariant(metadata.severity)}
        className="text-xs"
      >
        {metadata.severity}
      </Badge>
    )
  }

  if (metadata.status) {
    badges.push(
      <Badge key="status" variant="outline" className="text-xs">
        {metadata.status}
      </Badge>
    )
  }

  if (metadata.old_status && metadata.new_status) {
    badges.push(
      <span key="status-change" className="text-xs text-muted-foreground">
        {metadata.old_status} → {metadata.new_status}
      </span>
    )
  }

  return badges
}

function getSeverityVariant(severity: string): "default" | "destructive" | "secondary" | "outline" {
  if (severity === "critical" || severity === "high") return "destructive"
  if (severity === "medium") return "default"
  return "secondary"
}