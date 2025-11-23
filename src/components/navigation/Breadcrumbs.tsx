/**
 * Enhanced Breadcrumbs Component
 * Uses Shadcn UI breadcrumb components with better styling and accessibility
 */

import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface BreadcrumbItemProps {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbsProps {
  items: BreadcrumbItemProps[]
  className?: string
  showHome?: boolean
  maxItems?: number
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  maxItems = 4
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null

  // Add home as first item if showHome is true
  const allItems: BreadcrumbItemProps[] = showHome
    ? [{ label: "Home", href: "/", icon: <Home className="h-4 w-4" /> }, ...items]
    : items

  // If we have more items than maxItems, collapse the middle ones
  const shouldCollapse = allItems.length > maxItems

  let visibleItems: BreadcrumbItemProps[]
  let collapsedItems: BreadcrumbItemProps[] = []

  if (shouldCollapse) {
    // Show first item, ellipsis with dropdown, and last 2 items
    visibleItems = [
      allItems[0],
      ...allItems.slice(-2)
    ]
    collapsedItems = allItems.slice(1, -2)
  } else {
    visibleItems = allItems
  }

  return (
    <Breadcrumb className={cn("hidden md:flex", className)}>
      <BreadcrumbList>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1
          const isFirstAndCollapsed = index === 0 && shouldCollapse

          return (
            <BreadcrumbItem key={index}>
              {/* Show ellipsis dropdown after first item if collapsed */}
              {isFirstAndCollapsed && index === 0 && (
                <>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.href} className="flex items-center gap-1.5">
                        {item.icon}
                        <span className="sr-only md:not-sr-only">{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="flex items-center gap-1.5">
                      {item.icon}
                      {item.label}
                    </BreadcrumbPage>
                  )}
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <BreadcrumbEllipsis className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {collapsedItems.map((collapsedItem, collapsedIndex) => (
                          <DropdownMenuItem key={collapsedIndex} asChild>
                            <Link to={collapsedItem.href || "#"}>
                              {collapsedItem.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                </>
              )}

              {/* Regular item rendering (skip first if collapsed, handled above) */}
              {!(isFirstAndCollapsed && index === 0) && (
                <>
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  )}
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="max-w-[200px] truncate font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={item.href}
                        className="max-w-[200px] truncate hover:text-foreground transition-colors"
                      >
                        {item.icon && <span className="mr-1.5">{item.icon}</span>}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Mobile-friendly breadcrumb that shows just the back link
 */
interface MobileBreadcrumbProps {
  backHref?: string
  backLabel?: string
  currentLabel: string
}

export function MobileBreadcrumb({ backHref, backLabel, currentLabel }: MobileBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm md:hidden">
      {backHref && (
        <>
          <Link
            to={backHref}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {backLabel || "Back"}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </>
      )}
      <span className="font-medium truncate">{currentLabel}</span>
    </div>
  )
}
