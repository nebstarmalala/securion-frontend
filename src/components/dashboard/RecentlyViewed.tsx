/**
 * Recently Viewed Section
 * Shows recently viewed items for quick access
 */

import { Link } from "react-router-dom"
import {
  Clock,
  Folder,
  Target,
  Shield,
  FileText,
  AlertTriangle,
  X,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRecentlyViewed, type RecentlyViewedItem } from "@/lib/hooks/useRecentlyViewed"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const TYPE_ICONS: Record<RecentlyViewedItem["type"], React.ReactNode> = {
  project: <Folder className="h-4 w-4" />,
  scope: <Target className="h-4 w-4" />,
  finding: <AlertTriangle className="h-4 w-4" />,
  cve: <Shield className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
}

const TYPE_COLORS: Record<RecentlyViewedItem["type"], string> = {
  project: "bg-blue-500/10 text-blue-500",
  scope: "bg-purple-500/10 text-purple-500",
  finding: "bg-orange-500/10 text-orange-500",
  cve: "bg-red-500/10 text-red-500",
  report: "bg-green-500/10 text-green-500",
}

export function RecentlyViewed() {
  const { items, removeItem, clearAll } = useRecentlyViewed()

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recently Viewed
          </CardTitle>
          <CardDescription>Your recent activity will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No recent items yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start exploring projects and findings
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recently Viewed
            </CardTitle>
            <CardDescription>Quick access to your recent items</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={clearAll}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear history</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1 p-4 pt-0">
            {items.map((item) => (
              <RecentItem
                key={`${item.type}-${item.id}`}
                item={item}
                onRemove={() => removeItem(item.id, item.type)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface RecentItemProps {
  item: RecentlyViewedItem
  onRemove: () => void
}

function RecentItem({ item, onRemove }: RecentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(item.viewedAt), { addSuffix: true })

  return (
    <div className="group relative flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent">
      <Link to={item.href} className="flex flex-1 items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            TYPE_COLORS[item.type]
          )}
        >
          {TYPE_ICONS[item.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{item.type}</span>
            {item.metadata?.projectName && (
              <>
                <span>·</span>
                <span className="truncate">{item.metadata.projectName}</span>
              </>
            )}
            <span>·</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => {
          e.preventDefault()
          onRemove()
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

/**
 * Compact horizontal list of recent items
 */
export function RecentlyViewedCompact() {
  const { items } = useRecentlyViewed()

  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-xs text-muted-foreground shrink-0">Recent:</span>
      {items.slice(0, 5).map((item) => (
        <Link
          key={`${item.type}-${item.id}`}
          to={item.href}
          className="shrink-0"
        >
          <Badge
            variant="outline"
            className="gap-1.5 hover:bg-accent transition-colors cursor-pointer"
          >
            {TYPE_ICONS[item.type]}
            <span className="max-w-[100px] truncate">{item.title}</span>
          </Badge>
        </Link>
      ))}
    </div>
  )
}
