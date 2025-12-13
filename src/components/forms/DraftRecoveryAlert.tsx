import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DraftRecoveryAlertProps {
  savedAt: Date
  onRecover: () => void
  onDismiss: () => void
}

export function DraftRecoveryAlert({
  savedAt,
  onRecover,
  onDismiss,
}: DraftRecoveryAlertProps) {
  return (
    <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
      <Clock className="h-4 w-4 text-blue-500" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-medium">Draft found</p>
          <p className="text-sm text-muted-foreground">
            Saved {formatDistanceToNow(savedAt, { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onRecover}>
            Recover Draft
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss} aria-label="Dismiss draft recovery">
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
