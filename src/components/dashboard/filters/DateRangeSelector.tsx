/**
 * DateRangeSelector Component
 *
 * Allows users to select date ranges using presets or custom dates.
 * Integrates with DashboardContext for state management.
 */

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from 'lucide-react'
import { useDashboard, DATE_RANGE_PRESETS } from '@/lib/contexts/dashboard-context'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface DateRangeSelectorProps {
  /** Compact mode (no label) */
  compact?: boolean
}

export function DateRangeSelector({ compact = false }: DateRangeSelectorProps) {
  const { filters, setDateRange } = useDashboard()

  const presets = [
    { label: 'Today', getValue: DATE_RANGE_PRESETS.today },
    { label: 'Yesterday', getValue: DATE_RANGE_PRESETS.yesterday },
    { label: 'Last 7 days', getValue: DATE_RANGE_PRESETS.last7Days },
    { label: 'Last 30 days', getValue: DATE_RANGE_PRESETS.last30Days },
    { label: 'Last 90 days', getValue: DATE_RANGE_PRESETS.last90Days },
    { label: 'This month', getValue: DATE_RANGE_PRESETS.thisMonth },
    { label: 'Last month', getValue: DATE_RANGE_PRESETS.lastMonth },
  ]

  const formatDateRange = () => {
    const { start, end } = filters.dateRange
    const today = new Date()
    const isToday =
      start.toDateString() === today.toDateString() &&
      end.toDateString() === today.toDateString()

    if (isToday) {
      return 'Today'
    }

    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 7) {
      return 'Last 7 days'
    } else if (diffDays === 30) {
      return 'Last 30 days'
    } else if (diffDays === 90) {
      return 'Last 90 days'
    }

    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  return (
    <div className={cn(!compact && 'space-y-2')}>
      {!compact && <p className="section-label">Date Range</p>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start gap-2 border-border/50 bg-card/50',
              'hover:border-primary/30 hover:bg-primary/5'
            )}
          >
            <Calendar className="h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-2">
            <p className="section-label mb-3">Select Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start hover:bg-primary/10 hover:text-primary"
                  onClick={() => {
                    const range = preset.getValue()
                    setDateRange(range)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            {/* TODO: Add custom date picker in Phase 3 */}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
