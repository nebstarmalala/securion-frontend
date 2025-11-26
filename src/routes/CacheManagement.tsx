/**
 * Cache Management Page
 * Provides cache statistics, health monitoring, and management tools
 */

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  Activity,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  HardDrive,
  BarChart3,
} from "lucide-react";
import { useCacheManagement } from "@/lib/hooks/useCache";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CacheManagement() {
  const {
    statistics,
    health,
    isLoadingStatistics,
    isLoadingHealth,
    statisticsError,
    healthError,
    refetchStatistics,
    refetchHealth,
    clearAll,
    clearByType,
    clearByTags,
    warmDashboard,
    warmStatistics,
    warmAll,
    isClearingAll,
    isClearingByType,
    isClearingByTags,
    isWarmingDashboard,
    isWarmingStatistics,
    isWarmingAll,
  } = useCacheManagement();

  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showClearTypeDialog, setShowClearTypeDialog] = useState(false);
  const [showClearTagsDialog, setShowClearTagsDialog] = useState(false);
  const [cacheType, setCacheType] = useState("");
  const [cacheTags, setCacheTags] = useState("");

  const handleClearAll = () => {
    clearAll();
    setShowClearAllDialog(false);
  };

  const handleClearByType = () => {
    if (cacheType.trim()) {
      clearByType(cacheType.trim());
      setShowClearTypeDialog(false);
      setCacheType("");
    }
  };

  const handleClearByTags = () => {
    if (cacheTags.trim()) {
      const tags = cacheTags.split(',').map(t => t.trim()).filter(Boolean);
      clearByTags(tags);
      setShowClearTagsDialog(false);
      setCacheTags("");
    }
  };

  const getHealthColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getHealthIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "System", href: "/settings?tab=system" },
        { label: "Cache Management" },
      ]}
    >
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cache Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage application cache
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchStatistics();
              refetchHealth();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error States */}
      {(statisticsError || healthError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {statisticsError?.message || healthError?.message || "Failed to load cache data"}
          </AlertDescription>
        </Alert>
      )}

      {/* Health Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {health ? getHealthIcon(health.status) : <Activity className="h-5 w-5" />}
            Cache Health
          </CardTitle>
          <CardDescription>Current cache system status and health metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHealth ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : health ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                  {health.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection</span>
                <Badge variant={health.connection ? 'default' : 'destructive'}>
                  {health.connection ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Latency</span>
                <span className="text-sm">{health.latency_ms}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Available</span>
                <span className="text-sm">{(health.memory_available / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              {health.issues && health.issues.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Issues:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {health.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No health data available</p>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Keys */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStatistics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {statistics?.total_keys.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Size */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStatistics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {((statistics?.total_size || 0) / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStatistics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-green-500">
                {((statistics?.hit_rate || 0) * 100).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        {/* Miss Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miss Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStatistics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-red-500">
                {((statistics?.miss_rate || 0) * 100).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Memory Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
          <CardDescription>Current cache memory consumption</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStatistics ? (
            <Skeleton className="h-4 w-full" />
          ) : statistics ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {(statistics.memory_usage.used / 1024 / 1024).toFixed(2)} MB / {(statistics.memory_usage.total / 1024 / 1024).toFixed(2)} MB
                </span>
                <span className="font-bold">{statistics.memory_usage.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={statistics.memory_usage.percentage} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No memory data available</p>
          )}
        </CardContent>
      </Card>

      {/* Cache by Type */}
      {statistics && statistics.by_type && Object.keys(statistics.by_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cache by Type
            </CardTitle>
            <CardDescription>Breakdown of cache entries by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statistics.by_type).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.count} keys, {(data.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Progress value={(data.size / statistics.total_size) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management Actions</CardTitle>
          <CardDescription>Manage cache data and warm frequently accessed items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Clear Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-3">Clear Cache</h3>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => setShowClearAllDialog(true)}
                disabled={isClearingAll}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isClearingAll ? "Clearing..." : "Clear All Cache"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowClearTypeDialog(true)}
                disabled={isClearingByType}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear by Type
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowClearTagsDialog(true)}
                disabled={isClearingByTags}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear by Tags
              </Button>
            </div>

            {/* Warm Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-3">Warm Cache</h3>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => warmAll()}
                disabled={isWarmingAll}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isWarmingAll ? "Warming..." : "Warm All Caches"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => warmDashboard()}
                disabled={isWarmingDashboard}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isWarmingDashboard ? "Warming..." : "Warm Dashboard"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => warmStatistics()}
                disabled={isWarmingStatistics}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isWarmingStatistics ? "Warming..." : "Warm Statistics"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Cache</DialogTitle>
            <DialogDescription>
              This will clear all cached data. This action cannot be undone and may temporarily impact performance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearAllDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearTypeDialog} onOpenChange={setShowClearTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cache by Type</DialogTitle>
            <DialogDescription>
              Clear all cache entries of a specific type
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cache-type">Cache Type</Label>
              <Input
                id="cache-type"
                placeholder="e.g., dashboard, projects, findings"
                value={cacheType}
                onChange={(e) => setCacheType(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearTypeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearByType} disabled={!cacheType.trim()}>
              Clear Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearTagsDialog} onOpenChange={setShowClearTagsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cache by Tags</DialogTitle>
            <DialogDescription>
              Clear cache entries matching specific tags (comma-separated)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cache-tags">Tags</Label>
              <Input
                id="cache-tags"
                placeholder="e.g., user:1, project:5, critical"
                value={cacheTags}
                onChange={(e) => setCacheTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearTagsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearByTags} disabled={!cacheTags.trim()}>
              Clear Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
}
