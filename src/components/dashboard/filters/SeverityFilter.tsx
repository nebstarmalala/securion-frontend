/**
 * SeverityFilter Component
 *
 * Filter chips for severity levels (Critical, High, Medium, Low, Info).
 * Integrates with DashboardContext for state management.
 */

import { FilterChip } from './FilterChip'
import { useDashboard, SEVERITIES, SEVERITY_COLORS, Severity } from '@/lib/contexts/dashboard-context'

export interface SeverityFilterProps {
  /** Severity counts from API */
  counts?: Record<Severity, number>

  /** Show as a compact row */
  compact?: boolean
}

export function SeverityFilter({ counts, compact = false }: SeverityFilterProps) {
  const { filters, toggleSeverity } = useDashboard()

  const severityData = SEVERITIES.map((severity) => ({
    key: severity,
    label: severity.charAt(0).toUpperCase() + severity.slice(1),
    count: counts?.[severity] ?? 0,
    color: SEVERITY_COLORS[severity],
    active: filters.severities.has(severity),
  }))

  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'space-y-2'}>
      <p className="section-label">Severity</p>
      <div className="flex flex-wrap gap-2">
        {severityData.map((item) => (
          <FilterChip
            key={item.key}
            label={item.label}
            count={item.count}
            active={item.active}
            onClick={() => toggleSeverity(item.key as Severity)}
            color={item.color as any}
          />
        ))}
      </div>
    </div>
  )
}
