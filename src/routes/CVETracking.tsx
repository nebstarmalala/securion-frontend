import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { CVECard } from "@/components/cve-card"
import { EmptyState } from "@/components/empty-state"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, RefreshCw, GitMerge, AlertCircle, Shield } from "lucide-react"
import { useState, useMemo } from "react"
import { useCveTrackings, useCveStatistics, useSyncCves, useRematchCves } from "@/hooks/use-cve-tracking"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CveTrackingQueryParams } from "@/lib/types/api"

export default function CVETracking() {
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<"low" | "medium" | "high" | "critical" | "all">("all")
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  // Build query params
  const queryParams: CveTrackingQueryParams = useMemo(() => {
    const params: CveTrackingQueryParams = {
      page,
      perPage: 50,
    }

    if (searchQuery) {
      params.search = searchQuery
    }

    if (severityFilter !== "all") {
      params.severity = severityFilter
    }

    return params
  }, [searchQuery, severityFilter, page])

  // Fetch CVE data
  const { data, isLoading, error, refetch } = useCveTrackings(queryParams)
  const { data: statsData, isLoading: statsLoading } = useCveStatistics()
  const syncMutation = useSyncCves()
  const rematchMutation = useRematchCves()

  const cves = Array.isArray(data?.data) ? data.data : []
  const pagination = data?.meta

  // Use real statistics from API
  const stats = statsData?.data || {
    total: 0,
    by_severity: { critical: 0, high: 0, medium: 0, low: 0 },
    affected_services: 0,
    recent_additions: 0,
    last_sync: null,
  }

  const handleSync = () => {
    toast.promise(
      syncMutation.mutateAsync(7),
      {
        loading: "Syncing CVEs from NVD...",
        success: "CVEs synced successfully",
        error: (err) => `Failed to sync CVEs: ${err instanceof Error ? err.message : "Unknown error"}`,
      }
    )
  }

  const handleRematch = () => {
    toast.promise(
      rematchMutation.mutateAsync(),
      {
        loading: "Rematching CVEs to services...",
        success: "CVEs rematched successfully",
        error: (err) => `Failed to rematch CVEs: ${err instanceof Error ? err.message : "Unknown error"}`,
      }
    )
  }

  const handleRefresh = () => {
    toast.promise(
      Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ["cve-statistics"] })
      ]),
      {
        loading: "Refreshing CVE data...",
        success: "CVE data refreshed successfully",
        error: "Failed to refresh CVE data",
      }
    )
  }

  return (
    <ProtectedRoute permissions={["cve-tracking-view"]}>
      <DashboardLayout breadcrumbs={[{ label: "CVE Tracking" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">CVE Tracking</h1>
              <p className="text-muted-foreground">Monitor and manage Common Vulnerabilities and Exposures</p>
              {stats.last_sync && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last synced: {new Date(stats.last_sync).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {!isLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRematch}
                disabled={rematchMutation.isPending}
                className="gap-2"
              >
                <GitMerge className="h-4 w-4" />
                Rematch All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Sync from NVD
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {statsLoading ? (
              <>
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
              </>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-muted-foreground">Total CVEs</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  {stats.recent_additions > 0 && (
                    <p className="text-xs text-green-600 mt-1">+{stats.recent_additions} new</p>
                  )}
                </div>
                <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.by_severity.critical}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-muted-foreground">High Severity</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.by_severity.high}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-muted-foreground">Affected Services</p>
                  <p className="text-2xl font-bold text-destructive">{stats.affected_services}</p>
                </div>
              </>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error loading CVE data</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error instanceof Error ? error.message : "Failed to load CVE data"}</span>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search CVE ID or description..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)} disabled={isLoading}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(severityFilter !== "all" || searchQuery !== "") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {severityFilter !== "all" && (
                <Badge variant="secondary" className="gap-2">
                  Severity: {severityFilter}
                  <button onClick={() => setSeverityFilter("all")} className="hover:text-destructive">
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery !== "" && (
                <Badge variant="secondary" className="gap-2">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="hover:text-destructive">
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSeverityFilter("all")
                  setSearchQuery("")
                }}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4 rounded-lg border p-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : cves.length === 0 ? (
            /* Empty State */
            <EmptyState
              icon={Shield}
              title={searchQuery || severityFilter !== "all" ? "No CVEs match your filters" : "No CVEs found"}
              description={
                searchQuery || severityFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Sync CVEs from NVD to get started tracking vulnerabilities"
              }
              action={
                searchQuery || severityFilter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setSeverityFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={handleSync} disabled={syncMutation.isPending}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync from NVD
                  </Button>
                )
              }
            />
          ) : (
            <>
              {/* CVE Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cves.map((cve: any) => (
                  <CVECard key={cve.id} cve={cve} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                    disabled={page === pagination.last_page}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
