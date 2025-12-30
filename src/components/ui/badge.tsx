import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md border px-2.5 py-0.5',
    'text-xs font-semibold w-fit whitespace-nowrap shrink-0',
    '[&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-transparent bg-primary text-primary-foreground',
          'hover:bg-primary/90',
        ],
        secondary: [
          'border-transparent bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
        ],
        destructive: [
          'border-transparent bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
        ],
        outline: [
          'text-foreground border-border bg-transparent',
          'hover:bg-accent hover:text-accent-foreground',
        ],
        // Severity badges for security findings
        critical: [
          'border-transparent bg-red-600 text-white',
          'dark:bg-red-500',
          'shadow-sm shadow-red-500/20',
        ],
        high: [
          'border-transparent bg-orange-500 text-white',
          'dark:bg-orange-400 dark:text-orange-950',
          'shadow-sm shadow-orange-500/20',
        ],
        medium: [
          'border-transparent bg-yellow-500 text-yellow-950',
          'dark:bg-yellow-400',
          'shadow-sm shadow-yellow-500/20',
        ],
        low: [
          'border-transparent bg-blue-500 text-white',
          'dark:bg-blue-400 dark:text-blue-950',
          'shadow-sm shadow-blue-500/20',
        ],
        info: [
          'border-transparent bg-slate-500 text-white',
          'dark:bg-slate-400 dark:text-slate-950',
        ],
        // Status badges
        success: [
          'border-transparent bg-green-600 text-white',
          'dark:bg-green-500',
        ],
        warning: [
          'border-transparent bg-yellow-600 text-white',
          'dark:bg-yellow-500 dark:text-yellow-950',
        ],
        // Soft/subtle variants
        'critical-soft': [
          'border-red-200 bg-red-50 text-red-700',
          'dark:border-red-900 dark:bg-red-950/50 dark:text-red-400',
        ],
        'high-soft': [
          'border-orange-200 bg-orange-50 text-orange-700',
          'dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-400',
        ],
        'medium-soft': [
          'border-yellow-200 bg-yellow-50 text-yellow-700',
          'dark:border-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-400',
        ],
        'low-soft': [
          'border-blue-200 bg-blue-50 text-blue-700',
          'dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400',
        ],
        'success-soft': [
          'border-green-200 bg-green-50 text-green-700',
          'dark:border-green-900 dark:bg-green-950/50 dark:text-green-400',
        ],
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-px text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
      pulse: {
        true: 'animate-pulse-subtle',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      pulse: false,
    },
  },
)

export interface BadgeProps
  extends React.ComponentProps<'span'>,
  VariantProps<typeof badgeVariants> {
  asChild?: boolean
  /** Show a colored dot indicator */
  dot?: boolean
}

function Badge({
  className,
  variant,
  size,
  pulse,
  asChild = false,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, pulse }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'size-1.5 rounded-full bg-current',
            pulse && 'animate-pulse'
          )}
        />
      )}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
