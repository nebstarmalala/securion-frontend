/**
 * Users API Service
 * Handles all user management API operations
 *
 * Required Permissions:
 * - user-view: List and get users
 * - user-create: Create users
 * - user-edit: Update users
 * - user-delete: Delete users
 */

import { apiClient, type ApiResponse, type PaginatedApiResponse } from "./client"
import type {
  ApiUser,
  CreateUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
  UpdateUserRoleInput,
  UserQueryParams,
  PaginatedData,
} from "@/lib/types/api"

class UsersService {
  /**
   * Get all users with optional filtering and pagination
   * GET /users
   *
   * Query Parameters:
   * - page: Page number
   * - per_page: Items per page
   * - search: Search by username or email
   * - role: Filter by role name
   * - is_active: Filter by active status
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of users
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedData<ApiUser>> {
    const response = await apiClient.get<PaginatedApiResponse<ApiUser>>("/users", params)
    return response
  }

  /**
   * Get single user by ID
   * GET /users/{user}
   *
   * @param userId - User ID
   * @returns User details
   */
  async getUser(userId: string): Promise<ApiUser> {
    const response = await apiClient.get<ApiResponse<ApiUser>>(`/users/${userId}`)
    return response.data
  }

  /**
   * Create new user
   * POST /users
   *
   * @param data - User creation data
   * @returns Created user
   */
  async createUser(data: CreateUserInput): Promise<ApiUser> {
    const response = await apiClient.post<ApiResponse<ApiUser>>("/users", data)
    return response.data
  }

  /**
   * Update existing user (name/email only)
   * PUT /users/{user}
   *
   * @param userId - User ID
   * @param data - User update data
   * @returns Updated user
   */
  async updateUser(userId: string, data: UpdateUserInput): Promise<ApiUser> {
    const response = await apiClient.put<ApiResponse<ApiUser>>(`/users/${userId}`, data)
    return response.data
  }

  /**
   * Update user password
   * PUT /users/{user}/password
   *
   * @param userId - User ID
   * @param data - Password update data
   * @returns Updated user
   */
  async updatePassword(userId: string, data: UpdatePasswordInput): Promise<ApiUser> {
    const response = await apiClient.put<ApiResponse<ApiUser>>(`/users/${userId}/password`, data)
    return response.data
  }

  /**
   * Toggle user active status
   * PUT /users/{user}/toggle-status
   *
   * @param userId - User ID
   * @returns Updated user
   */
  async toggleUserStatus(userId: string): Promise<ApiUser> {
    const response = await apiClient.put<ApiResponse<ApiUser>>(`/users/${userId}/toggle-status`)
    return response.data
  }

  /**
   * Update user role
   * PUT /users/{user}/role
   *
   * @param userId - User ID
   * @param data - Role update data
   * @returns Updated user
   */
  async updateUserRole(userId: string, data: UpdateUserRoleInput): Promise<ApiUser> {
    const response = await apiClient.put<ApiResponse<ApiUser>>(`/users/${userId}/role`, data)
    return response.data
  }

  /**
   * Delete user
   * DELETE /users/{user}
   *
   * @param userId - User ID
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/users/${userId}`)
  }

  /**
   * Get active users only
   * Convenience method that filters by is_active=true
   *
   * @returns List of active users
   */
  async getActiveUsers(): Promise<ApiUser[]> {
    const response = await this.getUsers({ is_active: true, per_page: 100 })
    return response.data
  }

  /**
   * Search users by username or email
   * Convenience method for searching users
   *
   * @param searchTerm - Search term
   * @returns List of matching users
   */
  async searchUsers(searchTerm: string): Promise<ApiUser[]> {
    const response = await this.getUsers({
      search: searchTerm,
      per_page: 50,
    })
    return response.data
  }

  /**
   * Get users by role
   * Convenience method that filters by role
   *
   * @param role - Role name
   * @returns List of users with specified role
   */
  async getUsersByRole(role: string): Promise<ApiUser[]> {
    const response = await this.getUsers({ role, per_page: 100 })
    return response.data
  }

  // Convenience aliases for hook compatibility
  list = this.getUsers.bind(this)
  get = this.getUser.bind(this)
  create = this.createUser.bind(this)
  update = this.updateUser.bind(this)
  updateRole = this.updateUserRole.bind(this)
  toggleStatus = this.toggleUserStatus.bind(this)
  delete = this.deleteUser.bind(this)
}

// Export singleton instance
export const usersService = new UsersService()
