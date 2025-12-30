import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends React.ComponentProps<'input'> {
  /** Shows success state styling */
  success?: boolean
}

function Input({ className, type, success, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-success={success ? 'true' : undefined}
      className={cn(
        // Base styles
        'flex h-10 w-full min-w-0 rounded-lg border bg-background px-3 py-2 text-sm',
        'placeholder:text-muted-foreground/60',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        
        // Transitions
        'transition-all duration-200 ease-out',
        
        // Default border
        'border-input/50',
        
        // Hover state
        'hover:border-input hover:bg-accent/30',
        
        // Focus state with glow
        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
        'focus:bg-background focus:shadow-[0_0_0_4px_rgba(var(--primary-rgb,139,92,246),0.1)]',
        
        // Selection
        'selection:bg-primary selection:text-primary-foreground',
        
        // Invalid/Error state
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'aria-invalid:focus:border-destructive aria-invalid:focus:ring-destructive/20',
        'aria-invalid:focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]',
        
        // Success state
        'data-[success=true]:border-green-500 data-[success=true]:ring-green-500/20',
        'data-[success=true]:focus:border-green-500 data-[success=true]:focus:ring-green-500/20',
        'data-[success=true]:focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)]',
        
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50',
        'disabled:hover:border-input/50 disabled:hover:bg-muted/50',
        
        // Dark mode enhancements
        'dark:bg-input/20 dark:hover:bg-input/40 dark:focus:bg-input/30',
        
        className,
      )}
      {...props}
    />
  )
}

export { Input }
