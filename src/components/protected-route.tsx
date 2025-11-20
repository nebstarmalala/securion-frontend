import { type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/lib/contexts/auth-context"
import { Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProtectedRouteProps {
  children: ReactNode
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
}

/**
 * Protected Route Wrapper
 * Redirects unauthenticated users to login
 * Shows permission denied for users without required permissions
 */
export function ProtectedRoute({
  children,
  permissions,
  requireAll = false,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasAnyPermission, hasAllPermissions, user } = useAuth()
  const location = useLocation()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check permissions if specified
  if (permissions && permissions.length > 0) {
    const hasPermission = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)

    if (!hasPermission) {
      // Show custom fallback or default permission denied message
      if (fallback) {
        return <>{fallback}</>
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Access Denied</CardTitle>
              </div>
              <CardDescription>
                You don't have permission to access this page. Please contact your administrator if you believe this is
                an error.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-2">Required Permissions:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {permissions.map((permission) => (
                    <li key={permission} className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      <code className="text-xs">{permission}</code>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-2">Your Current Role:</p>
                <div className="flex flex-wrap gap-2">
                  {user?.roles.map((role) => (
                    <span key={role.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
              <Button onClick={() => (window.location.href = "/")} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>
}
