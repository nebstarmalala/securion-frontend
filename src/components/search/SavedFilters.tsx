/**
 * Saved Filters / Views Component
 * Allows users to save and reuse filter configurations
 */

import { useState } from "react"
import {
  Star,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  Bookmark,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface SavedFilter {
  id: string
  name: string
  description?: string
  filters: Record<string, any>
  entityType: "projects" | "findings" | "cves" | "reports" | "all"
  isDefault?: boolean
  createdAt: string
  useCount?: number
}

interface SavedFiltersProps {
  filters: SavedFilter[]
  activeFilterId?: string | null
  onFilterSelect: (filter: SavedFilter) => void
  onFilterCreate: (filter: Omit<SavedFilter, "id" | "createdAt">) => void
  onFilterUpdate: (id: string, updates: Partial<SavedFilter>) => void
  onFilterDelete: (id: string) => void
  currentFilters?: Record<string, any>
  entityType: SavedFilter["entityType"]
}

export function SavedFilters({
  filters,
  activeFilterId,
  onFilterSelect,
  onFilterCreate,
  onFilterUpdate,
  onFilterDelete,
  currentFilters,
  entityType,
}: SavedFiltersProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newFilterName, setNewFilterName] = useState("")
  const [newFilterDescription, setNewFilterDescription] = useState("")

  // Filter by entity type
  const relevantFilters = filters.filter(
    f => f.entityType === entityType || f.entityType === "all"
  )

  const handleCreate = () => {
    if (!newFilterName.trim()) return

    onFilterCreate({
      name: newFilterName.trim(),
      description: newFilterDescription.trim() || undefined,
      filters: currentFilters || {},
      entityType,
    })

    setNewFilterName("")
    setNewFilterDescription("")
    setCreateDialogOpen(false)
  }

  const hasCurrentFilters = currentFilters && Object.keys(currentFilters).length > 0

  return (
    <div className="flex items-center gap-2">
      {/* Saved Filters Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Views
            {relevantFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {relevantFilters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">Saved Views</h4>
            <p className="text-xs text-muted-foreground">
              Quick access to your saved filter configurations
            </p>
          </div>

          {relevantFilters.length > 0 ? (
            <ScrollArea className="max-h-64">
              <div className="p-2">
                {relevantFilters.map((filter) => (
                  <SavedFilterItem
                    key={filter.id}
                    filter={filter}
                    isActive={activeFilterId === filter.id}
                    onSelect={() => onFilterSelect(filter)}
                    onSetDefault={() => onFilterUpdate(filter.id, { isDefault: !filter.isDefault })}
                    onDelete={() => onFilterDelete(filter.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-6 text-center">
              <Filter className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No saved views yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Save your current filters for quick access
              </p>
            </div>
          )}

          {hasCurrentFilters && (
            <div className="p-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Save Current Filters
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Create Filter Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter View</DialogTitle>
            <DialogDescription>
              Save your current filter configuration for quick access later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Name</Label>
              <Input
                id="filter-name"
                placeholder="e.g., My Critical Findings"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-description">Description (optional)</Label>
              <Textarea
                id="filter-description"
                placeholder="What does this view show?"
                value={newFilterDescription}
                onChange={(e) => setNewFilterDescription(e.target.value)}
                rows={2}
              />
            </div>

            {currentFilters && Object.keys(currentFilters).length > 0 && (
              <div className="space-y-2">
                <Label>Current Filters</Label>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(currentFilters).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newFilterName.trim()}>
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface SavedFilterItemProps {
  filter: SavedFilter
  isActive: boolean
  onSelect: () => void
  onSetDefault: () => void
  onDelete: () => void
}

function SavedFilterItem({
  filter,
  isActive,
  onSelect,
  onSetDefault,
  onDelete,
}: SavedFilterItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md p-2 cursor-pointer transition-colors",
        isActive ? "bg-accent" : "hover:bg-accent/50"
      )}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{filter.name}</p>
          {filter.isDefault && (
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
          )}
        </div>
        {filter.description && (
          <p className="text-xs text-muted-foreground truncate">
            {filter.description}
          </p>
        )}
      </div>

      {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetDefault(); }}>
            <Star className="mr-2 h-4 w-4" />
            {filter.isDefault ? "Remove as default" : "Set as default"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * Hook to manage saved filters with localStorage persistence
 */
export function useSavedFilters(entityType: SavedFilter["entityType"]) {
  const STORAGE_KEY = `securion_saved_filters_${entityType}`

  const [filters, setFilters] = useState<SavedFilter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [activeFilterId, setActiveFilterId] = useState<string | null>(null)

  const saveToStorage = (updated: SavedFilter[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Silently fail
    }
  }

  const createFilter = (filter: Omit<SavedFilter, "id" | "createdAt">) => {
    const newFilter: SavedFilter = {
      ...filter,
      id: `filter-${Date.now()}`,
      createdAt: new Date().toISOString(),
      useCount: 0,
    }
    const updated = [...filters, newFilter]
    setFilters(updated)
    saveToStorage(updated)
    return newFilter
  }

  const updateFilter = (id: string, updates: Partial<SavedFilter>) => {
    const updated = filters.map(f =>
      f.id === id ? { ...f, ...updates } : f
    )
    setFilters(updated)
    saveToStorage(updated)
  }

  const deleteFilter = (id: string) => {
    const updated = filters.filter(f => f.id !== id)
    setFilters(updated)
    saveToStorage(updated)
    if (activeFilterId === id) {
      setActiveFilterId(null)
    }
  }

  const selectFilter = (filter: SavedFilter) => {
    setActiveFilterId(filter.id)
    // Increment use count
    updateFilter(filter.id, { useCount: (filter.useCount || 0) + 1 })
  }

  const clearActiveFilter = () => {
    setActiveFilterId(null)
  }

  const activeFilter = filters.find(f => f.id === activeFilterId)

  return {
    filters,
    activeFilter,
    activeFilterId,
    createFilter,
    updateFilter,
    deleteFilter,
    selectFilter,
    clearActiveFilter,
    filterParams: activeFilter?.filters || {},
  }
}
