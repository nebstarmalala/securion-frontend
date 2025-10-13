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
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", credentials)

    if (response.success && response.data) {
      // Store the token
      apiClient.setToken(response.data.token)
      return response.data
    }

    throw new Error(response.message || "Login failed")
  }

  /**
   * Logout and clear authentication token
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse>("/auth/logout")
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error)
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

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get current user")
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
   * Check if user has specific permission
   */
  hasPermission(user: ApiUser | null, permission: string): boolean {
    if (!user) return false
    return user.permissions.some((p) => p.name === permission)
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: ApiUser | null, roleName: string): boolean {
    if (!user) return false
    return user.roles.some((r) => r.name === roleName)
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(user: ApiUser | null, permissions: string[]): boolean {
    if (!user) return false
    return permissions.some((permission) => this.hasPermission(user, permission))
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(user: ApiUser | null, permissions: string[]): boolean {
    if (!user) return false
    return permissions.every((permission) => this.hasPermission(user, permission))
  }
}

// Export singleton instance
export const authService = new AuthService()
