/**
 * Empty States Components
 * Helpful guidance when there's no data to display
 */

import { Link } from "react-router-dom"
import {
  FolderPlus,
  Search,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  Target,
  Activity,
  Inbox,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      <div className="flex gap-3">
        {action && (
          action.href ? (
            <Link to={action.href}>
              <Button>
                {action.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>
              {action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <Link to={secondaryAction.href}>
              <Button variant="outline">{secondaryAction.label}</Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}

// Pre-built empty states for common scenarios

export function NoProjectsEmpty({ onCreateClick }: { onCreateClick?: () => void }) {
  return (
    <EmptyState
      icon={<FolderPlus className="h-8 w-8 text-muted-foreground" />}
      title="No projects yet"
      description="Create your first project to start tracking your penetration testing engagements."
      action={{
        label: "Create Project",
        onClick: onCreateClick,
      }}
      secondaryAction={{
        label: "Learn More",
        href: "/docs/projects",
      }}
    />
  )
}

export function NoFindingsEmpty() {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
      title="No findings discovered"
      description="Start testing your scope to discover and document security vulnerabilities."
      action={{
        label: "View Projects",
        href: "/projects",
      }}
    />
  )
}

export function NoScopesEmpty() {
  return (
    <EmptyState
      icon={<Target className="h-8 w-8 text-muted-foreground" />}
      title="No scopes defined"
      description="Add targets to define the scope of your penetration test."
      action={{
        label: "Add Scope",
        onClick: () => {}, // Would open dialog
      }}
    />
  )
}

export function NoCVEsEmpty() {
  return (
    <EmptyState
      icon={<Shield className="h-8 w-8 text-muted-foreground" />}
      title="No CVEs tracked"
      description="Start tracking CVEs to monitor vulnerabilities affecting your organization."
      action={{
        label: "Add CVE",
        href: "/cve-tracking",
      }}
    />
  )
}

export function NoReportsEmpty() {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-muted-foreground" />}
      title="No reports generated"
      description="Generate reports to share your findings with stakeholders."
      action={{
        label: "Generate Report",
        href: "/reports",
      }}
    />
  )
}

export function NoUsersEmpty() {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No team members"
      description="Invite team members to collaborate on your security assessments."
      action={{
        label: "Invite User",
        href: "/users",
      }}
    />
  )
}

export function NoActivityEmpty() {
  return (
    <EmptyState
      icon={<Activity className="h-8 w-8 text-muted-foreground" />}
      title="No recent activity"
      description="Activity will appear here as you and your team work on projects."
    />
  )
}

export function NoSearchResultsEmpty({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try a different search term.`
          : "Try searching for projects, findings, or CVEs."
      }
      action={{
        label: "Clear Search",
        onClick: () => {}, // Would clear search
      }}
    />
  )
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title="All caught up!"
      description="You have no new notifications. We'll let you know when something needs your attention."
      className="py-12"
    />
  )
}

/**
 * Compact inline empty state for smaller spaces
 */
export function InlineEmpty({
  message,
  action,
}: {
  message: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
