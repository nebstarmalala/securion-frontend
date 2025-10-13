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
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ApiProject>>>("/projects", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to fetch projects")
  }

  /**
   * Get single project by ID
   */
  async getProject(projectId: string): Promise<ApiProject> {
    const response = await apiClient.get<ApiResponse<ApiProject>>(`/projects/${projectId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to fetch project")
  }

  /**
   * Create new project
   */
  async createProject(data: CreateProjectInput): Promise<ApiProject> {
    const response = await apiClient.post<ApiResponse<ApiProject>>("/projects", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create project")
  }

  /**
   * Update existing project
   */
  async updateProject(projectId: string, data: UpdateProjectInput): Promise<ApiProject> {
    const response = await apiClient.put<ApiResponse<ApiProject>>(`/projects/${projectId}`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update project")
  }

  /**
   * Assign users to project
   */
  async assignUsers(projectId: string, data: AssignUsersInput): Promise<ApiProject> {
    const response = await apiClient.put<ApiResponse<ApiProject>>(`/projects/${projectId}/assign-users`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to assign users")
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(`/projects/${projectId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to delete project")
    }
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
}

// Export singleton instance
export const projectsService = new ProjectsService()
