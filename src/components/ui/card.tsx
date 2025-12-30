import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  [
    'flex flex-col rounded-xl border text-card-foreground',
    'transition-all duration-300 ease-out',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-card shadow-sm',
          'hover:shadow-md hover:shadow-black/5',
        ],
        elevated: [
          'bg-card shadow-lg shadow-black/5',
          'hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5',
        ],
        glass: [
          'bg-card/80 backdrop-blur-sm shadow-sm',
          'border-white/10 dark:border-white/5',
          'hover:bg-card/90 hover:shadow-md',
        ],
        outline: [
          'bg-transparent border-2',
          'hover:bg-card/50 hover:shadow-sm',
        ],
        success: [
          'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900',
          'shadow-sm shadow-green-500/5',
        ],
        warning: [
          'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900',
          'shadow-sm shadow-yellow-500/5',
        ],
        destructive: [
          'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900',
          'shadow-sm shadow-red-500/5',
        ],
        info: [
          'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
          'shadow-sm shadow-blue-500/5',
        ],
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:-translate-y-1 hover:shadow-lg',
          'active:translate-y-0 active:shadow-md active:scale-[0.99]',
        ],
        false: '',
      },
      padding: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      interactive: false,
      padding: 'none',
    },
  }
)

export interface CardProps
  extends React.ComponentProps<'div'>,
  VariantProps<typeof cardVariants> { }

function Card({ className, variant, interactive, padding, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive, padding }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-6 pb-0',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-lg font-semibold leading-tight tracking-tight', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground leading-relaxed', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('p-6 pt-4', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center gap-4 p-6 pt-0',
        '[.border-t]:pt-6 [.border-t]:mt-2',
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
