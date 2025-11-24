/**
 * Search Filters Component
 * Type filter tabs and advanced filters for global search
 */

import { useState } from "react"
import {
  FolderKanban,
  Shield,
  Target,
  AlertTriangle,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type SearchType = "all" | "projects" | "findings" | "scopes" | "cves"

interface SearchFiltersProps {
  selectedType: SearchType
  onTypeChange: (type: SearchType) => void
  filters?: SearchFilterValues
  onFiltersChange?: (filters: SearchFilterValues) => void
  resultCounts?: {
    projects?: number
    findings?: number
    scopes?: number
    cves?: number
  }
}

export interface SearchFilterValues {
  severity?: string
  status?: string
  dateRange?: string
  assignee?: string
}

const TYPE_CONFIG = [
  { value: "all", label: "All", icon: null },
  { value: "projects", label: "Projects", icon: FolderKanban },
  { value: "findings", label: "Findings", icon: AlertTriangle },
  { value: "scopes", label: "Scopes", icon: Target },
  { value: "cves", label: "CVEs", icon: Shield },
] as const

export function SearchTypeFilter({
  selectedType,
  onTypeChange,
  resultCounts,
}: Pick<SearchFiltersProps, "selectedType" | "onTypeChange" | "resultCounts">) {
  return (
    <Tabs value={selectedType} onValueChange={(v) => onTypeChange(v as SearchType)}>
      <TabsList className="h-9">
        {TYPE_CONFIG.map(({ value, label, icon: Icon }) => {
          const count = value === "all"
            ? Object.values(resultCounts || {}).reduce((a, b) => (a || 0) + (b || 0), 0)
            : resultCounts?.[value as keyof typeof resultCounts]

          return (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 text-xs px-3"
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {label}
              {count !== undefined && count > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {count}
                </Badge>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

export function SearchAdvancedFilters({
  filters,
  onFiltersChange,
  selectedType,
}: Pick<SearchFiltersProps, "filters" | "onFiltersChange" | "selectedType">) {
  const [localFilters, setLocalFilters] = useState<SearchFilterValues>(filters || {})

  const handleFilterChange = (key: keyof SearchFilterValues, value: string) => {
    const updated = { ...localFilters, [key]: value || undefined }
    setLocalFilters(updated)
    onFiltersChange?.(updated)
  }

  const clearFilters = () => {
    setLocalFilters({})
    onFiltersChange?.({})
  }

  const activeFilterCount = Object.values(localFilters).filter(Boolean).length

  // Show severity/status filters for findings and CVEs
  const showSeverityFilter = selectedType === "all" || selectedType === "findings" || selectedType === "cves"
  const showStatusFilter = selectedType === "all" || selectedType === "findings" || selectedType === "projects"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Advanced Filters</h4>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          {showSeverityFilter && (
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select
                value={localFilters.severity || ""}
                onValueChange={(v) => handleFilterChange("severity", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatusFilter && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={localFilters.status || ""}
                onValueChange={(v) => handleFilterChange("status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any status</SelectItem>
                  {selectedType === "projects" || selectedType === "all" ? (
                    <>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="false-positive">False Positive</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select
              value={localFilters.dateRange || ""}
              onValueChange={(v) => handleFilterChange("dateRange", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Active filter badges that can be removed
 */
export function ActiveFilterBadges({
  filters,
  onRemove,
}: {
  filters: SearchFilterValues
  onRemove: (key: keyof SearchFilterValues) => void
}) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value)

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="gap-1 pr-1">
          <span className="capitalize">{key}:</span>
          <span className="font-medium">{value}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 hover:bg-transparent"
            onClick={() => onRemove(key as keyof SearchFilterValues)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  )
}
