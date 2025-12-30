import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  [
    'rounded-md bg-muted/60',
    'relative overflow-hidden',
    // Shimmer effect
    'before:absolute before:inset-0',
    'before:-translate-x-full',
    'before:animate-[shimmer_2s_infinite]',
    'before:bg-gradient-to-r',
    'before:from-transparent before:via-white/10 before:to-transparent',
  ],
  {
    variants: {
      variant: {
        default: 'bg-muted/60',
        primary: 'bg-primary/10',
        dark: 'bg-muted/80',
      },
      animation: {
        shimmer: '',
        pulse: 'animate-pulse before:hidden',
        none: 'before:hidden',
      },
    },
    defaultVariants: {
      variant: 'default',
      animation: 'shimmer',
    },
  }
)

// Add shimmer keyframe to the component
const shimmerStyles = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
`

interface SkeletonProps extends React.ComponentProps<'div'>, VariantProps<typeof skeletonVariants> { }

function Skeleton({ className, variant, animation, ...props }: SkeletonProps) {
  return (
    <>
      <style>{shimmerStyles}</style>
      <div
        data-slot="skeleton"
        className={cn(skeletonVariants({ variant, animation }), className)}
        {...props}
      />
    </>
  )
}

/** Text skeleton with multiple lines */
function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = '60%',
  ...props
}: React.ComponentProps<'div'> & {
  lines?: number
  lastLineWidth?: string
}) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  )
}

/** Avatar skeleton */
function SkeletonAvatar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Skeleton
      className={cn('size-10 rounded-full', className)}
      {...props}
    />
  )
}

/** Card skeleton for loading states */
function SkeletonCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('rounded-lg border p-6 space-y-4', className)} {...props}>
      <div className="flex items-center gap-4">
        <SkeletonAvatar />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}

/** Table row skeleton */
function SkeletonTableRow({
  columns = 4,
  className,
  ...props
}: React.ComponentProps<'tr'> & { columns?: number }) {
  return (
    <tr className={cn('border-b', className)} {...props}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  skeletonVariants
}
