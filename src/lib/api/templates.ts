/**
 * Templates API Service
 *
 * Handles all template operations for projects, findings, and scopes.
 * Supports CRUD operations and template usage/application.
 */

import { apiClient } from "./client"
import type {
  ApiResponse,
  PaginatedResponse,
  ProjectTemplate,
  FindingTemplate,
  ScopeTemplate,
  ApiProject,
  ApiFinding,
  Scope,
  ListQueryParams,
} from "../types"

// ============================================================================
// Types
// ============================================================================

export interface TemplateFilters extends ListQueryParams {
  is_public?: boolean
  created_by?: string
  search?: string
}

export interface ProjectTemplateFilters extends TemplateFilters {
  type?: "web-app" | "mobile-app" | "network" | "cloud" | "custom"
}

export interface FindingTemplateFilters extends TemplateFilters {
  severity?: "info" | "low" | "medium" | "high" | "critical"
  vulnerability_type?: string
}

export interface ScopeTemplateFilters extends TemplateFilters {
  type?: "domain" | "ip" | "subnet" | "service" | "application"
}

// Input types for creating templates
export interface CreateProjectTemplateInput {
  name: string
  description?: string
  type: "web-app" | "mobile-app" | "network" | "cloud" | "custom"
  settings?: Record<string, any>
  is_public?: boolean
}

export interface CreateFindingTemplateInput {
  title: string
  description: string
  vulnerability_type: string
  severity: "info" | "low" | "medium" | "high" | "critical"
  cvss?: {
    version: string
    score: number
    vector: string
  }
  remediation: {
    summary: string
    steps: string[]
    priority: "low" | "medium" | "high" | "critical"
  }
  references?: string[]
  tags?: string[]
  is_public?: boolean
}

export interface CreateScopeTemplateInput {
  name: string
  description?: string
  type: "domain" | "ip" | "subnet" | "service" | "application"
  default_settings?: Record<string, any>
  is_public?: boolean
}

// Update types (partial inputs)
export type UpdateProjectTemplateInput = Partial<CreateProjectTemplateInput>
export type UpdateFindingTemplateInput = Partial<CreateFindingTemplateInput>
export type UpdateScopeTemplateInput = Partial<CreateScopeTemplateInput>

// Use template input types
export interface UseProjectTemplateInput {
  name: string
  description?: string
  client_name?: string
  start_date?: string
  end_date?: string
  overrides?: Record<string, any>
}

export interface UseFindingTemplateInput {
  project_id: string
  scope_id?: string
  overrides?: {
    title?: string
    description?: string
    severity?: string
    [key: string]: any
  }
}

export interface UseScopeTemplateInput {
  project_id: string
  name?: string
  overrides?: Record<string, any>
}

// ============================================================================
// Templates Service
// ============================================================================

class TemplatesService {
  // --------------------------------------------------------------------------
  // Project Templates
  // --------------------------------------------------------------------------

  /**
   * Get paginated list of project templates
   */
  async getProjectTemplates(
    params?: ProjectTemplateFilters
  ): Promise<PaginatedResponse<ProjectTemplate>> {
    return await apiClient.get<PaginatedResponse<ProjectTemplate>>(
      "/templates/projects",
      params
    )
  }

  /**
   * Create a new project template
   */
  async createProjectTemplate(data: CreateProjectTemplateInput): Promise<ProjectTemplate> {
    const response = await apiClient.post<ApiResponse<ProjectTemplate>>(
      "/templates/projects",
      data
    )
    return response.data
  }

  /**
   * Get a single project template by ID
   */
  async getProjectTemplate(templateId: string): Promise<ProjectTemplate> {
    const response = await apiClient.get<ApiResponse<ProjectTemplate>>(
      `/templates/projects/${templateId}`
    )
    return response.data
  }

  /**
   * Update a project template
   */
  async updateProjectTemplate(
    templateId: string,
    data: UpdateProjectTemplateInput
  ): Promise<ProjectTemplate> {
    const response = await apiClient.put<ApiResponse<ProjectTemplate>>(
      `/templates/projects/${templateId}`,
      data
    )
    return response.data
  }

  /**
   * Delete a project template
   */
  async deleteProjectTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/templates/projects/${templateId}`)
  }

  /**
   * Use a project template to create a new project
   */
  async useProjectTemplate(
    templateId: string,
    data: UseProjectTemplateInput
  ): Promise<ApiProject> {
    const response = await apiClient.post<ApiResponse<ApiProject>>(
      `/templates/projects/${templateId}/use`,
      data
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Finding Templates
  // --------------------------------------------------------------------------

  /**
   * Get paginated list of finding templates
   */
  async getFindingTemplates(
    params?: FindingTemplateFilters
  ): Promise<PaginatedResponse<FindingTemplate>> {
    return await apiClient.get<PaginatedResponse<FindingTemplate>>(
      "/templates/findings",
      params
    )
  }

  /**
   * Create a new finding template
   */
  async createFindingTemplate(data: CreateFindingTemplateInput): Promise<FindingTemplate> {
    const response = await apiClient.post<ApiResponse<FindingTemplate>>(
      "/templates/findings",
      data
    )
    return response.data
  }

  /**
   * Get a single finding template by ID
   */
  async getFindingTemplate(templateId: string): Promise<FindingTemplate> {
    const response = await apiClient.get<ApiResponse<FindingTemplate>>(
      `/templates/findings/${templateId}`
    )
    return response.data
  }

  /**
   * Update a finding template
   */
  async updateFindingTemplate(
    templateId: string,
    data: UpdateFindingTemplateInput
  ): Promise<FindingTemplate> {
    const response = await apiClient.put<ApiResponse<FindingTemplate>>(
      `/templates/findings/${templateId}`,
      data
    )
    return response.data
  }

  /**
   * Delete a finding template
   */
  async deleteFindingTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/templates/findings/${templateId}`)
  }

  /**
   * Use a finding template to create a new finding
   */
  async useFindingTemplate(
    templateId: string,
    data: UseFindingTemplateInput
  ): Promise<ApiFinding> {
    const response = await apiClient.post<ApiResponse<ApiFinding>>(
      `/templates/findings/${templateId}/use`,
      data
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Scope Templates
  // --------------------------------------------------------------------------

  /**
   * Get paginated list of scope templates
   */
  async getScopeTemplates(
    params?: ScopeTemplateFilters
  ): Promise<PaginatedResponse<ScopeTemplate>> {
    return await apiClient.get<PaginatedResponse<ScopeTemplate>>(
      "/templates/scopes",
      params
    )
  }

  /**
   * Create a new scope template
   */
  async createScopeTemplate(data: CreateScopeTemplateInput): Promise<ScopeTemplate> {
    const response = await apiClient.post<ApiResponse<ScopeTemplate>>(
      "/templates/scopes",
      data
    )
    return response.data
  }

  /**
   * Get a single scope template by ID
   */
  async getScopeTemplate(templateId: string): Promise<ScopeTemplate> {
    const response = await apiClient.get<ApiResponse<ScopeTemplate>>(
      `/templates/scopes/${templateId}`
    )
    return response.data
  }

  /**
   * Update a scope template
   */
  async updateScopeTemplate(
    templateId: string,
    data: UpdateScopeTemplateInput
  ): Promise<ScopeTemplate> {
    const response = await apiClient.put<ApiResponse<ScopeTemplate>>(
      `/templates/scopes/${templateId}`,
      data
    )
    return response.data
  }

  /**
   * Delete a scope template
   */
  async deleteScopeTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/templates/scopes/${templateId}`)
  }

  /**
   * Use a scope template to create a new scope
   */
  async useScopeTemplate(templateId: string, data: UseScopeTemplateInput): Promise<Scope> {
    const response = await apiClient.post<ApiResponse<Scope>>(
      `/templates/scopes/${templateId}/use`,
      data
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Convenience Aliases (for React Query compatibility)
  // --------------------------------------------------------------------------

  // Project templates
  listProjectTemplates = this.getProjectTemplates.bind(this)
  getProject = this.getProjectTemplate.bind(this)
  createProject = this.createProjectTemplate.bind(this)
  updateProject = this.updateProjectTemplate.bind(this)
  deleteProject = this.deleteProjectTemplate.bind(this)
  useProject = this.useProjectTemplate.bind(this)

  // Finding templates
  listFindingTemplates = this.getFindingTemplates.bind(this)
  getFinding = this.getFindingTemplate.bind(this)
  createFinding = this.createFindingTemplate.bind(this)
  updateFinding = this.updateFindingTemplate.bind(this)
  deleteFinding = this.deleteFindingTemplate.bind(this)
  useFinding = this.useFindingTemplate.bind(this)

  // Scope templates
  listScopeTemplates = this.getScopeTemplates.bind(this)
  getScope = this.getScopeTemplate.bind(this)
  createScope = this.createScopeTemplate.bind(this)
  updateScope = this.updateScopeTemplate.bind(this)
  deleteScope = this.deleteScopeTemplate.bind(this)
  useScope = this.useScopeTemplate.bind(this)
}

// Export singleton instance
export const templatesService = new TemplatesService()
