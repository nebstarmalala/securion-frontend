import { NotificationItem } from "./NotificationItem"
import type { Notification } from "@/lib/types/api"

interface NotificationListProps {
  notifications: Notification[]
  compact?: boolean
}

export function NotificationList({ notifications, compact = false }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No notifications to display
      </div>
    )
  }

  // Group notifications by date if not compact
  if (!compact) {
    const groupedNotifications = groupByDate(notifications)

    return (
      <div className="space-y-4">
        {Object.entries(groupedNotifications).map(([date, items]) => (
          <div key={date}>
            <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground">
              {date}
            </h3>
            <div className="space-y-1">
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          compact={compact}
        />
      ))}
    </div>
  )
}

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {}

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let label: string

    if (isSameDay(date, today)) {
      label = "Today"
    } else if (isSameDay(date, yesterday)) {
      label = "Yesterday"
    } else if (isWithinDays(date, 7)) {
      label = "This Week"
    } else {
      label = "Older"
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(notification)
  })

  return groups
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isWithinDays(date: Date, days: number): boolean {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= days
}
