/**
 * Contextual Back Button Component
 * Shows a back button with context-aware label and destination
 */

import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBackNavigation } from "@/lib/hooks/useNavigation"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  /** Override the automatic back navigation with a custom href */
  href?: string
  /** Override the automatic label */
  label?: string
  /** Additional class name */
  className?: string
  /** Variant of the button */
  variant?: "ghost" | "outline" | "default"
  /** Size of the button */
  size?: "sm" | "default" | "lg"
  /** Additional context to append to the label (e.g., project name) */
  contextName?: string
}

export function BackButton({
  href,
  label,
  className,
  variant = "ghost",
  size = "sm",
  contextName
}: BackButtonProps) {
  const backInfo = useBackNavigation()

  // Use provided values or fall back to auto-detected values
  const backHref = href || backInfo?.path
  const backLabel = label || (contextName
    ? `Back to ${contextName}`
    : backInfo?.label || "Back")

  if (!backHref) {
    return null
  }

  return (
    <Link to={backHref}>
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Button>
    </Link>
  )
}

/**
 * Inline back link (no button styling, just a link)
 */
interface BackLinkProps {
  href?: string
  label?: string
  className?: string
  contextName?: string
}

export function BackLink({ href, label, className, contextName }: BackLinkProps) {
  const backInfo = useBackNavigation()

  const backHref = href || backInfo?.path
  const backLabel = label || (contextName
    ? `Back to ${contextName}`
    : backInfo?.label || "Back")

  if (!backHref) {
    return null
  }

  return (
    <Link
      to={backHref}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {backLabel}
    </Link>
  )
}
