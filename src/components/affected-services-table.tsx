"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, AlertCircle } from "lucide-react"
import { getSeverityColor } from "@/lib/mock-data"
import { useCveTrackings } from "@/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link } from "react-router-dom"
import { useMemo } from "react"

export function AffectedServicesTable() {
  const { data, isLoading, error } = useCveTrackings({
    per_page: 10,
    sort_by: "affected_services_count",
    sort_order: "desc",
  })

  // Group CVEs by service (product/vendor) and aggregate data
  const serviceData = useMemo(() => {
    if (!data?.data) return []

    // Create a map to group by service
    const serviceMap = new Map<
      string,
      {
        service: string
        version: string | null
        cveIds: string[]
        cveCount: number
        highestSeverity: string
        affectedProjects: number
        latestCveId: string
      }
    >()

    data.data.forEach((cve) => {
      // Use product as the service name, fallback to vendor if not available
      const serviceName = cve.product || cve.vendor || "Unknown Service"
      const version = cve.version || null
      const key = `${serviceName}:${version || "unknown"}`

      if (serviceMap.has(key)) {
        const existing = serviceMap.get(key)!
        existing.cveIds.push(cve.cve_id)
        existing.cveCount++
        existing.affectedProjects += cve.affected_services_count || 0
        // Update severity if this one is higher
        const severities = ["critical", "high", "medium", "low", "info"]
        if (
          severities.indexOf(cve.severity) <
          severities.indexOf(existing.highestSeverity)
        ) {
          existing.highestSeverity = cve.severity
        }
      } else {
        serviceMap.set(key, {
          service: serviceName,
          version,
          cveIds: [cve.cve_id],
          cveCount: 1,
          highestSeverity: cve.severity,
          affectedProjects: cve.affected_services_count || 0,
          latestCveId: cve.id,
        })
      }
    })

    // Convert to array and sort by affected projects
    return Array.from(serviceMap.values())
      .sort((a, b) => b.affectedProjects - a.affectedProjects)
      .slice(0, 10)
  }, [data])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Affected Services</CardTitle>
          <CardDescription>Services with known vulnerabilities across projects</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load affected services"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Affected Services</CardTitle>
        <CardDescription>Services with known CVEs impacting your projects</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : serviceData.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No CVE data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>CVE Count</TableHead>
                <TableHead>Highest Severity</TableHead>
                <TableHead>Affected Services</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceData.map((service, index) => (
                <TableRow key={index} className="group hover:bg-muted/50">
                  <TableCell className="font-medium max-w-[200px] truncate" title={service.service}>
                    {service.service}
                  </TableCell>
                  <TableCell>
                    {service.version ? (
                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                        {service.version}
                      </code>
                    ) : (
                      <span className="text-muted-foreground text-xs">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.cveCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getSeverityColor(service.highestSeverity as any)}
                    >
                      {service.highestSeverity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{service.affectedProjects}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-2" asChild>
                      <Link to={`/cve-tracking/${service.latestCveId}`}>
                        View Details
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
