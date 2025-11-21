import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type ReactNode } from "react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * EmptyState Component
 * Displays a consistent empty state across the application
 */
export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-12 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <Icon className="h-10 w-10 text-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
