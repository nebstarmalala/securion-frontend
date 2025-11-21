/**
 * Advanced Filters Component
 * Comprehensive multi-criteria filtering dialog
 *
 * Features:
 * - Multiple filter criteria
 * - Date range selection
 * - Severity and status filters
 * - Entity type filtering
 * - Save filter preset
 * - Reset to defaults
 * - Real-time preview of active filters
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Filter,
  X,
  Save,
  RotateCcw,
  Calendar,
  Tag,
  AlertCircle,
  Users,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useCreateSavedSearch } from "@/lib/hooks/useSavedSearches"

export interface AdvancedFiltersProps {
  entityType?: "projects" | "findings" | "scopes" | "cves"
  initialFilters?: Record<string, any>
  onApplyFilters?: (filters: Record<string, any>) => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AdvancedFilters({
  entityType = "findings",
  initialFilters = {},
  onApplyFilters,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AdvancedFiltersProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // Filter state
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters)

  // Severity filters
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(
    initialFilters.severities || []
  )

  // Status filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialFilters.statuses || []
  )

  // Date range
  const [startDate, setStartDate] = useState<Date | undefined>(initialFilters.start_date)
  const [endDate, setEndDate] = useState<Date | undefined>(initialFilters.end_date)

  // Other filters
  const [searchTerm, setSearchTerm] = useState<string>(initialFilters.q || "")
  const [assignedTo, setAssignedTo] = useState<string>(initialFilters.assigned_to || "")
  const [tags, setTags] = useState<string>(initialFilters.tags || "")

  const createSavedSearchMutation = useCreateSavedSearch()

  const severityOptions = [
    { value: "critical", label: "Critical", color: "bg-red-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "low", label: "Low", color: "bg-blue-500" },
    { value: "info", label: "Informational", color: "bg-gray-500" },
  ]

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in-progress", label: "In Progress" },
    { value: "fixed", label: "Fixed" },
    { value: "false-positive", label: "False Positive" },
    { value: "accepted", label: "Accepted Risk" },
  ]

  const toggleSeverity = (severity: string) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity]
    )
  }

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const buildFilters = (): Record<string, any> => {
    const builtFilters: Record<string, any> = {}

    if (searchTerm) builtFilters.q = searchTerm
    if (selectedSeverities.length > 0) builtFilters.severity = selectedSeverities
    if (selectedStatuses.length > 0) builtFilters.status = selectedStatuses
    if (startDate) builtFilters.start_date = startDate.toISOString()
    if (endDate) builtFilters.end_date = endDate.toISOString()
    if (assignedTo) builtFilters.assigned_to = assignedTo
    if (tags) builtFilters.tags = tags.split(",").map((t) => t.trim())

    return builtFilters
  }

  const handleApplyFilters = () => {
    const builtFilters = buildFilters()
    onApplyFilters?.(builtFilters)
    setOpen(false)
    toast.success("Filters applied", {
      description: `${Object.keys(builtFilters).length} filter(s) active`,
    })
  }

  const handleReset = () => {
    setSearchTerm("")
    setSelectedSeverities([])
    setSelectedStatuses([])
    setStartDate(undefined)
    setEndDate(undefined)
    setAssignedTo("")
    setTags("")
    onApplyFilters?.({})
    toast.info("Filters reset")
  }

  const handleSaveAsPreset = async () => {
    const builtFilters = buildFilters()

    if (Object.keys(builtFilters).length === 0) {
      toast.error("No filters to save")
      return
    }

    // Generate a default name based on active filters
    const filterParts: string[] = []
    if (selectedSeverities.length > 0) {
      filterParts.push(selectedSeverities.join(", "))
    }
    if (selectedStatuses.length > 0) {
      filterParts.push(selectedStatuses.join(", "))
    }

    const defaultName = filterParts.length > 0 ? filterParts.join(" - ") : "Custom Filter"

    try {
      await createSavedSearchMutation.mutateAsync({
        name: defaultName,
        description: "Advanced filter preset",
        entity_type: entityType,
        query_params: builtFilters,
        is_public: false,
      })

      toast.success("Filter preset saved")
    } catch (error) {
      toast.error("Failed to save filter preset")
    }
  }

  const activeFilterCount = Object.keys(buildFilters()).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </DialogTitle>
          <DialogDescription>
            Apply multiple criteria to refine your search
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search Term */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Term</Label>
            <Input
              id="search"
              placeholder="Search by title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Separator />

          {/* Accordion for grouped filters */}
          <Accordion type="multiple" defaultValue={["severity", "status"]} className="w-full">
            {/* Severity Filter */}
            {entityType === "findings" && (
              <AccordionItem value="severity">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Severity</span>
                    {selectedSeverities.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedSeverities.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {severityOptions.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`severity-${option.value}`}
                          checked={selectedSeverities.includes(option.value)}
                          onCheckedChange={() => toggleSeverity(option.value)}
                        />
                        <label
                          htmlFor={`severity-${option.value}`}
                          className="flex items-center gap-2 cursor-pointer text-sm flex-1"
                        >
                          <div className={cn("h-3 w-3 rounded-full", option.color)} />
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Status Filter */}
            <AccordionItem value="status">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>Status</span>
                  {selectedStatuses.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedStatuses.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={selectedStatuses.includes(option.value)}
                        onCheckedChange={() => toggleStatus(option.value)}
                      />
                      <label
                        htmlFor={`status-${option.value}`}
                        className="cursor-pointer text-sm flex-1"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Date Range */}
            <AccordionItem value="date">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date Range</span>
                  {(startDate || endDate) && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <DatePicker
                      date={startDate}
                      onDateChange={setStartDate}
                      placeholder="Select start date"
                      toDate={endDate || new Date()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <DatePicker
                      date={endDate}
                      onDateChange={setEndDate}
                      placeholder="Select end date"
                      fromDate={startDate}
                      toDate={new Date()}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Assignment */}
            <AccordionItem value="assignment">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Assignment</span>
                  {assignedTo && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="assigned-to">Assigned To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger id="assigned-to">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Me</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="anyone">Anyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tags */}
            <AccordionItem value="tags">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>Tags</span>
                  {tags && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., urgent, web-app, database"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter tags separated by commas
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Active Filters Preview */}
          {activeFilterCount > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Active Filters ({activeFilterCount})</Label>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="outline">
                      Search: {searchTerm}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="h-4 w-4 p-0 ml-1.5"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedSeverities.map((sev) => (
                    <Badge key={sev} variant="outline">
                      {sev}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSeverity(sev)}
                        className="h-4 w-4 p-0 ml-1.5"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {selectedStatuses.map((status) => (
                    <Badge key={status} variant="outline">
                      {status}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(status)}
                        className="h-4 w-4 p-0 ml-1.5"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {(startDate || endDate) && (
                    <Badge variant="outline">
                      Date Range
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStartDate(undefined)
                          setEndDate(undefined)
                        }}
                        className="h-4 w-4 p-0 ml-1.5"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 sm:flex-none gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsPreset}
              disabled={activeFilterCount === 0 || createSavedSearchMutation.isPending}
              className="flex-1 sm:flex-none gap-2"
            >
              {createSavedSearchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
          <Button type="button" onClick={handleApplyFilters} className="gap-2">
            <Filter className="h-4 w-4" />
            Apply Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
