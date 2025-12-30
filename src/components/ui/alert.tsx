import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  [
    'relative w-full rounded-lg border p-4',
    'flex gap-3 items-start',
    'transition-all duration-200 ease-out',
    '[&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:mt-0.5',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-card text-card-foreground border-border',
          '[&>svg]:text-muted-foreground',
        ],
        destructive: [
          'bg-destructive/10 text-destructive border-destructive/30',
          'dark:bg-destructive/20 dark:border-destructive/40',
          '[&>svg]:text-destructive',
        ],
        success: [
          'bg-green-50 text-green-800 border-green-200',
          'dark:bg-green-950/30 dark:text-green-400 dark:border-green-900',
          '[&>svg]:text-green-600 dark:[&>svg]:text-green-500',
        ],
        warning: [
          'bg-yellow-50 text-yellow-800 border-yellow-200',
          'dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900',
          '[&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-500',
        ],
        info: [
          'bg-blue-50 text-blue-800 border-blue-200',
          'dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900',
          '[&>svg]:text-blue-600 dark:[&>svg]:text-blue-500',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const alertIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
}

interface AlertProps
  extends React.ComponentProps<'div'>,
  VariantProps<typeof alertVariants> {
  /** Show the default icon for the variant */
  showIcon?: boolean
  /** Allow the alert to be dismissed */
  dismissible?: boolean
  /** Callback when dismissed */
  onDismiss?: () => void
}

function Alert({
  className,
  variant = 'default',
  showIcon = true,
  dismissible = false,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false)
  const Icon = alertIcons[variant ?? 'default']

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (dismissed) return null

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant }),
        'animate-in fade-in-0 slide-in-from-top-2 duration-300',
        className
      )}
      {...props}
    >
      {showIcon && <Icon />}
      <div className="flex-1 min-w-0">{children}</div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={cn(
            'shrink-0 rounded-md p-1 opacity-70 transition-opacity',
            'hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/50',
          )}
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>) {
  return (
    <h5
      data-slot="alert-title"
      className={cn(
        'font-semibold leading-tight tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-sm opacity-90 mt-1 leading-relaxed [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}

/** Action buttons container for alerts */
function AlertActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-actions"
      className={cn('flex items-center gap-2 mt-3', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertActions, alertVariants }
