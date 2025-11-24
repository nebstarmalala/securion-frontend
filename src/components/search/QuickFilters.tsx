/**
 * Quick Filters Component
 * Pre-defined filter buttons for list pages
 */

import { useState } from "react"
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Star,
  Flame,
  Eye,
  UserCheck,
  Calendar,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface QuickFilter {
  id: string
  label: string
  icon?: React.ReactNode
  description?: string
  filter: Record<string, any>
  color?: "default" | "destructive" | "warning" | "success" | "info"
}

interface QuickFiltersProps {
  filters: QuickFilter[]
  activeFilterId?: string | null
  onFilterSelect: (filter: QuickFilter | null) => void
  className?: string
}

const COLOR_CLASSES = {
  default: "hover:bg-accent",
  destructive: "hover:bg-red-500/10 data-[active=true]:bg-red-500/10 data-[active=true]:text-red-600 data-[active=true]:border-red-500/30",
  warning: "hover:bg-orange-500/10 data-[active=true]:bg-orange-500/10 data-[active=true]:text-orange-600 data-[active=true]:border-orange-500/30",
  success: "hover:bg-green-500/10 data-[active=true]:bg-green-500/10 data-[active=true]:text-green-600 data-[active=true]:border-green-500/30",
  info: "hover:bg-blue-500/10 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-600 data-[active=true]:border-blue-500/30",
}

export function QuickFilters({
  filters,
  activeFilterId,
  onFilterSelect,
  className,
}: QuickFiltersProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground shrink-0">Quick filters:</span>
      <ScrollArea className="max-w-full">
        <div className="flex gap-2">
          {filters.map((filter) => {
            const isActive = activeFilterId === filter.id
            return (
              <TooltipProvider key={filter.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-active={isActive}
                      className={cn(
                        "gap-1.5 shrink-0 transition-colors",
                        COLOR_CLASSES[filter.color || "default"],
                        isActive && "border-primary"
                      )}
                      onClick={() => onFilterSelect(isActive ? null : filter)}
                    >
                      {filter.icon}
                      {filter.label}
                      {isActive && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  {filter.description && (
                    <TooltipContent>
                      <p>{filter.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

// Pre-defined quick filters for different entity types

export const FINDING_QUICK_FILTERS: QuickFilter[] = [
  {
    id: "critical-high",
    label: "Critical & High",
    icon: <Flame className="h-4 w-4" />,
    description: "Show only critical and high severity findings",
    filter: { severity: ["critical", "high"] },
    color: "destructive",
  },
  {
    id: "open",
    label: "Open",
    icon: <AlertCircle className="h-4 w-4" />,
    description: "Show only open findings",
    filter: { status: "open" },
    color: "warning",
  },
  {
    id: "my-findings",
    label: "Assigned to Me",
    icon: <UserCheck className="h-4 w-4" />,
    description: "Show findings assigned to you",
    filter: { assignee: "me" },
    color: "info",
  },
  {
    id: "recent",
    label: "Recent",
    icon: <Clock className="h-4 w-4" />,
    description: "Findings from the last 7 days",
    filter: { dateRange: "week" },
    color: "default",
  },
  {
    id: "fixed",
    label: "Fixed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Show fixed findings",
    filter: { status: "fixed" },
    color: "success",
  },
]

export const PROJECT_QUICK_FILTERS: QuickFilter[] = [
  {
    id: "active",
    label: "Active",
    icon: <Eye className="h-4 w-4" />,
    description: "Show active projects",
    filter: { status: "active" },
    color: "success",
  },
  {
    id: "my-projects",
    label: "My Projects",
    icon: <UserCheck className="h-4 w-4" />,
    description: "Projects you're assigned to",
    filter: { assignee: "me" },
    color: "info",
  },
  {
    id: "overdue",
    label: "Overdue",
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "Projects past their deadline",
    filter: { overdue: true },
    color: "destructive",
  },
  {
    id: "recent",
    label: "Recent",
    icon: <Clock className="h-4 w-4" />,
    description: "Recently updated projects",
    filter: { dateRange: "week" },
    color: "default",
  },
]

export const CVE_QUICK_FILTERS: QuickFilter[] = [
  {
    id: "critical",
    label: "Critical",
    icon: <Flame className="h-4 w-4" />,
    description: "Critical severity CVEs",
    filter: { severity: "critical" },
    color: "destructive",
  },
  {
    id: "high",
    label: "High",
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "High severity CVEs",
    filter: { severity: "high" },
    color: "warning",
  },
  {
    id: "recent",
    label: "New This Week",
    icon: <Clock className="h-4 w-4" />,
    description: "CVEs published this week",
    filter: { dateRange: "week" },
    color: "info",
  },
  {
    id: "unmatched",
    label: "Unmatched",
    icon: <AlertCircle className="h-4 w-4" />,
    description: "CVEs not yet matched to services",
    filter: { matched: false },
    color: "default",
  },
]

export const REPORT_QUICK_FILTERS: QuickFilter[] = [
  {
    id: "draft",
    label: "Drafts",
    icon: <Clock className="h-4 w-4" />,
    description: "Reports in draft status",
    filter: { status: "draft" },
    color: "default",
  },
  {
    id: "pending-review",
    label: "Pending Review",
    icon: <Eye className="h-4 w-4" />,
    description: "Reports waiting for review",
    filter: { status: "pending_review" },
    color: "warning",
  },
  {
    id: "published",
    label: "Published",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Published reports",
    filter: { status: "published" },
    color: "success",
  },
]

/**
 * Hook to manage quick filter state
 */
export function useQuickFilterState<T extends QuickFilter>() {
  const [activeFilter, setActiveFilter] = useState<T | null>(null)

  const handleFilterSelect = (filter: T | null) => {
    setActiveFilter(filter)
  }

  const clearFilter = () => {
    setActiveFilter(null)
  }

  return {
    activeFilter,
    activeFilterId: activeFilter?.id || null,
    handleFilterSelect,
    clearFilter,
    filterParams: activeFilter?.filter || {},
  }
}
