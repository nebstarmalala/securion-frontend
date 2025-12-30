import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** Show character counter */
  maxLength?: number
  /** Show success state */
  success?: boolean
}

function Textarea({ className, maxLength, success, ...props }: TextareaProps) {
  const [charCount, setCharCount] = React.useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length)
    props.onChange?.(e)
  }

  const isNearLimit = maxLength && charCount >= maxLength * 0.9
  const isOverLimit = maxLength && charCount > maxLength

  return (
    <div className="relative">
      <textarea
        data-slot="textarea"
        data-success={success ? 'true' : undefined}
        className={cn(
          // Base styles
          'flex min-h-[100px] w-full rounded-lg border bg-background px-3 py-2.5 text-sm',
          'placeholder:text-muted-foreground/60',
          'resize-y',

          // Transitions
          'transition-all duration-200 ease-out',

          // Default border
          'border-input/50',

          // Hover state
          'hover:border-input hover:bg-accent/30',

          // Focus state with glow
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          'focus:bg-background focus:shadow-[0_0_0_4px_rgba(var(--primary-rgb,139,92,246),0.1)]',

          // Invalid/Error state
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'aria-invalid:focus:border-destructive aria-invalid:focus:ring-destructive/20',
          'aria-invalid:focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]',

          // Success state
          'data-[success=true]:border-green-500 data-[success=true]:ring-green-500/20',
          'data-[success=true]:focus:border-green-500 data-[success=true]:focus:ring-green-500/20',

          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50',

          // Dark mode
          'dark:bg-input/20 dark:hover:bg-input/40 dark:focus:bg-input/30',

          // Account for counter
          maxLength && 'pb-8',

          className,
        )}
        onChange={handleChange}
        {...props}
      />
      {maxLength && (
        <div
          className={cn(
            'absolute bottom-2 right-3 text-xs tabular-nums',
            'transition-colors duration-200',
            isOverLimit
              ? 'text-destructive font-medium'
              : isNearLimit
                ? 'text-yellow-600 dark:text-yellow-500'
                : 'text-muted-foreground'
          )}
        >
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  )
}

export { Textarea }
