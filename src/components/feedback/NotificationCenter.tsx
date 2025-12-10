import { useState, useCallback, useEffect } from "react";
import { Bell, CheckCheck, X, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
}

interface NotificationCenterProps {
  className?: string;
}

const STORAGE_KEY = "notification-center-items";

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(
          parsed.map((n: Notification) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      } catch (error) {
        console.error("Failed to parse notifications:", error);
      }
    }
  }, []);

  const saveNotifications = useCallback((items: Notification[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setNotifications(items);
  }, []);

  const markAsRead = useCallback(
    (id: string) => {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const removeNotification = useCallback(
    (id: string) => {
      const updated = notifications.filter((n) => n.id !== id);
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} unread
              </p>
            )}
          </div>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-8 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onRemove={() => removeNotification(notification.id)}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
  onClose,
}: NotificationItemProps) {
  const typeIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const typeColors = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  };

  const Icon = typeIcons[notification.type];

  const handleAction = () => {
    if (notification.onAction) {
      notification.onAction();
    }
    onMarkAsRead();
    onClose();
  };

  return (
    <div
      className={cn(
        "p-4 hover:bg-muted/50 transition-colors",
        !notification.read && "bg-muted/30"
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={cn("h-5 w-5", typeColors[notification.type])} />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{notification.title}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <button
                  onClick={onMarkAsRead}
                  className="p-1 hover:bg-muted rounded"
                  title="Mark as read"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={onRemove}
                className="p-1 hover:bg-muted rounded"
                title="Remove"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{notification.message}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(notification.timestamp)}
            </span>
            {notification.actionLabel && (
              <>
                {notification.actionUrl ? (
                  <Link
                    to={notification.actionUrl}
                    onClick={() => {
                      onMarkAsRead();
                      onClose();
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {notification.actionLabel}
                  </Link>
                ) : (
                  <button
                    onClick={handleAction}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {notification.actionLabel}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(
          parsed.map((n: Notification) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      } catch (error) {
        console.error("Failed to parse notifications:", error);
      }
    }
  }, []);

  const addNotification = useCallback(
    (
      notification: Omit<Notification, "id" | "timestamp" | "read">
    ) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        read: false,
      };

      const updated = [newNotification, ...notifications];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setNotifications(updated);

      return newNotification.id;
    },
    [notifications]
  );

  return {
    notifications,
    addNotification,
  };
}
