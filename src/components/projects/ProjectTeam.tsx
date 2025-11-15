import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Users, UserPlus, MoreVertical, Crown, Trash2, UserCog, Loader2 } from "lucide-react"
import { useUsers, useAssignUsers, useAssignLead, useUpdateMemberRole, useRemoveUser } from "@/hooks"
import { toast } from "sonner"
import { Can } from "@/components/can"
import type { ApiProject } from "@/lib/types/api"

interface ProjectTeamProps {
  project: ApiProject
  onProjectUpdated: () => void
}

export function ProjectTeam({ project, onProjectUpdated }: ProjectTeamProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedMemberUserId, setSelectedMemberUserId] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<"lead" | "member" | "viewer">("member")

  const { data: usersData } = useUsers({ is_active: true, perPage: 100 })
  const assignUsersMutation = useAssignUsers(project.id)
  const assignLeadMutation = useAssignLead(project.id)
  const updateRoleMutation = useUpdateMemberRole(project.id)
  const removeUserMutation = useRemoveUser(project.id)

  const getInitials = (name?: string, username?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return username?.slice(0, 2).toUpperCase() || "U"
  }

  const handleAssignUser = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user")
      return
    }

    try {
      await assignUsersMutation.mutateAsync([selectedUserId])
      toast.success("User assigned to project")
      setIsAssignDialogOpen(false)
      setSelectedUserId("")
      onProjectUpdated()
    } catch (error: any) {
      toast.error(error.message || "Failed to assign user")
    }
  }

  const handleSetAsLead = async (userId: string) => {
    try {
      await assignLeadMutation.mutateAsync(userId)
      toast.success("Project lead updated")
      onProjectUpdated()
    } catch (error: any) {
      toast.error(error.message || "Failed to assign project lead")
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedMemberUserId || !selectedRole) {
      return
    }

    try {
      await updateRoleMutation.mutateAsync({
        userId: selectedMemberUserId,
        role: selectedRole,
      })
      toast.success("Member role updated")
      setIsRoleDialogOpen(false)
      setSelectedMemberUserId("")
      onProjectUpdated()
    } catch (error: any) {
      toast.error(error.message || "Failed to update member role")
    }
  }

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this project?`)) {
      return
    }

    try {
      await removeUserMutation.mutateAsync(userId)
      toast.success("Member removed from project")
      onProjectUpdated()
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member")
    }
  }

  const openRoleDialog = (userId: string, currentRole: string) => {
    setSelectedMemberUserId(userId)
    setSelectedRole(currentRole as "lead" | "member" | "viewer")
    setIsRoleDialogOpen(true)
  }

  // Get available users (exclude those already in the project)
  const teamMemberIds = project.team?.map((member: any) => member.id) || []
  const availableUsers = usersData?.data.filter((user) => !teamMemberIds.includes(user.id)) || []

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                {project.team?.length || 0} member{project.team?.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Can permission="project-assign-users">
              <Button onClick={() => setIsAssignDialogOpen(true)} size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Can>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.team && project.team.length > 0 ? (
              project.team.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.name, member.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name || member.username}</p>
                        {member.pivot?.role === "lead" && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {member.pivot?.role || "member"}
                    </Badge>
                    <Can permission="project-assign-users">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.pivot?.role !== "lead" && (
                            <DropdownMenuItem onClick={() => handleSetAsLead(member.id)}>
                              <Crown className="mr-2 h-4 w-4" />
                              Set as Lead
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => openRoleDialog(member.id, member.pivot?.role || "member")}
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id, member.name || member.username)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Can>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No team members assigned yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign User Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Assign a user to this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={assignUsersMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignUser}
              disabled={!selectedUserId || assignUsersMutation.isPending}
            >
              {assignUsersMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for this team member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as "lead" | "member" | "viewer")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={updateRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
