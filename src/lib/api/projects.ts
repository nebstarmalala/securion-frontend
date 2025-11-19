/**
 * Projects API Service
 * Handles all project-related API operations
 */

import { apiClient, type ApiResponse, type PaginatedResponse } from "./client"
import type {
  ApiProject,
  CreateProjectInput,
  UpdateProjectInput,
  AssignUsersInput,
  ListQueryParams,
} from "@/lib/types/api"

class ProjectsService {
  /**
   * Get all projects with optional filtering
   */
  async getProjects(params?: ListQueryParams): Promise<PaginatedResponse<ApiProject>> {
    // API client already throws errors for failed requests
    // Paginated responses return { data: [], links: {...}, meta: {...} } directly
    return await apiClient.get<PaginatedResponse<ApiProject>>("/projects", params)
  }

  /**
   * Get single project by ID
   */
  async getProject(projectId: string): Promise<ApiProject> {
    const response = await apiClient.get<ApiResponse<ApiProject>>(`/projects/${projectId}`)
    return response.data
  }

  /**
   * Create new project
   */
  async createProject(data: CreateProjectInput): Promise<ApiProject> {
    const response = await apiClient.post<ApiResponse<ApiProject>>("/projects", data)
    return response.data
  }

  /**
   * Update existing project
   */
  async updateProject(projectId: string, data: UpdateProjectInput): Promise<ApiProject> {
    const response = await apiClient.put<ApiResponse<ApiProject>>(`/projects/${projectId}`, data)
    return response.data
  }

  /**
   * Assign users to project
   */
  async assignUsers(projectId: string, data: AssignUsersInput): Promise<ApiProject> {
    const response = await apiClient.put<ApiResponse<ApiProject>>(`/projects/${projectId}/assign-users`, data)
    return response.data
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/projects/${projectId}`)
    // API client throws error if request fails, so if we reach here, it succeeded
  }

  /**
   * Get projects for current user (helper method)
   */
  async getMyProjects(): Promise<ApiProject[]> {
    const response = await this.getProjects({ perPage: "all" })
    return response.data
  }

  /**
   * Search projects
   */
  async searchProjects(searchTerm: string): Promise<ApiProject[]> {
    const response = await this.getProjects({
      search: searchTerm,
      perPage: 50,
    })
    return response.data
  }

  /**
   * Get active projects
   */
  async getActiveProjects(): Promise<ApiProject[]> {
    const response = await this.getProjects({
      search: "active",
      searchColumn: "status",
      perPage: "all",
    })
    return response.data
  }

  /**
   * Assign project lead
   */
  async assignLead(projectId: string, userId: string): Promise<ApiProject> {
    const response = await apiClient.put<ApiResponse<ApiProject>>(`/projects/${projectId}/assign-lead`, {
      user_id: userId,
    })
    return response.data
  }

  /**
   * Update member role
   */
  async updateMemberRole(projectId: string, userId: string, role: "lead" | "member" | "viewer"): Promise<ApiProject> {
    const response = await apiClient.put<ApiResponse<ApiProject>>(`/projects/${projectId}/update-member-role`, {
      user_id: userId,
      role,
    })
    return response.data
  }

  /**
   * Remove user from project
   */
  async removeUser(projectId: string, userId: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/projects/${projectId}/remove-user`)
    // Note: DELETE requests typically don't send body, pass userId as query param if needed
  }

  /**
   * Get project activities
   */
  async getProjectActivities(projectId: string, params?: ListQueryParams): Promise<PaginatedResponse<any>> {
    return await apiClient.get<PaginatedResponse<any>>(`/projects/${projectId}/activities`, params)
  }

  // Convenience aliases for hook compatibility
  list = this.getProjects.bind(this)
  get = this.getProject.bind(this)
  create = this.createProject.bind(this)
  update = this.updateProject.bind(this)
  delete = this.deleteProject.bind(this)
  getActivities = this.getProjectActivities.bind(this)
}

// Export singleton instance
export const projectsService = new ProjectsService()
