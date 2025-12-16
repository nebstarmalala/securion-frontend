/**
 * Queue Monitoring Page
 * Provides queue status, metrics, job management, and failed job recovery
 */

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  RotateCcw,
  Trash2,
  Clock,
  TrendingUp,
  Zap,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import { useQueueManagement } from "@/lib/hooks/useQueue";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { getQueueStatusColor } from "@/lib/style-utils";

export default function QueueMonitoring() {
  const [selectedQueue, setSelectedQueue] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | undefined>();
  const [page, setPage] = useState(1);

  const {
    status,
    metrics,
    jobs,
    failedJobs,
    isLoadingStatus,
    isLoadingMetrics,
    isLoadingJobs,
    isLoadingFailedJobs,
    statusError,
    metricsError,
    refetchStatus,
    refetchMetrics,
    refetchJobs,
    refetchFailedJobs,
    retryJob,
    retryAllFailed,
    clearFailed,
    isRetrying,
    isRetryingAllFailed,
    isClearingFailed,
  } = useQueueManagement({ queue: selectedQueue, status: selectedStatus, page, per_page: 20 });

  const [showRetryAllDialog, setShowRetryAllDialog] = useState(false);
  const [showClearFailedDialog, setShowClearFailedDialog] = useState(false);

  const getStatusIcon = (queueStatus?: string) => {
    switch (queueStatus) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'failing':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getJobStatusBadge = (jobStatus: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'outline',
      failed: 'destructive',
    };
    return (
      <Badge variant={variants[jobStatus] || 'secondary'}>
        {jobStatus}
      </Badge>
    );
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "System", href: "/settings?tab=system" },
        { label: "Queue Monitoring" },
      ]}
    >
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Monitor background jobs and queue performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchStatus();
              refetchMetrics();
              refetchJobs();
              refetchFailedJobs();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error States */}
      {(statusError || metricsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {statusError?.message || metricsError?.message || "Failed to load queue data"}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status ? getStatusIcon(status.status) : <Activity className="h-5 w-5" />}
            Queue Status
          </CardTitle>
          <CardDescription>Current queue system status and connection</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStatus ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={status.status === 'operational' ? 'default' : 'destructive'}>
                  {status.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection</span>
                <Badge variant={status.connection ? 'default' : 'destructive'}>
                  {status.connection ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold">{status.pending_jobs}</div>
                  <div className="text-xs text-muted-foreground mt-1">Pending</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold">{status.processing_jobs}</div>
                  <div className="text-xs text-muted-foreground mt-1">Processing</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-red-500">{status.failed_jobs}</div>
                  <div className="text-xs text-muted-foreground mt-1">Failed</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{status.completed_today}</div>
                  <div className="text-xs text-muted-foreground mt-1">Completed Today</div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Today</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.jobs_processed_today.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.average_processing_time_ms.toFixed(0) || 0}ms
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-green-500">
                {((metrics?.success_rate || 0) * 100).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput/Min</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.throughput_per_minute.toFixed(1) || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jobs and Failed Jobs Tables */}
      <Tabs defaultValue="all-jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="failed-jobs">
            Failed Jobs
            {status && status.failed_jobs > 0 && (
              <Badge variant="destructive" className="ml-2">
                {status.failed_jobs}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
        </TabsList>

        <TabsContent value="all-jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Jobs</CardTitle>
              <CardDescription>Recent jobs across all queues</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : jobs && jobs.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Queue</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.data.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-xs">{job.id.substring(0, 8)}</TableCell>
                        <TableCell>{job.queue}</TableCell>
                        <TableCell>{job.name}</TableCell>
                        <TableCell>{getJobStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          {job.attempts} / {job.max_attempts}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {job.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryJob(job.id)}
                              disabled={isRetrying}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No jobs found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed-jobs" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Failed Jobs</CardTitle>
                <CardDescription>Jobs that failed and can be retried</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRetryAllDialog(true)}
                  disabled={!failedJobs || failedJobs.data.length === 0 || isRetryingAllFailed}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry All
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowClearFailedDialog(true)}
                  disabled={!failedJobs || failedJobs.data.length === 0 || isClearingFailed}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingFailedJobs ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : failedJobs && failedJobs.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Queue</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Failed At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedJobs.data.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-xs">{job.id.substring(0, 8)}</TableCell>
                        <TableCell>{job.queue}</TableCell>
                        <TableCell>{job.name}</TableCell>
                        <TableCell className="text-xs text-red-500 max-w-xs truncate">
                          {job.exception_message}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(job.failed_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryJob(job.id)}
                            disabled={isRetrying}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                  <p>No failed jobs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queues" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue Breakdown</CardTitle>
              <CardDescription>Status of individual queues</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : status && status.queues && Object.keys(status.queues).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(status.queues).map(([queueName, queueData]) => (
                    <div key={queueName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{queueName}</h3>
                        <Badge>{queueData.size} total</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center p-2 bg-secondary rounded">
                          <div className="font-bold">{queueData.waiting}</div>
                          <div className="text-xs text-muted-foreground">Waiting</div>
                        </div>
                        <div className="text-center p-2 bg-secondary rounded">
                          <div className="font-bold">{queueData.active}</div>
                          <div className="text-xs text-muted-foreground">Active</div>
                        </div>
                        <div className="text-center p-2 bg-secondary rounded">
                          <div className="font-bold text-green-500">{queueData.completed}</div>
                          <div className="text-xs text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center p-2 bg-secondary rounded">
                          <div className="font-bold text-red-500">{queueData.failed}</div>
                          <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No queue data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showRetryAllDialog} onOpenChange={setShowRetryAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retry All Failed Jobs</DialogTitle>
            <DialogDescription>
              This will attempt to retry all {failedJobs?.total || 0} failed jobs. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRetryAllDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                retryAllFailed();
                setShowRetryAllDialog(false);
              }}
            >
              Retry All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearFailedDialog} onOpenChange={setShowClearFailedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Failed Jobs</DialogTitle>
            <DialogDescription>
              This will permanently delete all {failedJobs?.total || 0} failed jobs. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearFailedDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearFailed();
                setShowClearFailedDialog(false);
              }}
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
}
