import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useCreateUser, useUpdateUser, useUpdateUserRole } from "@/hooks"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { User, CreateUserInput, UpdateUserInput } from "@/lib/types/api"
import { Loader2 } from "lucide-react"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
}

type UserFormData = {
  name: string
  username: string
  email: string
  password?: string
  role_name: string
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role_name: "pentester",
    },
  })

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const updateRoleMutation = useUpdateUserRole()

  const roleValue = watch("role_name")

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        username: user.username,
        email: user.email,
        role_name: user.roles?.[0]?.name || "pentester",
        password: "",
      })
    } else {
      reset({
        name: "",
        username: "",
        email: "",
        password: "",
        role_name: "pentester",
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing) {
        const updateData: UpdateUserInput = {
          name: data.name,
          email: data.email,
        }
        await updateMutation.mutateAsync({ id: user.id, data: updateData })

        // Update role if it changed
        const currentRole = user.roles?.[0]?.name
        if (data.role_name && data.role_name !== currentRole) {
          await updateRoleMutation.mutateAsync({
            id: user.id,
            data: { role: data.role_name }
          })
        }

        toast.success("User updated successfully")
      } else {
        const createData: CreateUserInput = {
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password!,
          password_confirmation: data.password!,
          role: data.role_name,
        }
        await createMutation.mutateAsync(createData)
        toast.success("User created successfully")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditing ? "update" : "create"} user`)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || updateRoleMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information. Username cannot be changed."
              : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username", {
                required: !isEditing ? "Username is required" : false,
              })}
              placeholder="johndoe"
              disabled={isEditing}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={roleValue}
              onValueChange={(value) => setValue("role_name", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super-admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="pentester">Pentester</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            {errors.role_name && (
              <p className="text-sm text-destructive">{errors.role_name.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
