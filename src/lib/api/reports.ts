/**
 * Reports API Service
 *
 * Handles all report generation, management, and export operations.
 * Includes saved report templates and various export formats.
 */

import { apiClient } from "./client"
import type {
  ApiResponse,
  PaginatedResponse,
  Report,
  SavedReportTemplate,
  GenerateReportInput,
  CreateSavedReportTemplateInput,
  ListQueryParams,
} from "../types"

// ============================================================================
// Types
// ============================================================================

export interface ReportFilters extends ListQueryParams {
  project_id?: string
  report_type?: "executive" | "technical" | "compliance" | "custom"
  status?: "pending" | "generating" | "completed" | "failed"
  format?: "pdf" | "docx" | "html"
  generated_by?: string
  date_from?: string
  date_to?: string
}

export interface ReportType {
  id: string
  name: string
  description: string
  formats: string[]
  options: {
    name: string
    key: string
    type: "boolean" | "string" | "number" | "select"
    default?: any
    options?: string[]
  }[]
}

export interface ReportStatusResponse {
  status: "pending" | "generating" | "completed" | "failed"
  progress?: number
  message?: string
  download_url?: string
}

export interface SavedReportTemplateFilters extends ListQueryParams {
  report_type?: "executive" | "technical" | "compliance" | "custom"
  format?: "pdf" | "docx" | "html"
  is_public?: boolean
  created_by?: string
}

export interface UpdateSavedReportTemplateInput {
  name?: string
  description?: string
  report_type?: "executive" | "technical" | "compliance" | "custom"
  format?: "pdf" | "docx" | "html"
  is_public?: boolean
  options?: Record<string, any>
}

export interface ExportFilters {
  project_id?: string
  status?: string
  severity?: string
  date_from?: string
  date_to?: string
  format?: "csv" | "json" | "xlsx"
}

// ============================================================================
// Reports Service
// ============================================================================

class ReportsService {
  // --------------------------------------------------------------------------
  // Report Management
  // --------------------------------------------------------------------------

  /**
   * Get paginated list of reports
   */
  async getReports(params?: ReportFilters): Promise<PaginatedResponse<Report>> {
    return await apiClient.get<PaginatedResponse<Report>>("/reports", params)
  }

  /**
   * Get available report types and their options
   */
  async getReportTypes(): Promise<ReportType[]> {
    const response = await apiClient.get<ApiResponse<ReportType[]>>("/reports/types")
    return response.data
  }

  /**
   * Generate a new report
   */
  async generateReport(data: GenerateReportInput): Promise<Report> {
    const response = await apiClient.post<ApiResponse<Report>>("/reports/generate", data)
    return response.data
  }

  /**
   * Get a single report by ID
   */
  async getReport(reportId: string): Promise<Report> {
    const response = await apiClient.get<ApiResponse<Report>>(`/reports/${reportId}`)
    return response.data
  }

  /**
   * Get report generation status (for polling)
   */
  async getReportStatus(reportId: string): Promise<ReportStatusResponse> {
    const response = await apiClient.get<ApiResponse<ReportStatusResponse>>(
      `/reports/${reportId}/status`
    )
    return response.data
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<void> {
    await apiClient.delete(`/reports/${reportId}`)
  }

  /**
   * Download a report file
   */
  async downloadReport(reportId: string, filename?: string): Promise<void> {
    await apiClient.download(`/export/reports/${reportId}`, filename)
  }

  // --------------------------------------------------------------------------
  // Saved Report Templates
  // --------------------------------------------------------------------------

  /**
   * Get paginated list of saved report templates
   */
  async getSavedReportTemplates(
    params?: SavedReportTemplateFilters
  ): Promise<PaginatedResponse<SavedReportTemplate>> {
    return await apiClient.get<PaginatedResponse<SavedReportTemplate>>("/reports/saved", params)
  }

  /**
   * Create a new saved report template
   */
  async createSavedReportTemplate(
    data: CreateSavedReportTemplateInput
  ): Promise<SavedReportTemplate> {
    const response = await apiClient.post<ApiResponse<SavedReportTemplate>>(
      "/reports/saved",
      data
    )
    return response.data
  }

  /**
   * Get a single saved report template by ID
   */
  async getSavedReportTemplate(templateId: string): Promise<SavedReportTemplate> {
    const response = await apiClient.get<ApiResponse<SavedReportTemplate>>(
      `/reports/saved/${templateId}`
    )
    return response.data
  }

  /**
   * Update a saved report template
   */
  async updateSavedReportTemplate(
    templateId: string,
    data: UpdateSavedReportTemplateInput
  ): Promise<SavedReportTemplate> {
    const response = await apiClient.put<ApiResponse<SavedReportTemplate>>(
      `/reports/saved/${templateId}`,
      data
    )
    return response.data
  }

  /**
   * Delete a saved report template
   */
  async deleteSavedReportTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/reports/saved/${templateId}`)
  }

  /**
   * Generate a report from a saved template
   */
  async generateFromTemplate(
    templateId: string,
    projectId: string,
    overrides?: Partial<GenerateReportInput>
  ): Promise<Report> {
    const response = await apiClient.post<ApiResponse<Report>>(
      `/reports/saved/${templateId}/generate`,
      {
        project_id: projectId,
        ...overrides,
      }
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Export Functions
  // --------------------------------------------------------------------------

  /**
   * Export projects data
   */
  async exportProjects(filters?: ExportFilters, filename?: string): Promise<void> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const url = `/export/projects${queryString ? `?${queryString}` : ""}`
    await apiClient.download(url, filename || `projects-export.${filters?.format || "csv"}`)
  }

  /**
   * Export findings data
   */
  async exportFindings(filters?: ExportFilters, filename?: string): Promise<void> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const url = `/export/findings${queryString ? `?${queryString}` : ""}`
    await apiClient.download(url, filename || `findings-export.${filters?.format || "csv"}`)
  }

  /**
   * Export scopes data
   */
  async exportScopes(filters?: ExportFilters, filename?: string): Promise<void> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const url = `/export/scopes${queryString ? `?${queryString}` : ""}`
    await apiClient.download(url, filename || `scopes-export.${filters?.format || "csv"}`)
  }

  /**
   * Export CVEs data
   */
  async exportCVEs(filters?: ExportFilters, filename?: string): Promise<void> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const url = `/export/cves${queryString ? `?${queryString}` : ""}`
    await apiClient.download(url, filename || `cves-export.${filters?.format || "csv"}`)
  }

  // --------------------------------------------------------------------------
  // Convenience Aliases (for React Query compatibility)
  // --------------------------------------------------------------------------

  list = this.getReports.bind(this)
  get = this.getReport.bind(this)
  getTypes = this.getReportTypes.bind(this)
  generate = this.generateReport.bind(this)
  getStatus = this.getReportStatus.bind(this)
  delete = this.deleteReport.bind(this)
  download = this.downloadReport.bind(this)

  // Saved templates
  listTemplates = this.getSavedReportTemplates.bind(this)
  getTemplate = this.getSavedReportTemplate.bind(this)
  createTemplate = this.createSavedReportTemplate.bind(this)
  updateTemplate = this.updateSavedReportTemplate.bind(this)
  deleteTemplate = this.deleteSavedReportTemplate.bind(this)
  generateFromSaved = this.generateFromTemplate.bind(this)
}

// Export singleton instance
export const reportsService = new ReportsService()
