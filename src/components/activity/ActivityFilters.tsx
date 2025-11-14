import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { ActivityQueryParams } from "@/lib/types/api"

interface ActivityFiltersProps {
  filters: ActivityQueryParams
  onFilterChange: (filters: ActivityQueryParams) => void
}

export function ActivityFilters({ filters, onFilterChange }: ActivityFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ActivityQueryParams>(filters)

  const handleActionChange = (value: string) => {
    const newFilters = { ...localFilters }
    if (value === "all") {
      delete newFilters.action
    } else {
      newFilters.action = value
    }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleResourceChange = (value: string) => {
    const newFilters = { ...localFilters }
    if (value === "all") {
      delete newFilters.resource
    } else {
      newFilters.resource = value
    }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: ActivityQueryParams = {}
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.keys(localFilters).length > 0

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={localFilters.action || "all"}
        onValueChange={handleActionChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value="created">Created</SelectItem>
          <SelectItem value="updated">Updated</SelectItem>
          <SelectItem value="deleted">Deleted</SelectItem>
          <SelectItem value="assigned">Assigned</SelectItem>
          <SelectItem value="commented">Commented</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={localFilters.resource || "all"}
        onValueChange={handleResourceChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Resource" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Resources</SelectItem>
          <SelectItem value="Finding">Findings</SelectItem>
          <SelectItem value="Project">Projects</SelectItem>
          <SelectItem value="Scope">Scopes</SelectItem>
          <SelectItem value="CveTracking">CVEs</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
