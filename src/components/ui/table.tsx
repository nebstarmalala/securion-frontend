import * as React from 'react'

import { cn } from '@/lib/utils'

interface TableProps extends React.ComponentProps<'table'> {
  /** Add striped rows */
  striped?: boolean
  /** Add hover effect on rows */
  hoverable?: boolean
}

function Table({ className, striped, hoverable = true, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-lg border"
    >
      <table
        data-slot="table"
        data-striped={striped}
        data-hoverable={hoverable}
        className={cn(
          'w-full caption-bottom text-sm',
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        'bg-muted/50 [&_tr]:border-b',
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        '[&_tr:last-child]:border-0',
        // Striped rows (when parent has data-striped)
        '[[data-striped=true]_&_tr:nth-child(even)]:bg-muted/30',
        className
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b transition-colors duration-150',
        // Hover effect (controlled by parent data-hoverable)
        '[[data-hoverable=true]_&]:hover:bg-muted/50',
        // Selected state
        'data-[state=selected]:bg-primary/5 data-[state=selected]:border-primary/20',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-11 px-4 text-left align-middle font-semibold text-muted-foreground',
        'whitespace-nowrap text-xs uppercase tracking-wider',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 py-3 align-middle',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

/** Empty state for tables */
function TableEmpty({
  className,
  colSpan,
  icon,
  title = "No results found",
  description,
  action,
  ...props
}: React.ComponentProps<'tr'> & {
  colSpan: number
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <tr
      data-slot="table-empty"
      className={cn(className)}
      {...props}
    >
      <td colSpan={colSpan} className="py-12">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          {icon && (
            <div className="text-muted-foreground/50">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground/70">{description}</p>
            )}
          </div>
          {action}
        </div>
      </td>
    </tr>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
}
