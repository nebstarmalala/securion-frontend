/**
 * TemplateCard Component
 *
 * Displays a template card with type-specific styling and actions.
 */

import { useState } from "react"
import {
  FolderKanban,
  AlertTriangle,
  Globe,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Play,
  Lock,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, formatRelativeDate } from "@/lib/utils"
import type { ProjectTemplate, FindingTemplate, ScopeTemplate } from "@/lib/types"

type TemplateType = "project" | "finding" | "scope"
type Template = ProjectTemplate | FindingTemplate | ScopeTemplate

interface TemplateCardProps {
  template: Template
  type: TemplateType
  onUse?: (template: Template) => void
  onEdit?: (template: Template) => void
  onDelete?: (templateId: string) => void
  onDuplicate?: (template: Template) => void
  isDeleting?: boolean
  isUsing?: boolean
  canEdit?: boolean
}

const typeIcons = {
  project: FolderKanban,
  finding: AlertTriangle,
  scope: Globe,
}

const severityColors = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function TemplateCard({
  template,
  type,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  isDeleting,
  isUsing,
  canEdit = true,
}: TemplateCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const TypeIcon = typeIcons[type]
  const isFindingTemplate = type === "finding" && "severity" in template
  const creatorInitials = template.created_by?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  const handleDelete = () => {
    onDelete?.(template.id)
    setShowDeleteDialog(false)
  }

  const getTemplateName = () => {
    if ("title" in template) return template.title
    return template.name
  }

  const getTemplateDescription = () => {
    if ("description" in template) return template.description
    return undefined
  }

  const getTemplateSubtype = () => {
    if ("type" in template && type !== "finding") {
      return template.type
    }
    if ("vulnerability_type" in template) {
      return (template as FindingTemplate).vulnerability_type
    }
    return undefined
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Template Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    "p-1.5 rounded-md",
                    type === "project" && "bg-blue-100 dark:bg-blue-900",
                    type === "finding" && "bg-orange-100 dark:bg-orange-900",
                    type === "scope" && "bg-green-100 dark:bg-green-900"
                  )}
                >
                  <TypeIcon
                    className={cn(
                      "h-4 w-4",
                      type === "project" && "text-blue-600 dark:text-blue-400",
                      type === "finding" && "text-orange-600 dark:text-orange-400",
                      type === "scope" && "text-green-600 dark:text-green-400"
                    )}
                  />
                </div>
                <h3 className="font-medium truncate">{getTemplateName()}</h3>
              </div>

              {getTemplateDescription() && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {getTemplateDescription()}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {getTemplateSubtype() && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {getTemplateSubtype()}
                  </Badge>
                )}
                {isFindingTemplate && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      severityColors[(template as FindingTemplate).severity]
                    )}
                  >
                    {(template as FindingTemplate).severity}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    template.is_public
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  )}
                >
                  {template.is_public ? (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {creatorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{template.created_by?.name || "Unknown"}</span>
                </div>
                <span>Used {template.use_count} times</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUse?.(template)}
                disabled={isUsing}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="h-3 w-3 mr-1" />
                Use
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUse?.(template)}>
                    <Play className="h-4 w-4 mr-2" />
                    Use Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(template)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  {canEdit && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit?.(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{getTemplateName()}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
