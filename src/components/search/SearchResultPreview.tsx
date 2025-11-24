/**
 * Search Result Preview Cards
 * Rich preview cards for search results with more details
 */

import { Link } from "react-router-dom"
import {
  FolderKanban,
  Shield,
  Target,
  AlertTriangle,
  Calendar,
  User,
  ExternalLink,
  Clock,
  Tag,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface BaseSearchResult {
  id: string
  type: "project" | "finding" | "scope" | "cve"
  title: string
  description?: string
  url?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

interface ProjectResult extends BaseSearchResult {
  type: "project"
  metadata?: {
    status?: string
    client?: string
    assignees?: string[]
    findingsCount?: number
  }
}

interface FindingResult extends BaseSearchResult {
  type: "finding"
  metadata?: {
    severity?: string
    status?: string
    project_id?: string
    project_name?: string
    scope_id?: string
    scope_name?: string
    assignee?: string
  }
}

interface ScopeResult extends BaseSearchResult {
  type: "scope"
  metadata?: {
    project_id?: string
    project_name?: string
    target?: string
    status?: string
    findingsCount?: number
  }
}

interface CveResult extends BaseSearchResult {
  type: "cve"
  metadata?: {
    severity?: string
    cvss?: number
    publishedDate?: string
    affectedServices?: number
  }
}

type SearchResult = ProjectResult | FindingResult | ScopeResult | CveResult

interface SearchResultPreviewProps {
  result: SearchResult
  onSelect?: () => void
  showActions?: boolean
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  info: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  open: "bg-red-500/10 text-red-600",
  planning: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  fixed: "bg-green-500/10 text-green-600",
  confirmed: "bg-orange-500/10 text-orange-600",
}

const TYPE_ICONS = {
  project: FolderKanban,
  finding: AlertTriangle,
  scope: Target,
  cve: Shield,
}

const TYPE_COLORS = {
  project: "bg-blue-500/10 text-blue-600",
  finding: "bg-orange-500/10 text-orange-600",
  scope: "bg-purple-500/10 text-purple-600",
  cve: "bg-red-500/10 text-red-600",
}

export function SearchResultPreview({
  result,
  onSelect,
  showActions = true,
}: SearchResultPreviewProps) {
  const Icon = TYPE_ICONS[result.type]
  const href = getResultHref(result)

  return (
    <Card
      className="group hover:border-primary/30 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              TYPE_COLORS[result.type]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {result.title}
                </h4>
                {result.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {result.description}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="shrink-0 text-xs capitalize">
                {result.type}
              </Badge>
            </div>

            {/* Type-specific content */}
            {result.type === "finding" && (
              <FindingPreviewContent result={result} />
            )}
            {result.type === "project" && (
              <ProjectPreviewContent result={result} />
            )}
            {result.type === "scope" && (
              <ScopePreviewContent result={result} />
            )}
            {result.type === "cve" && (
              <CvePreviewContent result={result} />
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {result.updatedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(result.updatedAt), { addSuffix: true })}
                  </span>
                )}
              </div>

              {showActions && href && (
                <Link to={href} onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FindingPreviewContent({ result }: { result: FindingResult }) {
  const { severity, status, project_name, scope_name, assignee } = result.metadata || {}

  return (
    <div className="flex flex-wrap items-center gap-2">
      {severity && (
        <Badge className={cn("text-xs", SEVERITY_COLORS[severity.toLowerCase()])}>
          {severity}
        </Badge>
      )}
      {status && (
        <Badge variant="outline" className={cn("text-xs", STATUS_COLORS[status.toLowerCase()])}>
          {status}
        </Badge>
      )}
      {project_name && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <FolderKanban className="h-3 w-3" />
          {project_name}
        </span>
      )}
      {scope_name && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Target className="h-3 w-3" />
          {scope_name}
        </span>
      )}
    </div>
  )
}

function ProjectPreviewContent({ result }: { result: ProjectResult }) {
  const { status, client, findingsCount, assignees } = result.metadata || {}

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status && (
        <Badge variant="outline" className={cn("text-xs", STATUS_COLORS[status.toLowerCase()])}>
          {status}
        </Badge>
      )}
      {client && (
        <span className="text-xs text-muted-foreground">{client}</span>
      )}
      {findingsCount !== undefined && (
        <Badge variant="secondary" className="text-xs">
          {findingsCount} findings
        </Badge>
      )}
      {assignees && assignees.length > 0 && (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {assignees.length} member{assignees.length > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  )
}

function ScopePreviewContent({ result }: { result: ScopeResult }) {
  const { project_name, target, status, findingsCount } = result.metadata || {}

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status && (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      )}
      {target && (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
          {target}
        </code>
      )}
      {project_name && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <FolderKanban className="h-3 w-3" />
          {project_name}
        </span>
      )}
      {findingsCount !== undefined && (
        <Badge variant="secondary" className="text-xs">
          {findingsCount} findings
        </Badge>
      )}
    </div>
  )
}

function CvePreviewContent({ result }: { result: CveResult }) {
  const { severity, cvss, publishedDate, affectedServices } = result.metadata || {}

  return (
    <div className="flex flex-wrap items-center gap-2">
      {severity && (
        <Badge className={cn("text-xs", SEVERITY_COLORS[severity.toLowerCase()])}>
          {severity}
        </Badge>
      )}
      {cvss !== undefined && (
        <Badge variant="outline" className="text-xs">
          CVSS: {cvss.toFixed(1)}
        </Badge>
      )}
      {publishedDate && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(publishedDate).toLocaleDateString()}
        </span>
      )}
      {affectedServices !== undefined && affectedServices > 0 && (
        <Badge variant="destructive" className="text-xs">
          {affectedServices} affected
        </Badge>
      )}
    </div>
  )
}

function getResultHref(result: SearchResult): string | null {
  switch (result.type) {
    case "project":
      return `/projects/${result.id}`
    case "finding":
      const fm = result.metadata
      if (fm?.project_id && fm?.scope_id) {
        return `/projects/${fm.project_id}/scopes/${fm.scope_id}/findings/${result.id}`
      }
      return `/findings/${result.id}`
    case "scope":
      const sm = result.metadata
      if (sm?.project_id) {
        return `/projects/${sm.project_id}/scopes/${result.id}`
      }
      return `/scopes/${result.id}`
    case "cve":
      return `/cve-tracking/${result.id}`
    default:
      return null
  }
}

/**
 * Grid of search result previews
 */
export function SearchResultsGrid({
  results,
  onResultSelect,
}: {
  results: SearchResult[]
  onResultSelect?: (result: SearchResult) => void
}) {
  if (results.length === 0) {
    return null
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {results.map((result) => (
        <SearchResultPreview
          key={`${result.type}-${result.id}`}
          result={result}
          onSelect={() => onResultSelect?.(result)}
        />
      ))}
    </div>
  )
}
