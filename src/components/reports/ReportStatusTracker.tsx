/**
 * ReportStatusTracker Component
 *
 * Displays real-time status of a report being generated with progress indication.
 */

import { useEffect } from "react"
import { CheckCircle, AlertCircle, Loader2, Clock, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useReportStatus, useDownloadReport } from "@/lib/hooks/useReports"
import type { Report } from "@/lib/types"

interface ReportStatusTrackerProps {
  report: Report
  onComplete?: () => void
  onDownload?: () => void
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Waiting to start",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  generating: {
    icon: Loader2,
    label: "Generating report",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    animate: true,
  },
  completed: {
    icon: CheckCircle,
    label: "Report ready",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  failed: {
    icon: AlertCircle,
    label: "Generation failed",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

export function ReportStatusTracker({
  report,
  onComplete,
  onDownload,
}: ReportStatusTrackerProps) {
  const { data: statusData, isLoading } = useReportStatus(
    report.id,
    report.status === "pending" || report.status === "generating"
  )
  const downloadReport = useDownloadReport()

  const currentStatus = statusData?.status || report.status
  const config = statusConfig[currentStatus]
  const StatusIcon = config.icon

  // Notify parent when complete
  useEffect(() => {
    if (currentStatus === "completed") {
      onComplete?.()
    }
  }, [currentStatus, onComplete])

  const handleDownload = async () => {
    await downloadReport.mutateAsync({
      reportId: report.id,
      filename: `${report.title}.${report.format}`,
    })
    onDownload?.()
  }

  return (
    <Card className={cn("transition-colors", config.bgColor)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "p-2 rounded-full",
              currentStatus === "completed" && "bg-green-100 dark:bg-green-900",
              currentStatus === "failed" && "bg-destructive/20",
              currentStatus === "generating" && "bg-blue-100 dark:bg-blue-900",
              currentStatus === "pending" && "bg-muted"
            )}
          >
            <StatusIcon
              className={cn(
                "h-5 w-5",
                config.color,
                config.animate && "animate-spin"
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium truncate">{report.title}</h4>
              <span className={cn("text-sm font-medium", config.color)}>
                {config.label}
              </span>
            </div>

            {currentStatus === "generating" && statusData?.progress !== undefined && (
              <div className="space-y-1">
                <Progress value={statusData.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {statusData.message || `${statusData.progress}% complete`}
                </p>
              </div>
            )}

            {currentStatus === "failed" && statusData?.message && (
              <p className="text-sm text-destructive">{statusData.message}</p>
            )}
          </div>

          {currentStatus === "completed" && (
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloadReport.isPending}
            >
              {downloadReport.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Component for tracking multiple reports being generated
 */
interface ReportStatusListProps {
  reports: Report[]
  onComplete?: (reportId: string) => void
}

export function ReportStatusList({ reports, onComplete }: ReportStatusListProps) {
  const activeReports = reports.filter(
    (r) => r.status === "pending" || r.status === "generating"
  )

  if (activeReports.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Generating Reports ({activeReports.length})
      </h3>
      {activeReports.map((report) => (
        <ReportStatusTracker
          key={report.id}
          report={report}
          onComplete={() => onComplete?.(report.id)}
        />
      ))}
    </div>
  )
}
