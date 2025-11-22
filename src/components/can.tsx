import { type ReactNode } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

interface CanProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  role?: string
  roles?: string[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Conditional rendering component based on permissions/roles
 *
 * Usage:
 * <Can permission="project-create">
 *   <Button>Create Project</Button>
 * </Can>
 *
 * <Can permissions={["project-view", "project-edit"]} requireAll={false}>
 *   <ProjectCard />
 * </Can>
 */
export function Can({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  children,
  fallback = null,
}: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = useAuth()

  // Check single permission
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasPerm = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
    return hasPerm ? <>{children}</> : <>{fallback}</>
  }

  // Check single role
  if (role) {
    return hasRole(role) ? <>{children}</> : <>{fallback}</>
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    const hasAnyRole = roles.some((r) => hasRole(r))
    return hasAnyRole ? <>{children}</> : <>{fallback}</>
  }

  // No permission/role specified, render children
  return <>{children}</>
}
