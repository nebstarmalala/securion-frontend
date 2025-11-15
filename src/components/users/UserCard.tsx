import { User } from "@/lib/types/api"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Mail, MoreVertical, Edit, Trash2, PowerOff, Power, FolderPlus } from "lucide-react"
import { Can } from "@/components/can"

interface UserCardProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
  onToggleStatus: (userId: string) => void
  onAssignProject?: (user: User) => void
}

export function UserCard({ user, onEdit, onDelete, onToggleStatus, onAssignProject }: UserCardProps) {
  const getInitials = (name?: string) => {
    if (!name) {
      return user.username?.slice(0, 2).toUpperCase() || "U"
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "super-admin":
        return "destructive"
      case "admin":
        return "default"
      case "lead":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatRoleName = (roleName: string): string => {
    return roleName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const primaryRole = user.roles?.[0]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <Can permission="user-edit">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              {onAssignProject && (
                <Can permission="project-assign-users">
                  <DropdownMenuItem onClick={() => onAssignProject(user)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Assign to Project
                  </DropdownMenuItem>
                </Can>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleStatus(user.id)}>
                {user.is_active ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <Can permission="user-delete">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(user.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </Can>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{user.name || user.username}</h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="truncate">{user.email}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {primaryRole && (
            <Badge variant={getRoleBadgeVariant(primaryRole.name)}>
              {primaryRole.display_name || formatRoleName(primaryRole.name)}
            </Badge>
          )}
          {user.roles && user.roles.length > 1 && (
            <Badge variant="outline">+{user.roles.length - 1} more</Badge>
          )}
          {user.is_active ? (
            <Badge variant="outline" className="border-green-500 text-green-500">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gray-500 text-gray-500">
              Inactive
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        Created {user.created_at_human || "recently"}
      </CardFooter>
    </Card>
  )
}
