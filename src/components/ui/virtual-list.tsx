import { useRef, ReactNode } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@/lib/utils"

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  estimateSize?: number
  overscan?: number
  className?: string
  itemClassName?: string
  gap?: number
}

/**
 * Virtual list component for efficiently rendering large lists
 * Only renders visible items + overscan for smooth scrolling
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 100,
  overscan = 5,
  className = "h-[600px]",
  itemClassName,
  gap = 0,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
  })

  return (
    <div ref={parentRef} className={cn("overflow-auto", className)}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className={itemClassName}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

interface VirtualGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  columns?: number
  estimateSize?: number
  overscan?: number
  className?: string
  gap?: number
}

/**
 * Virtual grid component for efficiently rendering large grids
 */
export function VirtualGrid<T>({
  items,
  renderItem,
  columns = 3,
  estimateSize = 200,
  overscan = 3,
  className = "h-[600px]",
  gap = 16,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Calculate rows based on number of columns
  const rows = Math.ceil(items.length / columns)

  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  return (
    <div ref={parentRef} className={cn("overflow-auto", className)}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns
          const rowItems = items.slice(startIndex, startIndex + columns)

          return (
            <div
              key={virtualRow.index}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: `${gap}px`,
                }}
              >
                {rowItems.map((item, colIndex) => (
                  <div key={startIndex + colIndex}>
                    {renderItem(item, startIndex + colIndex)}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
