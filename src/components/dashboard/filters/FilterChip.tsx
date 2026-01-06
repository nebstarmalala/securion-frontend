/**
 * FilterChip Component
 *
 * Reusable chip component for filtering dashboard data.
 * Used for severity, status, and other filter types.
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface FilterChipProps {
  /** Chip label */
  label: string

  /** Count/badge number */
  count?: number

  /** Active state */
  active: boolean

  /** Click handler */
  onClick: () => void

  /** Color variant */
  color?: 'rose' | 'orange' | 'amber' | 'emerald' | 'blue' | 'gray' | 'purple'

  /** Show close button */
  showClose?: boolean

  /** Disabled state */
  disabled?: boolean
}

export function FilterChip({
  label,
  count,
  active,
  onClick,
  color = 'emerald',
  showClose = false,
  disabled = false,
}: FilterChipProps) {
  const colorClasses = {
    rose: active
      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      : 'border-border/50 hover:border-rose-500/30 hover:bg-rose-500/5',
    orange: active
      ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      : 'border-border/50 hover:border-orange-500/30 hover:bg-orange-500/5',
    amber: active
      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      : 'border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5',
    emerald: active
      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      : 'border-border/50 hover:border-primary/30 hover:bg-primary/5',
    blue: active
      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      : 'border-border/50 hover:border-blue-500/30 hover:bg-blue-500/5',
    gray: active
      ? 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      : 'border-border/50 hover:border-gray-500/30 hover:bg-gray-500/5',
    purple: active
      ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      : 'border-border/50 hover:border-purple-500/30 hover:bg-purple-500/5',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
        'border bg-card/50 transition-all',
        colorClasses[color],
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:shadow-sm'
      )}
      aria-pressed={active}
      aria-label={`Filter by ${label}`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <Badge
          variant="secondary"
          className={cn(
            'h-4 px-1.5 text-[10px] font-bold',
            active && 'bg-current/10 text-current border-current/20'
          )}
        >
          {count}
        </Badge>
      )}
      {showClose && active && <X className="h-3 w-3 ml-0.5" />}
    </button>
  )
}
