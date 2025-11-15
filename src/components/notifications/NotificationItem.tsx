import { useNavigate } from "react-router-dom"
import { useMarkAsRead, useDeleteNotification } from "@/hooks"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, MessageSquare, UserPlus } from "lucide-react"
import type { Notification } from "@/lib/types/api"

interface NotificationItemProps {
  notification: Notification
  compact?: boolean
}

export function NotificationItem({ notification, compact = false }: NotificationItemProps) {
  const navigate = useNavigate()
  const markAsRead = useMarkAsRead()
  const deleteNotification = useDeleteNotification()

  const handleClick = async () => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id)
    }

    // Navigate to the action URL
    if (notification.action_url) {
      navigate(notification.action_url)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteNotification.mutateAsync(notification.id)
  }

  const Icon = getNotificationIcon(notification.type)

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-l-2",
        notification.is_read ? "border-transparent" : "border-primary bg-muted/30",
        compact ? "rounded-none" : "rounded-md"
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "flex-shrink-0 rounded-full p-2",
        getColorClass(notification.color)
      )}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          !notification.is_read && "font-semibold"
        )}>
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(notification.created_at)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 h-8 w-8"
        onClick={handleDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

function getNotificationIcon(type: string) {
  const typeMap: Record<string, any> = {
    finding_created: AlertCircle,
    finding_status_changed: CheckCircle,
    project_assigned: UserPlus,
    comment_mention: MessageSquare,
    comment_reply: MessageSquare,
    cve_critical_match: AlertTriangle,
  }

  return typeMap[type] || Info
}

function getColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  }

  return colorMap[color] || colorMap.gray
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return "Just now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}
