/**
 * StatusFilter Component
 *
 * Filter chips for finding status (Open, Confirmed, Fixed, etc.).
 * Integrates with DashboardContext for state management.
 */

import { FilterChip } from './FilterChip'
import { useDashboard, STATUSES, STATUS_COLORS, Status } from '@/lib/contexts/dashboard-context'

export interface StatusFilterProps {
  /** Status counts from API */
  counts?: Record<Status, number>

  /** Show as a compact row */
  compact?: boolean
}

export function StatusFilter({ counts, compact = false }: StatusFilterProps) {
  const { filters, toggleStatus } = useDashboard()

  const statusData = STATUSES.map((status) => ({
    key: status,
    label: status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    count: counts?.[status] ?? 0,
    color: STATUS_COLORS[status],
    active: filters.statuses.has(status),
  }))

  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'space-y-2'}>
      <p className="section-label">Status</p>
      <div className="flex flex-wrap gap-2">
        {statusData.map((item) => (
          <FilterChip
            key={item.key}
            label={item.label}
            count={item.count}
            active={item.active}
            onClick={() => toggleStatus(item.key as Status)}
            color={item.color as any}
          />
        ))}
      </div>
    </div>
  )
}
