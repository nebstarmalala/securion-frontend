/**
 * ExportDialog Component
 *
 * Dialog for exporting data in various formats (CSV, JSON, XLSX).
 */

import { useState } from "react"
import {
  Loader2,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  FolderKanban,
  AlertTriangle,
  Globe,
  Bug,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  useExportProjects,
  useExportFindings,
  useExportScopes,
  useExportCVEs,
} from "@/lib/hooks/useReports"
import type { ExportFilters } from "@/lib/api/reports"

type ExportType = "projects" | "findings" | "scopes" | "cves"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultType?: ExportType
  projectId?: string
  onSuccess?: () => void
}

const exportTypes = [
  {
    id: "projects" as const,
    label: "Projects",
    icon: FolderKanban,
    description: "Export project data including status and team info",
  },
  {
    id: "findings" as const,
    label: "Findings",
    icon: AlertTriangle,
    description: "Export vulnerability findings with severity and details",
  },
  {
    id: "scopes" as const,
    label: "Scopes",
    icon: Globe,
    description: "Export scope definitions and their configurations",
  },
  {
    id: "cves" as const,
    label: "CVEs",
    icon: Bug,
    description: "Export CVE tracking data with affected products",
  },
]

const formatOptions = [
  {
    id: "csv" as const,
    label: "CSV",
    icon: FileText,
    description: "Comma-separated values for spreadsheets",
  },
  {
    id: "json" as const,
    label: "JSON",
    icon: FileJson,
    description: "Structured data for programmatic use",
  },
  {
    id: "xlsx" as const,
    label: "Excel",
    icon: FileSpreadsheet,
    description: "Microsoft Excel format with formatting",
  },
]

export function ExportDialog({
  open,
  onOpenChange,
  defaultType = "findings",
  projectId,
  onSuccess,
}: ExportDialogProps) {
  const [exportType, setExportType] = useState<ExportType>(defaultType)
  const [format, setFormat] = useState<"csv" | "json" | "xlsx">("csv")
  const [filters, setFilters] = useState<ExportFilters>({
    project_id: projectId,
    format: "csv",
  })

  const exportProjects = useExportProjects()
  const exportFindings = useExportFindings()
  const exportScopes = useExportScopes()
  const exportCVEs = useExportCVEs()

  const handleExport = async () => {
    const exportFilters = { ...filters, format }
    const filename = `${exportType}-export-${new Date().toISOString().split("T")[0]}.${format}`

    try {
      switch (exportType) {
        case "projects":
          await exportProjects.mutateAsync({ filters: exportFilters, filename })
          break
        case "findings":
          await exportFindings.mutateAsync({ filters: exportFilters, filename })
          break
        case "scopes":
          await exportScopes.mutateAsync({ filters: exportFilters, filename })
          break
        case "cves":
          await exportCVEs.mutateAsync({ filters: exportFilters, filename })
          break
      }
      onSuccess?.()
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    }
  }

  const isPending =
    exportProjects.isPending ||
    exportFindings.isPending ||
    exportScopes.isPending ||
    exportCVEs.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Export your data in various formats for reporting or analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <Label>Data Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {exportTypes.map((type) => {
                const Icon = type.icon
                const isSelected = exportType === type.id
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setExportType(type.id)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {type.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value: any) => setFormat(value)}
              className="space-y-2"
            >
              {formatOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 rounded-lg border p-3"
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Filters */}
          <div className="space-y-3">
            <Label>Filters (Optional)</Label>

            {/* Severity filter for findings */}
            {exportType === "findings" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Severity</Label>
                <Select
                  value={filters.severity || "all"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, severity: value === "all" ? undefined : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value === "all" ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {exportType === "projects" && (
                    <>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </>
                  )}
                  {exportType === "findings" && (
                    <>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={filters.date_from || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      date_from: e.target.value || undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={filters.date_to || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      date_to: e.target.value || undefined,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
