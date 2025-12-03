/**
 * Authentication API Service
 * Handles login, logout, and user session management
 */

import { apiClient, type ApiResponse } from "./client"
import type { ApiUser, LoginCredentials, LoginResponse } from "@/lib/types/api"

class AuthService {
  /**
   * Login with email and password
   * Rate limited: 5 attempts per minute
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Login endpoint returns: { success, message, data: { token, token_type, user } }
    const response = await apiClient.post<{
      success: boolean
      message: string
      data: {
        token: string
        token_type: string
        user: ApiUser
      }
    }>("/auth/login", credentials)

    // Validate response structure
    if (!response.data || !response.data.token) {
      throw new Error("Invalid response structure: missing token")
    }

    if (!response.data.user) {
      throw new Error("Invalid response structure: missing user")
    }

    // Store the token
    apiClient.setToken(response.data.token)

    // Return in expected format
    return {
      token: response.data.token,
      token_type: response.data.token_type,
      user: response.data.user,
    }
  }

  /**
   * Logout and clear authentication token
   */
  async logout(): Promise<void> {
    try {
      // Logout endpoint returns {message: "Successfully logged out"} directly
      await apiClient.post<{ message: string }>("/auth/logout")
    } catch (error) {
      // Continue with logout even if API call fails
      if (import.meta.env.DEV) {
        console.error("Logout API error:", error)
      }
    } finally {
      // Always clear the token
      apiClient.removeToken()
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiUser> {
    const response = await apiClient.get<ApiResponse<ApiUser>>("/auth/user")
    return response.data
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken()
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return apiClient.getToken()
  }

  /**
   * Raw role check without hierarchy
   * Used internally for checking specific roles
   */
  private hasRoleRaw(user: ApiUser | null, roleName: string): boolean {
    if (!user) return false
    return user.roles.some((r: { name: string }) => r.name === roleName)
  }

  /**
   * Check if user has specific role
   * Includes role hierarchy: super-admin > admin > user
   * - super-admin passes all role checks
   * - admin passes "admin" and "user" role checks
   */
  hasRole(user: ApiUser | null, roleName: string): boolean {
    if (!user) return false

    // Direct role check
    if (this.hasRoleRaw(user, roleName)) return true

    // Role hierarchy: super-admin has all roles
    if (roleName !== "super-admin" && this.hasRoleRaw(user, "super-admin")) {
      return true
    }

    // Role hierarchy: admin has "user" role
    if (roleName === "user" && this.hasRoleRaw(user, "admin")) {
      return true
    }

    return false
  }

  /**
   * Check if user is a super-admin
   * Super-admins have unrestricted access to all features
   */
  isSuperAdmin(user: ApiUser | null): boolean {
    return this.hasRoleRaw(user, "super-admin")
  }

  /**
   * Check if user is an admin (includes super-admin)
   */
  isAdmin(user: ApiUser | null): boolean {
    return this.hasRoleRaw(user, "admin") || this.isSuperAdmin(user)
  }

  /**
   * Check if user has specific permission
   * Super-admin automatically has ALL permissions
   */
  hasPermission(user: ApiUser | null, permission: string): boolean {
    if (!user) return false
    // Super-admin has all permissions - bypass permission check
    if (this.isSuperAdmin(user)) return true
    return user.permissions.some((p: { name: string }) => p.name === permission)
  }

  /**
   * Check if user has any of the specified permissions
   * Super-admin automatically has ALL permissions
   */
  hasAnyPermission(user: ApiUser | null, permissions: string[]): boolean {
    if (!user) return false
    // Super-admin has all permissions
    if (this.isSuperAdmin(user)) return true
    return permissions.some((permission) =>
      user.permissions.some((p: { name: string }) => p.name === permission)
    )
  }

  /**
   * Check if user has all of the specified permissions
   * Super-admin automatically has ALL permissions
   */
  hasAllPermissions(user: ApiUser | null, permissions: string[]): boolean {
    if (!user) return false
    // Super-admin has all permissions
    if (this.isSuperAdmin(user)) return true
    return permissions.every((permission) =>
      user.permissions.some((p: { name: string }) => p.name === permission)
    )
  }

  /**
   * Check if user can access a specific project
   * Super-admin can access all projects
   * Other users need project-view permission
   */
  canAccessProject(user: ApiUser | null, projectId?: string): boolean {
    if (!user) return false
    // Super-admin can access all projects
    if (this.isSuperAdmin(user)) return true
    // Check if user has the project-view permission
    return this.hasPermission(user, "project-view")
  }
}

// Export singleton instance
export const authService = new AuthService()
