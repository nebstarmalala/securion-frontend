/**
 * Bulk Actions Components
 *
 * Reusable components for performing bulk operations on multiple items.
 * Supports selection management, action menus, and progress tracking.
 */

import React, { useState, useCallback, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Trash2,
  Tag,
  UserPlus,
  Archive,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

// ============================================================================
// Types
// ============================================================================

export interface BulkAction<TItem = any> {
  /** Unique action identifier */
  id: string
  /** Display label */
  label: string
  /** Action icon */
  icon?: React.ComponentType<{ className?: string }>
  /** Action handler - receives selected items */
  handler: (items: TItem[]) => Promise<void>
  /** Whether to show confirmation dialog */
  requireConfirmation?: boolean
  /** Confirmation message */
  confirmationMessage?: string
  /** Whether the action is destructive (shows in red) */
  destructive?: boolean
  /** Minimum items required for this action */
  minItems?: number
  /** Maximum items allowed for this action */
  maxItems?: number
  /** Whether the action is disabled */
  disabled?: boolean
  /** Disabled reason tooltip */
  disabledReason?: string
}

export interface BulkActionResult {
  success: number
  failed: number
  errors: Array<{ id: string; error: string }>
}

// ============================================================================
// Bulk Selection Context
// ============================================================================

interface BulkSelectionContextValue<TItem = any> {
  selectedItems: TItem[]
  selectedIds: Set<string>
  isSelecting: boolean
  toggleSelecting: () => void
  selectItem: (item: TItem, id: string) => void
  deselectItem: (id: string) => void
  toggleItem: (item: TItem, id: string) => void
  selectAll: (items: TItem[], getId: (item: TItem) => string) => void
  deselectAll: () => void
  isSelected: (id: string) => boolean
}

const BulkSelectionContext = createContext<BulkSelectionContextValue | null>(null)

export function useBulkSelection<TItem = any>(): BulkSelectionContextValue<TItem> {
  const context = useContext(BulkSelectionContext)
  if (!context) {
    throw new Error("useBulkSelection must be used within a BulkSelectionProvider")
  }
  return context as BulkSelectionContextValue<TItem>
}

// ============================================================================
// Bulk Selection Provider
// ============================================================================

interface BulkSelectionProviderProps<TItem = any> {
  children: React.ReactNode
  /** Callback when selection changes */
  onSelectionChange?: (items: TItem[]) => void
}

export function BulkSelectionProvider<TItem>({
  children,
  onSelectionChange,
}: BulkSelectionProviderProps<TItem>) {
  const [selectedItems, setSelectedItems] = useState<TItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)

  const toggleSelecting = useCallback(() => {
    setIsSelecting((prev) => {
      if (prev) {
        // Clear selection when exiting selection mode
        setSelectedItems([])
        setSelectedIds(new Set())
        onSelectionChange?.([])
      }
      return !prev
    })
  }, [onSelectionChange])

  const selectItem = useCallback(
    (item: TItem, id: string) => {
      if (selectedIds.has(id)) return

      const newItems = [...selectedItems, item]
      const newIds = new Set(selectedIds)
      newIds.add(id)

      setSelectedItems(newItems)
      setSelectedIds(newIds)
      onSelectionChange?.(newItems)
    },
    [selectedItems, selectedIds, onSelectionChange]
  )

  const deselectItem = useCallback(
    (id: string) => {
      const newItems = selectedItems.filter((_, idx) => {
        // This assumes items are added in order and we track by index
        // In practice, you'd need a better way to correlate
        return true
      })
      const filteredItems = selectedItems.filter(
        (item) => !selectedIds.has(id) || (item as any).id !== id
      )
      const newIds = new Set(selectedIds)
      newIds.delete(id)

      // Filter items based on remaining IDs
      const updatedItems = selectedItems.filter(
        (item) => newIds.has((item as any).id)
      )

      setSelectedItems(updatedItems)
      setSelectedIds(newIds)
      onSelectionChange?.(updatedItems)
    },
    [selectedItems, selectedIds, onSelectionChange]
  )

  const toggleItem = useCallback(
    (item: TItem, id: string) => {
      if (selectedIds.has(id)) {
        deselectItem(id)
      } else {
        selectItem(item, id)
      }
    },
    [selectedIds, selectItem, deselectItem]
  )

  const selectAll = useCallback(
    (items: TItem[], getId: (item: TItem) => string) => {
      const newIds = new Set(items.map(getId))
      setSelectedItems(items)
      setSelectedIds(newIds)
      onSelectionChange?.(items)
    },
    [onSelectionChange]
  )

  const deselectAll = useCallback(() => {
    setSelectedItems([])
    setSelectedIds(new Set())
    onSelectionChange?.([])
  }, [onSelectionChange])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const value: BulkSelectionContextValue<TItem> = {
    selectedItems,
    selectedIds,
    isSelecting,
    toggleSelecting,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
  }

  return (
    <BulkSelectionContext.Provider value={value as BulkSelectionContextValue}>
      {children}
    </BulkSelectionContext.Provider>
  )
}

// ============================================================================
// Bulk Actions Toolbar
// ============================================================================

interface BulkActionsToolbarProps<TItem = any> {
  actions: BulkAction<TItem>[]
  allItems?: TItem[]
  getId?: (item: TItem) => string
  className?: string
}

export function BulkActionsToolbar<TItem>({
  actions,
  allItems = [],
  getId = (item: any) => item.id,
  className,
}: BulkActionsToolbarProps<TItem>) {
  const {
    selectedItems,
    isSelecting,
    toggleSelecting,
    selectAll,
    deselectAll,
  } = useBulkSelection<TItem>()

  const [isExecuting, setIsExecuting] = useState(false)
  const [confirmAction, setConfirmAction] = useState<BulkAction<TItem> | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const executeAction = async (action: BulkAction<TItem>) => {
    if (selectedItems.length === 0) return

    try {
      setIsExecuting(true)
      setProgress({ current: 0, total: selectedItems.length })

      await action.handler(selectedItems)

      toast.success(`${action.label} completed`, {
        description: `Successfully processed ${selectedItems.length} items`,
      })

      deselectAll()
    } catch (error) {
      toast.error(`${action.label} failed`, {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsExecuting(false)
      setProgress({ current: 0, total: 0 })
      setConfirmAction(null)
    }
  }

  const handleActionClick = (action: BulkAction<TItem>) => {
    if (action.requireConfirmation) {
      setConfirmAction(action)
    } else {
      executeAction(action)
    }
  }

  const selectedCount = selectedItems.length
  const allSelected = allItems.length > 0 && selectedCount === allItems.length

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 p-2 bg-muted/50 rounded-lg",
          !isSelecting && "hidden",
          className
        )}
      >
        {/* Selection controls */}
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              selectAll(allItems, getId)
            } else {
              deselectAll()
            }
          }}
          aria-label="Select all"
        />

        <span className="text-sm text-muted-foreground min-w-[100px]">
          {selectedCount === 0 ? (
            "Select items"
          ) : (
            <Badge variant="secondary">{selectedCount} selected</Badge>
          )}
        </span>

        {/* Action buttons */}
        {selectedCount > 0 && (
          <>
            <div className="h-4 w-px bg-border mx-2" />

            {actions.slice(0, 3).map((action) => {
              const Icon = action.icon
              const isDisabled =
                action.disabled ||
                isExecuting ||
                (action.minItems && selectedCount < action.minItems) ||
                (action.maxItems && selectedCount > action.maxItems)

              return (
                <Button
                  key={action.id}
                  variant={action.destructive ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  disabled={isDisabled}
                  title={action.disabledReason}
                >
                  {Icon && <Icon className="mr-1 h-4 w-4" />}
                  {action.label}
                </Button>
              )
            })}

            {actions.length > 3 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExecuting}>
                    More
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.slice(3).map((action, index) => {
                    const Icon = action.icon
                    const isDisabled =
                      action.disabled ||
                      (action.minItems && selectedCount < action.minItems) ||
                      (action.maxItems && selectedCount > action.maxItems)

                    return (
                      <React.Fragment key={action.id}>
                        {index > 0 && action.destructive && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={() => handleActionClick(action)}
                          disabled={isDisabled}
                          className={cn(action.destructive && "text-destructive")}
                        >
                          {Icon && <Icon className="mr-2 h-4 w-4" />}
                          {action.label}
                        </DropdownMenuItem>
                      </React.Fragment>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}

        {/* Cancel selection mode */}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={toggleSelecting}>
          <X className="mr-1 h-4 w-4" />
          Cancel
        </Button>
      </div>

      {/* Enter selection mode button (shown when not selecting) */}
      {!isSelecting && (
        <Button variant="outline" size="sm" onClick={toggleSelecting} className={className}>
          <Check className="mr-1 h-4 w-4" />
          Select
        </Button>
      )}

      {/* Progress indicator */}
      {isExecuting && progress.total > 0 && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg w-80">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
          <Progress value={(progress.current / progress.total) * 100} />
          <span className="text-xs text-muted-foreground">
            {progress.current} of {progress.total} items
          </span>
        </div>
      )}

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmAction?.destructive && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              Confirm {confirmAction?.label}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmationMessage ||
                `Are you sure you want to ${confirmAction?.label.toLowerCase()} ${selectedCount} items? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              className={cn(confirmAction?.destructive && "bg-destructive hover:bg-destructive/90")}
            >
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ============================================================================
// Bulk Selection Checkbox
// ============================================================================

interface BulkSelectionCheckboxProps<TItem = any> {
  item: TItem
  id: string
  className?: string
}

export function BulkSelectionCheckbox<TItem>({
  item,
  id,
  className,
}: BulkSelectionCheckboxProps<TItem>) {
  const { isSelecting, isSelected, toggleItem } = useBulkSelection<TItem>()

  if (!isSelecting) return null

  return (
    <Checkbox
      checked={isSelected(id)}
      onCheckedChange={() => toggleItem(item, id)}
      onClick={(e) => e.stopPropagation()}
      className={className}
      aria-label={`Select item ${id}`}
    />
  )
}

// ============================================================================
// Pre-built Bulk Actions
// ============================================================================

export function createDeleteAction<TItem>(
  onDelete: (items: TItem[]) => Promise<void>
): BulkAction<TItem> {
  return {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    handler: onDelete,
    requireConfirmation: true,
    confirmationMessage: "Are you sure you want to delete the selected items? This action cannot be undone.",
    destructive: true,
  }
}

export function createStatusAction<TItem>(
  status: string,
  label: string,
  onUpdate: (items: TItem[], status: string) => Promise<void>
): BulkAction<TItem> {
  return {
    id: `status-${status}`,
    label: `Mark as ${label}`,
    icon: RefreshCw,
    handler: (items) => onUpdate(items, status),
  }
}

export function createAssignAction<TItem>(
  onAssign: (items: TItem[], userId: string) => Promise<void>,
  userId: string,
  userName: string
): BulkAction<TItem> {
  return {
    id: `assign-${userId}`,
    label: `Assign to ${userName}`,
    icon: UserPlus,
    handler: (items) => onAssign(items, userId),
  }
}

export function createTagAction<TItem>(
  onTag: (items: TItem[], tags: string[]) => Promise<void>,
  tags: string[]
): BulkAction<TItem> {
  return {
    id: `tag-${tags.join("-")}`,
    label: `Add tags: ${tags.join(", ")}`,
    icon: Tag,
    handler: (items) => onTag(items, tags),
  }
}

export function createArchiveAction<TItem>(
  onArchive: (items: TItem[]) => Promise<void>
): BulkAction<TItem> {
  return {
    id: "archive",
    label: "Archive",
    icon: Archive,
    handler: onArchive,
    requireConfirmation: true,
    confirmationMessage: "Archive the selected items? They will be hidden from the main view.",
  }
}
