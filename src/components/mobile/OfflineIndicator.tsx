import { useOnlineStatus, useOfflineActions } from "@/lib/hooks/useOfflineSupport";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff, Wifi, RefreshCw, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OfflineIndicatorProps {
  className?: string;
  variant?: "banner" | "badge" | "toast";
}

export function OfflineIndicator({
  className,
  variant = "banner",
}: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();
  const { hasPendingActions, pendingActions } = useOfflineActions();

  if (isOnline && !hasPendingActions) return null;

  if (variant === "badge") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
          !isOnline
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
          className
        )}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            <span>Offline</span>
          </>
        ) : (
          <>
            <CloudOff className="h-3.5 w-3.5" />
            <span>{pendingActions.length} pending</span>
          </>
        )}
      </div>
    );
  }

  if (variant === "toast") {
    return (
      <div
        className={cn(
          "fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50",
          "rounded-lg border shadow-lg p-4",
          !isOnline
            ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
            : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {!isOnline ? (
              <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <RefreshCw className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {!isOnline ? "You're offline" : "Syncing..."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {!isOnline
                ? "Changes will be saved when you're back online"
                : `Syncing ${pendingActions.length} pending changes`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Alert
      className={cn(
        !isOnline
          ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {!isOnline ? (
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
          ) : (
            <RefreshCw className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
          )}
        </div>
        <div className="flex-1">
          <AlertTitle>
            {!isOnline ? "You're offline" : "Syncing pending changes"}
          </AlertTitle>
          <AlertDescription>
            {!isOnline
              ? "You can continue working. Your changes will be saved when you're back online."
              : `Syncing ${pendingActions.length} pending ${
                  pendingActions.length === 1 ? "change" : "changes"
                }...`}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

interface NetworkStatusProps {
  className?: string;
}

export function NetworkStatus({ className }: NetworkStatusProps) {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        isOnline ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

interface OfflineActionsListProps {
  className?: string;
  onRetry?: () => void;
  onClear?: () => void;
}

export function OfflineActionsList({
  className,
  onRetry,
  onClear,
}: OfflineActionsListProps) {
  const { pendingActions, hasPendingActions } = useOfflineActions();
  const isOnline = useOnlineStatus();

  if (!hasPendingActions) return null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudOff className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Pending Actions</h3>
        </div>
        {isOnline && onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {pendingActions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between text-xs p-2 rounded bg-muted"
          >
            <div>
              <p className="font-medium">{action.type}</p>
              <p className="text-muted-foreground">
                {new Date(action.timestamp).toLocaleTimeString()}
              </p>
            </div>
            {action.retryCount > 0 && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                Retry {action.retryCount}/3
              </span>
            )}
          </div>
        ))}
      </div>

      {onClear && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          className="w-full h-7 text-xs text-destructive hover:text-destructive"
        >
          Clear All
        </Button>
      )}
    </div>
  );
}

interface OfflineReadyBadgeProps {
  className?: string;
}

export function OfflineReadyBadge({ className }: OfflineReadyBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        className
      )}
    >
      <Wifi className="h-3 w-3" />
      <span>Offline Ready</span>
    </div>
  );
}
