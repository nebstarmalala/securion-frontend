import { useState } from "react"
import { useProjects, useAssignUsers } from "@/hooks"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { User } from "@/lib/types/api"
import { Loader2 } from "lucide-react"

interface AssignProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function AssignProjectDialog({ open, onOpenChange, user }: AssignProjectDialogProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<"lead" | "member" | "viewer">("member")

  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({ perPage: "all" })
  const assignUsersMutation = useAssignUsers(selectedProjectId)

  const handleSubmit = async () => {
    if (!selectedProjectId || !user) {
      toast.error("Please select a project")
      return
    }

    try {
      await assignUsersMutation.mutateAsync([user.id])
      toast.success("User assigned to project successfully")
      onOpenChange(false)
      setSelectedProjectId("")
      setSelectedRole("member")
    } catch (error: any) {
      toast.error(error.message || "Failed to assign user to project")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign to Project</DialogTitle>
          <DialogDescription>
            Assign {user?.name || user?.username} to a project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projectsData?.data.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role in Project</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as "lead" | "member" | "viewer")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
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
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assignUsersMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={assignUsersMutation.isPending || !selectedProjectId}
          >
            {assignUsersMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
