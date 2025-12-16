/**
 * Error Logs Page
 * Displays error logs for debugging and monitoring
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getErrorLogs, clearErrorLogs, exportErrorLogs } from "@/lib/errors"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function ErrorLogs() {
  const [logs, setLogs] = useState<ReturnType<typeof getErrorLogs>>([])
  const [selectedLog, setSelectedLog] = useState<(typeof logs)[0] | null>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)

  const loadLogs = () => {
    setLogs(getErrorLogs())
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleClearLogs = () => {
    clearErrorLogs()
    setLogs([])
    setShowClearDialog(false)
  }

  const handleExportLogs = () => {
    exportErrorLogs()
  }

  const getStatusBadge = (status?: number) => {
    if (!status) return null

    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
    if (status >= 500) variant = "destructive"
    else if (status >= 400) variant = "outline"

    return <Badge variant={variant}>{status}</Badge>
  }

  const getSeverityIcon = (status?: number) => {
    if (!status) return <Info className="h-4 w-4 text-blue-500" />
    if (status >= 500) return <XCircle className="h-4 w-4 text-red-500" />
    if (status >= 400) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <Info className="h-4 w-4 text-blue-500" />
  }

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "System", href: "/settings?tab=system" },
        { label: "Error Logs" },
      ]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Error Logs</h1>
              <p className="text-muted-foreground mt-1">
                View and manage application error logs
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogs}
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                disabled={logs.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Error logs are stored locally in your browser and limited to the last 50 errors.
              These logs help diagnose issues during development and can be exported for support.
            </AlertDescription>
          </Alert>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs.length}</div>
                <p className="text-xs text-muted-foreground">Logged errors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Server Errors (5xx)</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {logs.filter((log) => log.status && log.status >= 500).length}
                </div>
                <p className="text-xs text-muted-foreground">Critical issues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Errors (4xx)</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {logs.filter((log) => log.status && log.status >= 400 && log.status < 500).length}
                </div>
                <p className="text-xs text-muted-foreground">Request errors</p>
              </CardContent>
            </Card>
          </div>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Error Log Entries</CardTitle>
              <CardDescription>Recent errors logged by the application</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">No errors logged</p>
                  <p className="text-sm">
                    Your application is running smoothly with no errors recorded.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log, index) => (
                        <TableRow key={index} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>{getSeverityIcon(log.status)}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate font-medium">{log.message}</div>
                            {log.url && (
                              <div className="text-xs text-muted-foreground truncate mt-1">
                                {log.url}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Dialog */}
          <Dialog open={selectedLog !== null} onOpenChange={() => setSelectedLog(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getSeverityIcon(selectedLog?.status)}
                  Error Details
                </DialogTitle>
                <DialogDescription>Complete error information and stack trace</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Message</h4>
                    <p className="text-sm">{selectedLog?.message}</p>
                  </div>

                  {selectedLog?.status && (
                    <div>
                      <h4 className="font-semibold mb-2">Status Code</h4>
                      <div>{getStatusBadge(selectedLog.status)}</div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Timestamp</h4>
                    <p className="text-sm">
                      {selectedLog?.timestamp && new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {selectedLog?.url && (
                    <div>
                      <h4 className="font-semibold mb-2">URL</h4>
                      <p className="text-sm break-all">{selectedLog.url}</p>
                    </div>
                  )}

                  {selectedLog?.context && Object.keys(selectedLog.context).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Context</h4>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.context, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog?.stack && (
                    <div>
                      <h4 className="font-semibold mb-2">Stack Trace</h4>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                        {selectedLog.stack}
                      </pre>
                    </div>
                  )}

                  {selectedLog?.userAgent && (
                    <div>
                      <h4 className="font-semibold mb-2">User Agent</h4>
                      <p className="text-xs text-muted-foreground break-all">
                        {selectedLog.userAgent}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Clear Confirmation Dialog */}
          <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Error Logs</DialogTitle>
                <DialogDescription>
                  This will permanently delete all {logs.length} error logs from your browser
                  storage. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClearLogs}>
                  Clear All Logs
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
