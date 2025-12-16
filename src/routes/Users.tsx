import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useUsers, useDeleteUser, useToggleUserStatus } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, UserPlus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { UserCard } from "@/components/users/UserCard"
import { UserFormDialog } from "@/components/users/UserFormDialog"
import { AssignProjectDialog } from "@/components/users/AssignProjectDialog"
import { useDebounce } from "@/hooks"
import { toast } from "sonner"
import type { ApiUser } from "@/lib/types/api"

export default function Users() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [assigningProjectUser, setAssigningProjectUser] = useState<ApiUser | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, error, refetch } = useUsers({
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    is_active: statusFilter ? statusFilter === "active" : undefined,
  })

  const deleteMutation = useDeleteUser()
  const toggleStatusMutation = useToggleUserStatus()

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      await deleteMutation.mutateAsync(userId)
      toast.success("User deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user")
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(userId)
      toast.success("User status updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status")
    }
  }

  const handleEdit = (user: ApiUser) => {
    setEditingUser(user)
  }

  const handleAssignProject = (user: ApiUser) => {
    setAssigningProjectUser(user)
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingUser(null)
  }

  const handleCloseAssignDialog = () => {
    setAssigningProjectUser(null)
  }

  return (
    <ProtectedRoute requiredPermission="user-view">
      <DashboardLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Users" },
        ]}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">Manage system users and permissions</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="pentester">Pentester</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error instanceof Error ? error.message : "Failed to load users"}</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && data && data.data.length === 0 && (
            <EmptyState
              icon={UserPlus}
              title="No users found"
              description={search ? "Try adjusting your search or filters" : "Get started by adding your first user"}
              action={
                !search && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                )
              }
            />
          )}

          {/* Users Grid */}
          {!isLoading && data && data.data.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onAssignProject={handleAssignProject}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.meta && data.meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {data.meta.from} to {data.meta.to} of {data.meta.total} users
              </p>
              {/* Add pagination component here */}
            </div>
          )}
        </div>

        {/* User Form Dialog */}
        <UserFormDialog
          open={isCreateDialogOpen || !!editingUser}
          onOpenChange={(open) => !open && handleCloseDialog()}
          user={editingUser}
        />

        {/* Assign Project Dialog */}
        <AssignProjectDialog
          open={!!assigningProjectUser}
          onOpenChange={(open) => !open && handleCloseAssignDialog()}
          user={assigningProjectUser}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
