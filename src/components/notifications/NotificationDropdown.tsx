import { useUnreadNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks"
import { NotificationList } from "./NotificationList"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function NotificationDropdown() {
  const navigate = useNavigate()
  const { data: notifications, isLoading } = useUnreadNotifications({ per_page: 10 })
  const markAllAsRead = useMarkAllAsRead()

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync()
  }

  const handleViewAll = () => {
    navigate("/notifications")
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {notifications && notifications.data.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <Separator className="my-2" />

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications && notifications.data.length > 0 ? (
          <NotificationList notifications={notifications.data} compact />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No unread notifications
          </div>
        )}
      </div>

      <Separator className="my-2" />

      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={handleViewAll}
        >
          View all notifications
        </Button>
      </div>
    </div>
  )
}
