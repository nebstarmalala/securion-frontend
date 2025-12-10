import { useOnlineStatus } from "@/lib/hooks/useOfflineSupport"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, Wifi } from "lucide-react"
import { useEffect, useState } from "react"

export function NetworkStatus() {
  const isOnline = useOnlineStatus()
  const [showOffline, setShowOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true)
      setShowReconnected(false)
    } else if (showOffline) {
      // Was offline, now back online
      setShowOffline(false)
      setShowReconnected(true)

      // Hide reconnected message after 3 seconds
      const timer = setTimeout(() => {
        setShowReconnected(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, showOffline])

  if (!showOffline && !showReconnected) {
    return null
  }

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-50 w-auto max-w-sm animate-in slide-in-from-bottom-5">
      {showOffline && (
        <Alert variant="destructive" className="shadow-lg">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="font-medium">
            You're offline. Changes will sync when reconnected.
          </AlertDescription>
        </Alert>
      )}

      {showReconnected && (
        <Alert className="shadow-lg border-green-500 bg-green-500/10">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="font-medium text-green-600">
            You're back online!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
