"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { getSeverityColor } from "@/lib/mock-data"
import type { SeverityLevel } from "@/lib/types"

const affectedServices = [
  {
    service: "Apache Struts",
    version: "2.5.28",
    cveCount: 3,
    severity: "critical" as SeverityLevel,
    affectedProjects: 2,
  },
  {
    service: "WordPress Core",
    version: "6.4.1",
    cveCount: 1,
    severity: "high" as SeverityLevel,
    affectedProjects: 1,
  },
  {
    service: "jsonwebtoken",
    version: "8.5.1",
    cveCount: 2,
    severity: "high" as SeverityLevel,
    affectedProjects: 3,
  },
  {
    service: "OpenSSL",
    version: "1.1.1k",
    cveCount: 1,
    severity: "medium" as SeverityLevel,
    affectedProjects: 4,
  },
  {
    service: "nginx",
    version: "1.20.1",
    cveCount: 1,
    severity: "low" as SeverityLevel,
    affectedProjects: 2,
  },
]

export function AffectedServicesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Affected Services</CardTitle>
        <CardDescription>Services with known vulnerabilities across projects</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>CVE Count</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Affected Projects</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affectedServices.map((service, index) => (
              <TableRow key={index} className="group hover:bg-muted/50">
                <TableCell className="font-medium">{service.service}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-xs font-mono">{service.version}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{service.cveCount}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getSeverityColor(service.severity)}>
                    {service.severity}
                  </Badge>
                </TableCell>
                <TableCell>{service.affectedProjects}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View Details
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
