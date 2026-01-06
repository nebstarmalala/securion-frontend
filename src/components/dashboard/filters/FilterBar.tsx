/**
 * FilterBar Component
 *
 * Combined filter bar with date range, severity, and status filters.
 * Sticky positioning on scroll for easy access.
 */

import { DateRangeSelector } from './DateRangeSelector'
import { SeverityFilter } from './SeverityFilter'
import { StatusFilter } from './StatusFilter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import { useDashboard } from '@/lib/contexts/dashboard-context'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export interface FilterBarProps {
  /** Severity counts from dashboard data */
  severityCounts?: Record<string, number>

  /** Status counts from dashboard data */
  statusCounts?: Record<string, number>

  /** Sticky positioning */
  sticky?: boolean

  /** Show as mobile drawer on small screens */
  mobileDrawer?: boolean
}

export function FilterBar({
  severityCounts,
  statusCounts,
  sticky = false,
  mobileDrawer = true,
}: FilterBarProps) {
  const { clearFilters, isFiltering, activeFilterCount } = useDashboard()

  const filterContent = (
    <div className="space-y-6">
      <DateRangeSelector />
      <SeverityFilter counts={severityCounts as any} />
      <StatusFilter counts={statusCounts as any} />
    </div>
  )

  return (
    <>
      {/* Desktop: Horizontal Filter Bar */}
      <div
        className={cn(
          'hidden md:block',
          'border border-border/50 bg-card/50 backdrop-blur-md rounded-lg p-6',
          sticky && 'sticky top-20 z-10'
        )}
      >
        <div className="flex items-start justify-between gap-6">
          {/* Filters */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DateRangeSelector compact />
            <SeverityFilter counts={severityCounts as any} compact />
            <StatusFilter counts={statusCounts as any} compact />
          </div>

          {/* Clear Filters Button */}
          {isFiltering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filter Count */}
        {isFiltering && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="mr-2">
                {activeFilterCount}
              </Badge>
              {activeFilterCount === 1 ? 'filter' : 'filters'} active
            </p>
          </div>
        )}
      </div>

      {/* Mobile: Filter Drawer */}
      {mobileDrawer && (
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-border/50 bg-card/50"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-primary/10 text-primary border-primary/20"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Filter dashboard data by date range, severity, and status
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {filterContent}
                {isFiltering && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  )
}
