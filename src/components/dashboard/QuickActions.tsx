/**
 * Quick Actions Panel
 * Provides fast access to common actions from the dashboard
 */

import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Plus,
  Search,
  FolderPlus,
  FileText,
  Shield,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectWizard } from "@/components/forms/ProjectWizard"
import { useAuth } from "@/lib/contexts/auth-context"
import { cn } from "@/lib/utils"

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  permission?: string
  variant?: "default" | "primary"
}

export function QuickActions() {
  const { hasPermission } = useAuth()
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)

  const actions: QuickAction[] = [
    {
      id: "new-project",
      label: "New Project",
      description: "Start a new pentest engagement",
      icon: <FolderPlus className="h-5 w-5" />,
      onClick: () => setProjectDialogOpen(true),
      permission: "project-create",
      variant: "primary",
    },
    {
      id: "quick-search",
      label: "Quick Search",
      description: "Find projects, findings, or CVEs",
      icon: <Search className="h-5 w-5" />,
      onClick: () => {
        // Trigger global search (Cmd+K)
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          bubbles: true,
        })
        document.dispatchEvent(event)
      },
    },
    {
      id: "generate-report",
      label: "Generate Report",
      description: "Create a new assessment report",
      icon: <FileText className="h-5 w-5" />,
      href: "/reports",
      permission: "report-create",
    },
    {
      id: "cve-tracking",
      label: "Track CVEs",
      description: "Monitor vulnerability advisories",
      icon: <Shield className="h-5 w-5" />,
      href: "/cve-tracking",
      permission: "cve-tracking-view",
    },
  ]

  // Filter actions by permission
  const visibleActions = actions.filter(
    action => !action.permission || hasPermission(action.permission)
  )

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleActions.map((action) => (
              <QuickActionButton key={action.id} action={action} />
            ))}
          </div>
        </CardContent>
      </Card>

      <ProjectWizard
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
      />
    </>
  )
}

function QuickActionButton({ action }: { action: QuickAction }) {
  const content = (
    <div
      className={cn(
        "group relative flex flex-col items-start gap-2 rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent cursor-pointer",
        action.variant === "primary" && "border-primary/30 bg-primary/5"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          action.variant === "primary"
            ? "bg-primary text-primary-foreground"
            : "bg-muted group-hover:bg-primary/10"
        )}
      >
        {action.icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold">{action.label}</h4>
        <p className="text-xs text-muted-foreground">{action.description}</p>
      </div>
      <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  )

  if (action.href) {
    return <Link to={action.href}>{content}</Link>
  }

  return (
    <button onClick={action.onClick} className="text-left w-full">
      {content}
    </button>
  )
}

/**
 * Compact version for sidebars or smaller spaces
 */
export function QuickActionsCompact() {
  const { hasPermission } = useAuth()
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {hasPermission("project-create") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProjectDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
        <Link to="/reports">
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </Button>
        </Link>
        <Link to="/cve-tracking">
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            CVEs
          </Button>
        </Link>
      </div>

      <NewProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
      />
    </>
  )
}
