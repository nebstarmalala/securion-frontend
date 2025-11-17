"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrends } from "@/hooks"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function FindingsChart() {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("weekly")
  const { data, isLoading, error } = useTrends(timeRange)

  // Transform API data into chart-friendly format
  const chartData = useMemo(() => {
    if (!data) return []

    // Determine which field to use as the key based on the period
    const keyField = timeRange === "daily" ? "date" : timeRange === "weekly" ? "week" : "month"

    // Merge all three arrays into a single array for the chart
    const mergedData = new Map<string, any>()

    // Add projects data
    data.projects?.forEach((item: any) => {
      const key = item[keyField]
      mergedData.set(key, {
        period: key,
        label: item.label,
        projects: item.count,
      })
    })

    // Add findings data
    data.findings?.forEach((item: any) => {
      const key = item[keyField]
      const existing = mergedData.get(key) || { period: key, label: item.label }
      mergedData.set(key, {
        ...existing,
        findings: item.count,
      })
    })

    // Add CVEs data
    data.cves?.forEach((item: any) => {
      const key = item[keyField]
      const existing = mergedData.get(key) || { period: key, label: item.label }
      mergedData.set(key, {
        ...existing,
        cves: item.count,
      })
    })

    return Array.from(mergedData.values())
  }, [data, timeRange])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>Projects, findings, and CVEs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load trend data"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>Projects, findings, and CVEs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>Projects, findings, and CVEs discovered over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No trend data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="findingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cvesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="findings"
                stroke="hsl(var(--destructive))"
                fill="url(#findingsGradient)"
                name="Findings"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="projects"
                stroke="hsl(var(--primary))"
                fill="url(#projectsGradient)"
                name="Projects"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="cves"
                stroke="hsl(var(--chart-3))"
                fill="url(#cvesGradient)"
                name="CVEs"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
