import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getReportById, getProjectById, getUserById, getSeverityColor } from "@/lib/mock-data"
import { ArrowLeft, Download, FileText, Calendar, User, Building2, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ReportViewPage({ params }: { params: { id: string } }) {
  const report = getReportById(params.id)

  if (!report) {
    notFound()
  }

  const project = getProjectById(report.projectId)
  const author = getUserById(report.generatedBy)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: report.projectName }]}>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{report.projectName}</h1>
              <Badge
                variant="outline"
                className={
                  report.status === "final"
                    ? "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900"
                    : report.status === "draft"
                      ? "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-900"
                      : "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-900"
                }
              >
                {report.status}
              </Badge>
            </div>
            <p className="text-muted-foreground capitalize">
              {report.reportType} Report - Version {report.version}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                PDF Document
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Excel Spreadsheet
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Word Document
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                HTML Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                JSON Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Report Metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{report.client}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Generated</p>
                  <p className="font-medium">{new Date(report.generatedDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Author</p>
                  <p className="font-medium">{author?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">File Size</p>
                  <p className="font-medium">{report.fileSize}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-balance">
                This {report.reportType} report presents the findings from the penetration testing engagement conducted
                for {report.client}. The assessment was performed over a period of {report.summary.testDuration},
                covering {report.summary.scopesTested} distinct scopes. The testing methodology followed industry
                standards including OWASP, PTES, and NIST guidelines.
              </p>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Overall Risk Assessment</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Score</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-chart-3 via-chart-2 to-chart-1 transition-all"
                          style={{ width: `${(report.summary.riskScore / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{report.summary.riskScore}/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Findings</span>
                    <span className="font-medium">{report.summary.totalFindings}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Scopes Tested</span>
                    <span className="font-medium">{report.summary.scopesTested}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Test Duration</span>
                    <span className="font-medium">{report.summary.testDuration}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Findings Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getSeverityColor("critical")}>
                      Critical
                    </Badge>
                    <span className="text-2xl font-bold">{report.summary.criticalFindings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getSeverityColor("high")}>
                      High
                    </Badge>
                    <span className="text-2xl font-bold">{report.summary.highFindings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getSeverityColor("medium")}>
                      Medium
                    </Badge>
                    <span className="text-2xl font-bold">{report.summary.mediumFindings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getSeverityColor("low")}>
                      Low
                    </Badge>
                    <span className="text-2xl font-bold">{report.summary.lowFindings}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-chart-2" />
              Key Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chart-1/10 text-chart-1 text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Immediate Action Required</h4>
                  <p className="text-sm text-muted-foreground">
                    Address all critical severity findings within 7 days. These vulnerabilities pose immediate risk to
                    the organization and could lead to data breaches or system compromise.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chart-2/10 text-chart-2 text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Security Controls Enhancement</h4>
                  <p className="text-sm text-muted-foreground">
                    Implement additional security controls including input validation, output encoding, and proper
                    authentication mechanisms across all identified endpoints.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chart-3/10 text-chart-3 text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Regular Security Assessments</h4>
                  <p className="text-sm text-muted-foreground">
                    Establish a continuous security testing program with quarterly penetration tests and monthly
                    vulnerability scans to maintain security posture.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Testing Methodology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                The penetration testing engagement followed a structured methodology aligned with industry best
                practices:
              </p>
              <ul>
                <li>
                  <strong>Reconnaissance:</strong> Information gathering and attack surface mapping
                </li>
                <li>
                  <strong>Vulnerability Analysis:</strong> Automated and manual vulnerability identification
                </li>
                <li>
                  <strong>Exploitation:</strong> Controlled exploitation of identified vulnerabilities
                </li>
                <li>
                  <strong>Post-Exploitation:</strong> Assessment of potential impact and lateral movement
                </li>
                <li>
                  <strong>Reporting:</strong> Comprehensive documentation of findings and remediation guidance
                </li>
              </ul>
              <p>
                All testing activities were conducted in accordance with the agreed-upon rules of engagement and with
                proper authorization from {report.client}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
