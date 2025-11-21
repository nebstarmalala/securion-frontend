/**
 * Quick Filters Component
 * One-click filter presets for common search scenarios
 *
 * Features:
 * - Pre-configured filter buttons
 * - Active filter indicators
 * - Clear all filters
 * - Custom filter chips
 * - Responsive layout
 * - Loading states
 */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Flame,
  Shield,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuickFilters, useExecuteQuickFilter } from "@/lib/hooks/useSearch"
import type { QuickFilter } from "@/lib/api/search"

export interface FilterChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
  icon?: React.ReactNode
  variant?: "default" | "critical" | "high" | "medium" | "low" | "info"
}

/**
 * Filter Chip Component
 * Individual filter badge with remove functionality
 */
export function FilterChip({
  label,
  active = false,
  onClick,
  onRemove,
  icon,
  variant = "default",
}: FilterChipProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    critical: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    info: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 pl-2 pr-1 py-1 cursor-pointer transition-colors border",
        active ? variantStyles[variant] : "hover:bg-accent",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="h-4 w-4 p-0 hover:bg-transparent ml-0.5"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  )
}

/**
 * Quick Filter Button
 */
interface QuickFilterButtonProps {
  filter: QuickFilter
  active?: boolean
  onClick?: () => void
}

function QuickFilterButton({ filter, active, onClick }: QuickFilterButtonProps) {
  const getFilterIcon = (name: string) => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes("critical")) return Flame
    if (lowerName.includes("high")) return AlertCircle
    if (lowerName.includes("recent")) return Clock
    if (lowerName.includes("open")) return XCircle
    if (lowerName.includes("fixed") || lowerName.includes("closed")) return CheckCircle
    if (lowerName.includes("trending")) return TrendingUp
    if (lowerName.includes("cve")) return Shield
    if (lowerName.includes("urgent")) return Zap

    return Filter
  }

  const Icon = getFilterIcon(filter.name)

  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2 transition-all",
        active && "shadow-sm"
      )}
    >
      <Icon className="h-4 w-4" />
      {filter.label}
    </Button>
  )
}

/**
 * Quick Filters Bar Component
 */
export interface QuickFiltersProps {
  onFilterChange?: (filters: Record<string, any>) => void
  className?: string
  showClearAll?: boolean
}

export function QuickFilters({
  onFilterChange,
  className,
  showClearAll = true,
}: QuickFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [customFilters, setCustomFilters] = useState<Record<string, any>>({})

  const { data: quickFilters, isLoading } = useQuickFilters()

  // Execute quick filter when selected
  const handleFilterClick = (filter: QuickFilter) => {
    const newActiveFilters = new Set(activeFilters)

    if (activeFilters.has(filter.name)) {
      newActiveFilters.delete(filter.name)
    } else {
      newActiveFilters.add(filter.name)
    }

    setActiveFilters(newActiveFilters)

    // Notify parent of filter change
    // In a real implementation, you'd combine all active filter params
    onFilterChange?.(
      Array.from(newActiveFilters).reduce((acc, filterName) => {
        const f = quickFilters?.find((qf) => qf.name === filterName)
        if (f) {
          acc[filterName] = true
        }
        return acc
      }, {} as Record<string, any>)
    )
  }

  const handleClearAll = () => {
    setActiveFilters(new Set())
    setCustomFilters({})
    onFilterChange?.({})
  }

  const addCustomFilter = (key: string, value: any, label: string) => {
    setCustomFilters((prev) => ({
      ...prev,
      [key]: { value, label },
    }))

    onFilterChange?.({
      ...Object.fromEntries(Array.from(activeFilters).map((f) => [f, true])),
      ...customFilters,
      [key]: value,
    })
  }

  const removeCustomFilter = (key: string) => {
    const newFilters = { ...customFilters }
    delete newFilters[key]
    setCustomFilters(newFilters)

    onFilterChange?.({
      ...Object.fromEntries(Array.from(activeFilters).map((f) => [f, true])),
      ...newFilters,
    })
  }

  const hasActiveFilters = activeFilters.size > 0 || Object.keys(customFilters).length > 0

  return (
    <div className={cn("space-y-3", className)}>
      {/* Quick Filter Buttons */}
      {isLoading ? (
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-32 bg-muted animate-pulse rounded-md"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {quickFilters?.map((filter) => (
            <QuickFilterButton
              key={filter.name}
              filter={filter}
              active={activeFilters.has(filter.name)}
              onClick={() => handleFilterClick(filter)}
            />
          ))}

          {/* More Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => addCustomFilter("severity", "critical", "Critical")}>
                <Flame className="mr-2 h-4 w-4 text-red-600" />
                Critical Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addCustomFilter("status", "open", "Open")}>
                <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                Open Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addCustomFilter("verified", "true", "Verified")}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Verified Only
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => addCustomFilter("days", "7", "Last 7 Days")}>
                <Clock className="mr-2 h-4 w-4" />
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addCustomFilter("days", "30", "Last 30 Days")}>
                <Clock className="mr-2 h-4 w-4" />
                Last 30 Days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear All Button */}
          {showClearAll && hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {Array.from(activeFilters).map((filterName) => {
            const filter = quickFilters?.find((f) => f.name === filterName)
            if (!filter) return null

            return (
              <FilterChip
                key={filterName}
                label={filter.label}
                active
                onRemove={() => handleFilterClick(filter)}
                icon={<Filter className="h-3 w-3" />}
              />
            )
          })}

          {Object.entries(customFilters).map(([key, { value, label }]) => {
            // Determine variant based on filter type
            let variant: FilterChipProps["variant"] = "default"
            if (key === "severity") {
              variant = value as FilterChipProps["variant"]
            }

            return (
              <FilterChip
                key={key}
                label={label}
                active
                variant={variant}
                onRemove={() => removeCustomFilter(key)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Compact Quick Filters
 * Minimal version with only essential filters
 */
export function CompactQuickFilters({ onFilterChange, className }: QuickFiltersProps) {
  const commonFilters: QuickFilter[] = [
    {
      name: "critical-findings",
      label: "Critical",
      description: "Critical severity findings",
      entity_type: "findings",
    },
    {
      name: "open-findings",
      label: "Open",
      description: "Open findings",
      entity_type: "findings",
    },
    {
      name: "recent",
      label: "Recent",
      description: "Last 7 days",
      entity_type: "all",
    },
  ]

  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const handleFilterClick = (filter: QuickFilter) => {
    const newFilter = activeFilter === filter.name ? null : filter.name
    setActiveFilter(newFilter)
    onFilterChange?.(newFilter ? { [filter.name]: true } : {})
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {commonFilters.map((filter) => (
        <QuickFilterButton
          key={filter.name}
          filter={filter}
          active={activeFilter === filter.name}
          onClick={() => handleFilterClick(filter)}
        />
      ))}
    </div>
  )
}
