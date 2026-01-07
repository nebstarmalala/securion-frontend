import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "@/lib/api/auth"
import type { ApiUser, LoginCredentials } from "@/lib/types/api"
import { toast } from "sonner"

interface AuthContextType {
  user: ApiUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  canAccessProject: (projectId?: string, requiredRole?: 'lead' | 'member' | 'viewer') => boolean
  isSuperAdmin: () => boolean
  isAdmin: () => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Load user data on mount if token exists
   */
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          // User data fetch failed, logout silently
          authService.logout()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      setUser(response.user)
      toast.success("Login successful", {
        description: `Welcome back, ${response.user.username}!`,
      })
      // Redirect to previous location or home
      const from = (location.state as any)?.from?.pathname || "/"
      navigate(from, { replace: true })
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.message || "Invalid credentials. Please try again.",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      toast.success("Logged out successfully")
      navigate("/login", { replace: true })
    } catch (error: any) {
      toast.error("Logout failed", {
        description: error.message || "An error occurred during logout",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Refresh current user data
   */
  const refreshUser = async () => {
    if (!authService.isAuthenticated()) return

    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      // If refresh fails, logout
      await logout()
    }
  }

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(user, permission)
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string): boolean => {
    return authService.hasRole(user, role)
  }

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return authService.hasAnyPermission(user, permissions)
  }

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return authService.hasAllPermissions(user, permissions)
  }

  /**
   * Check if user can access a specific project with optional role requirement
   * @param projectId - Optional project ID for project-specific checks
   * @param requiredRole - Optional project-level role (lead, member, viewer)
   */
  const canAccessProject = (projectId?: string, requiredRole?: 'lead' | 'member' | 'viewer'): boolean => {
    return authService.canAccessProject(user, projectId, requiredRole)
  }

  /**
   * Check if user is a super-admin (has all permissions)
   */
  const isSuperAdmin = (): boolean => {
    return authService.isSuperAdmin(user)
  }

  /**
   * Check if user is an admin (includes super-admin)
   */
  const isAdmin = (): boolean => {
    return authService.isAdmin(user)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    canAccessProject,
    isSuperAdmin,
    isAdmin,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
