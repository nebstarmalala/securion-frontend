import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getProjectById, getSeverityColor } from "@/lib/mock-data"
import { ArrowLeft, MoreVertical, Copy, ExternalLink, Shield } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

// Mock finding details
const mockFindingDetails = {
  id: "1",
  title: "SQL Injection in User Search Endpoint",
  severity: "critical" as const,
  vulnType: "Injection",
  cvss: 9.8,
  cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
  status: "open" as const,
  description: `A critical SQL injection vulnerability was discovered in the user search endpoint (/api/users/search). The application fails to properly sanitize user input before constructing SQL queries, allowing attackers to inject malicious SQL code.

This vulnerability allows unauthenticated attackers to:
- Extract sensitive data from the database
- Modify or delete database records
- Potentially execute operating system commands
- Bypass authentication mechanisms`,
  proofOfConcept: {
    steps: [
      "Navigate to the user search functionality",
      "Intercept the search request using a proxy tool",
      "Inject SQL payload into the 'query' parameter",
      "Observe the application returning sensitive database information",
    ],
    payload: `' OR '1'='1' UNION SELECT username, password, email FROM users--`,
    request: `POST /api/users/search HTTP/1.1
Host: api.securebank.com
Content-Type: application/json

{
  "query": "' OR '1'='1' UNION SELECT username, password, email FROM users--"
}`,
    response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "results": [
    {"username": "admin", "password": "$2b$10$...", "email": "admin@securebank.com"},
    {"username": "user1", "password": "$2b$10$...", "email": "user1@securebank.com"}
  ]
}`,
  },
  remediation: {
    recommendations: `**Immediate Actions:**
1. Implement parameterized queries (prepared statements) for all database operations
2. Apply input validation and sanitization on all user inputs
3. Use an ORM framework that handles SQL escaping automatically
4. Implement least privilege principle for database accounts

**Code Example:**
\`\`\`javascript
// Vulnerable code
const query = \`SELECT * FROM users WHERE name LIKE '%\${userInput}%'\`;

// Secure code
const query = 'SELECT * FROM users WHERE name LIKE ?';
db.execute(query, [\`%\${userInput}%\`]);
\`\`\`

**Additional Measures:**
- Enable Web Application Firewall (WAF) rules for SQL injection
- Implement rate limiting on search endpoints
- Add comprehensive logging and monitoring
- Conduct security code review of all database queries`,
    references: [
      "https://owasp.org/www-community/attacks/SQL_Injection",
      "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
      "https://cwe.mitre.org/data/definitions/89.html",
    ],
  },
  relatedCVEs: ["CVE-2025-0001", "CVE-2024-9876"],
  tags: ["injection", "database", "critical", "unauthenticated"],
  assignedTo: "Alex Rivera",
  discoveredBy: "Sarah Chen",
  discoveredAt: "2025-01-28",
  lastUpdated: "2 hours ago",
}

export default function FindingDetailsPage({
  params,
}: {
  params: { id: string; scopeId: string; findingId: string }
}) {
  const project = getProjectById(params.id)

  if (!project) {
    notFound()
  }

  const finding = mockFindingDetails

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Projects", href: "/projects" },
        { label: project.name, href: `/projects/${project.id}` },
        { label: "Scopes", href: `/projects/${project.id}` },
        { label: "Main API Gateway", href: `/projects/${project.id}/scopes/${params.scopeId}` },
        { label: "Findings" },
        { label: finding.title },
      ]}
    >
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Link href={`/projects/${params.id}/scopes/${params.scopeId}`}>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Scope
              </Button>
            </Link>
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-balance">{finding.title}</h1>
              <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                {finding.severity}
              </Badge>
              <Badge
                variant="outline"
                className="text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900"
              >
                {finding.status}
              </Badge>
              <Badge variant="outline" className="font-mono">
                CVSS {finding.cvss}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Finding</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {finding.description.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="text-sm mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Vulnerability Type</h3>
                    <Badge variant="secondary">{finding.vulnType}</Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">CVSS Vector</h3>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">{finding.cvssVector}</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="poc">
                    <AccordionTrigger>Proof of Concept</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Steps to Reproduce</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                          {finding.proofOfConcept.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Payload</h4>
                          <Button variant="ghost" size="sm" className="h-7 gap-2">
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
                          {finding.proofOfConcept.payload}
                        </pre>
                      </div>
                      <Tabs defaultValue="request" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="request">Request</TabsTrigger>
                          <TabsTrigger value="response">Response</TabsTrigger>
                        </TabsList>
                        <TabsContent value="request" className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">HTTP Request</h4>
                            <Button variant="ghost" size="sm" className="h-7 gap-2">
                              <Copy className="h-3 w-3" />
                              Copy
                            </Button>
                          </div>
                          <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                            {finding.proofOfConcept.request}
                          </pre>
                        </TabsContent>
                        <TabsContent value="response" className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">HTTP Response</h4>
                            <Button variant="ghost" size="sm" className="h-7 gap-2">
                              <Copy className="h-3 w-3" />
                              Copy
                            </Button>
                          </div>
                          <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                            {finding.proofOfConcept.response}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Remediation */}
            <Card>
              <CardHeader>
                <CardTitle>Remediation</CardTitle>
                <CardDescription>Recommended fixes and security measures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {finding.remediation.recommendations.split("\n\n").map((section, index) => {
                    if (section.startsWith("**")) {
                      const [title, ...content] = section.split("\n")
                      return (
                        <div key={index} className="mb-4">
                          <h4 className="text-sm font-semibold mb-2">{title.replace(/\*\*/g, "")}</h4>
                          {content.map((line, i) => (
                            <p key={i} className="text-sm text-muted-foreground mb-1">
                              {line}
                            </p>
                          ))}
                        </div>
                      )
                    }
                    if (section.includes("```")) {
                      const code = section.split("```")[1].replace("javascript\n", "")
                      return (
                        <pre key={index} className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
                          {code}
                        </pre>
                      )
                    }
                    return (
                      <p key={index} className="text-sm mb-2">
                        {section}
                      </p>
                    )
                  })}
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">References</h4>
                  <div className="space-y-2">
                    {finding.remediation.references.map((ref, index) => (
                      <a
                        key={index}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {ref}
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        {finding.status}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem>Open</DropdownMenuItem>
                      <DropdownMenuItem>In Progress</DropdownMenuItem>
                      <DropdownMenuItem>Resolved</DropdownMenuItem>
                      <DropdownMenuItem>Accepted</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Severity</span>
                    <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                      {finding.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">CVSS Score</span>
                    <code className="font-mono font-medium">{finding.cvss}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discovered By</span>
                    <span className="font-medium">{finding.discoveredBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Assigned To</span>
                    <span className="font-medium">{finding.assignedTo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discovered</span>
                    <span>{finding.discoveredAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{finding.lastUpdated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Related CVEs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {finding.relatedCVEs.map((cveId) => (
                    <Link key={cveId} href={`/cve-tracking/${cveId}`}>
                      <div className="group rounded-lg border border-border p-3 transition-all hover:border-primary/50 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono font-medium">{cveId}</code>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {finding.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
