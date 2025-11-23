/**
 * Quick Jump Component
 * Allows users to quickly navigate between related entities
 */

import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowUpRight,
  Folder,
  FileText,
  Shield,
  Target,
  LayoutGrid,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuickJump } from "@/lib/hooks/useNavigation"
import { cn } from "@/lib/utils"

const TYPE_ICONS: Record<string, React.ReactNode> = {
  project: <Folder className="h-4 w-4" />,
  projects: <LayoutGrid className="h-4 w-4" />,
  scope: <Target className="h-4 w-4" />,
  finding: <Shield className="h-4 w-4" />,
  "cve-tracking": <Shield className="h-4 w-4" />,
  reports: <FileText className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
}

interface QuickJumpProps {
  className?: string
  /** Additional quick jump targets specific to this page */
  additionalTargets?: Array<{ label: string; href: string; type: string }>
}

export function QuickJump({ className, additionalTargets = [] }: QuickJumpProps) {
  const autoTargets = useQuickJump()
  const allTargets = [...additionalTargets, ...autoTargets]

  if (allTargets.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <ArrowUpRight className="h-4 w-4" />
          Quick Jump
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Navigate to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allTargets.map((target, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link to={target.href} className="flex items-center gap-2">
              {TYPE_ICONS[target.type] || <ArrowUpRight className="h-4 w-4" />}
              {target.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Quick jump as a horizontal list of buttons
 */
interface QuickJumpInlineProps {
  className?: string
  additionalTargets?: Array<{ label: string; href: string; type: string }>
  variant?: "ghost" | "outline" | "link"
  size?: "sm" | "default"
}

export function QuickJumpInline({
  className,
  additionalTargets = [],
  variant = "ghost",
  size = "sm"
}: QuickJumpInlineProps) {
  const autoTargets = useQuickJump()
  const allTargets = [...additionalTargets, ...autoTargets]

  if (allTargets.length === 0) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {allTargets.map((target, index) => (
        <Link key={index} to={target.href}>
          <Button variant={variant} size={size} className="gap-1.5">
            {TYPE_ICONS[target.type] || <ArrowUpRight className="h-3.5 w-3.5" />}
            {target.label}
          </Button>
        </Link>
      ))}
    </div>
  )
}
