/**
 * Integrations Page
 *
 * Hub for managing third-party integrations (Slack, Jira, GitHub, Teams).
 * Allows configuring, testing, and using integrations.
 */

import { useState } from "react"
import {
  Plug,
  TestTube,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Settings,
  MessageSquare,
  GitBranch,
  Ticket,
  Users,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useTestSlack,
  useTestJira,
  useTestGitHub,
  useTestTeams,
} from "@/lib/hooks/useIntegrations"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  status: "connected" | "disconnected" | "error"
  features: string[]
}

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Test mutations
  const testSlack = useTestSlack()
  const testJira = useTestJira()
  const testGitHub = useTestGitHub()
  const testTeams = useTestTeams()

  const integrations: Integration[] = [
    {
      id: "slack",
      name: "Slack",
      description: "Send notifications and findings to Slack channels",
      icon: MessageSquare,
      color: "bg-purple-500",
      status: "disconnected",
      features: [
        "Send finding alerts to channels",
        "Real-time notifications",
        "Rich message formatting",
        "Channel selection",
      ],
    },
    {
      id: "jira",
      name: "Jira",
      description: "Create and manage Jira issues from findings",
      icon: Ticket,
      color: "bg-blue-500",
      status: "disconnected",
      features: [
        "Create issues from findings",
        "Sync status changes",
        "Custom field mapping",
        "Transition management",
      ],
    },
    {
      id: "github",
      name: "GitHub",
      description: "Create GitHub issues and track security findings",
      icon: GitBranch,
      color: "bg-gray-800",
      status: "disconnected",
      features: [
        "Create issues from findings",
        "Label management",
        "Assignee selection",
        "Close issues on resolution",
      ],
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Send notifications to Microsoft Teams channels",
      icon: Users,
      color: "bg-indigo-500",
      status: "disconnected",
      features: [
        "Webhook notifications",
        "Adaptive cards",
        "Finding details",
        "Action buttons",
      ],
    },
  ]

  const handleTest = async (integrationId: string) => {
    setTestResult(null)

    try {
      switch (integrationId) {
        case "slack":
          const slackResult = await testSlack.mutateAsync({
            channel: "#security",
            message: "Test message from Securion Dashboard",
          })
          setTestResult({ success: slackResult.success, message: slackResult.message })
          break
        case "jira":
          const jiraResult = await testJira.mutateAsync({
            project_key: "SEC",
          })
          setTestResult({ success: jiraResult.success, message: jiraResult.message })
          break
        case "github":
          const githubResult = await testGitHub.mutateAsync({
            repo: "owner/repo",
          })
          setTestResult({ success: githubResult.success, message: githubResult.message })
          break
        case "teams":
          const teamsResult = await testTeams.mutateAsync({
            webhook_url: "https://outlook.office.com/webhook/...",
            message: "Test message from Securion Dashboard",
          })
          setTestResult({ success: teamsResult.success, message: teamsResult.message })
          break
      }
    } catch (error) {
      setTestResult({ success: false, message: "Connection test failed" })
    }
  }

  const handleConfigure = (integrationId: string) => {
    setSelectedIntegration(integrationId)
    setShowConfigDialog(true)
  }

  const getIntegrationById = (id: string) => integrations.find((i) => i.id === id)

  const isTestingIntegration = (id: string) => {
    switch (id) {
      case "slack":
        return testSlack.isPending
      case "jira":
        return testJira.isPending
      case "github":
        return testGitHub.isPending
      case "teams":
        return testTeams.isPending
      default:
        return false
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: "Integrations" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
              <p className="text-muted-foreground mt-1">
                Connect with third-party services to extend functionality
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <Plug className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{integrations.length}</div>
                <p className="text-xs text-muted-foreground">Integrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.filter((i) => i.status === "connected").length}
                </div>
                <p className="text-xs text-muted-foreground">Active connections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Service types</p>
              </CardContent>
            </Card>
          </div>

          {/* Integrations Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {integrations.map((integration) => {
              const Icon = integration.icon
              return (
                <Card key={integration.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${integration.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{integration.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          integration.status === "connected"
                            ? "default"
                            : integration.status === "error"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {integration.status === "connected" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </>
                        ) : integration.status === "error" ? (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Error
                          </>
                        ) : (
                          "Not Connected"
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {integration.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(integration.id)}
                        disabled={isTestingIntegration(integration.id)}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        {isTestingIntegration(integration.id) ? "Testing..." : "Test"}
                      </Button>
                      <Button size="sm" onClick={() => handleConfigure(integration.id)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Configuration Dialog */}
          <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  Configure {selectedIntegration && getIntegrationById(selectedIntegration)?.name}
                </DialogTitle>
                <DialogDescription>
                  Enter your credentials and settings for this integration
                </DialogDescription>
              </DialogHeader>

              {selectedIntegration === "slack" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://hooks.slack.com/services/..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Channel</Label>
                    <Input placeholder="#security-alerts" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bot Name (optional)</Label>
                    <Input placeholder="Securion Bot" />
                  </div>
                </div>
              )}

              {selectedIntegration === "jira" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Jira URL</Label>
                    <Input placeholder="https://your-domain.atlassian.net" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="your-email@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>API Token</Label>
                    <Input type="password" placeholder="Your Jira API token" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Project Key</Label>
                    <Input placeholder="SEC" />
                  </div>
                </div>
              )}

              {selectedIntegration === "github" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Personal Access Token</Label>
                    <Input type="password" placeholder="ghp_..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Repository</Label>
                    <Input placeholder="owner/repo" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Labels (comma-separated)</Label>
                    <Input placeholder="security, vulnerability" />
                  </div>
                </div>
              )}

              {selectedIntegration === "teams" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://outlook.office.com/webhook/..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Card Title (optional)</Label>
                    <Input placeholder="Security Alert" />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowConfigDialog(false)}>Save Configuration</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Test Result Toast - shown inline for demo */}
          {testResult && (
            <Card className={testResult.success ? "border-green-500" : "border-red-500"}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {testResult.success ? "Connection Successful" : "Connection Failed"}
                    </p>
                    <p className="text-sm text-muted-foreground">{testResult.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentation Link */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    Check out our integration documentation for detailed setup guides
                  </p>
                </div>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
