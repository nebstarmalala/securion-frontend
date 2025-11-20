/**
 * ReportCard Component
 *
 * Displays a single report with status, type, format, and actions.
 */

import { useState } from "react"
import {
  FileText,
  Download,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileType,
  Calendar,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { cn, formatRelativeDate } from "@/lib/utils"
import type { Report } from "@/lib/types"

interface ReportCardProps {
  report: Report
  onDownload?: (report: Report) => void
  onDelete?: (reportId: string) => void
  onView?: (report: Report) => void
  isDownloading?: boolean
  isDeleting?: boolean
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    variant: "secondary" as const,
    color: "text-muted-foreground",
  },
  generating: {
    icon: Loader2,
    label: "Generating",
    variant: "default" as const,
    color: "text-blue-500",
    animate: true,
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    variant: "default" as const,
    color: "text-green-500",
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    variant: "destructive" as const,
    color: "text-destructive",
  },
}

const typeConfig = {
  executive: {
    label: "Executive",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  technical: {
    label: "Technical",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  compliance: {
    label: "Compliance",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  custom: {
    label: "Custom",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
}

const formatConfig = {
  pdf: { label: "PDF", color: "text-red-500" },
  docx: { label: "DOCX", color: "text-blue-500" },
  html: { label: "HTML", color: "text-orange-500" },
}

export function ReportCard({
  report,
  onDownload,
  onDelete,
  onView,
  isDownloading,
  isDeleting,
}: ReportCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const status = statusConfig[report.status] || statusConfig.pending
  // Handle both report_type and type for backward compatibility with API
  const reportType = report.report_type || (report as any).type || "technical"
  const type = typeConfig[reportType] || typeConfig.technical
  const format = formatConfig[report.format] || formatConfig.pdf
  const StatusIcon = status.icon

  const handleDelete = () => {
    onDelete?.(report.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Report Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <h3
                  className="font-medium truncate cursor-pointer hover:text-primary"
                  onClick={() => onView?.(report)}
                >
                  {report.title}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground mb-3 truncate">
                {report.project_name}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className={cn("text-xs", type.color)}>
                  {type.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <FileType className={cn("h-3 w-3 mr-1", format.color)} />
                  {format.label}
                </Badge>
                <Badge variant={status.variant} className="text-xs">
                  <StatusIcon
                    className={cn(
                      "h-3 w-3 mr-1",
                      status.color,
                      status.animate && "animate-spin"
                    )}
                  />
                  {status.label}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeDate(report.generated_at || report.created_at)}
                </span>
                {report.file_size_human && (
                  <span>{report.file_size_human}</span>
                )}
                {report.metadata?.findings_included && (
                  <span>{report.metadata.findings_included} findings</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {report.status === "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload?.(report)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {report.status === "completed" && (
                    <>
                      <DropdownMenuItem onClick={() => onView?.(report)}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload?.(report)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{report.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
