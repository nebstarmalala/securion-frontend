/**
 * Findings API Service
 * Handles all finding-related API operations
 */

import { apiClient, type ApiResponse, type PaginatedResponse } from "./client"
import type {
  ApiFinding,
  CreateFindingInput,
  UpdateFindingInput,
  UpdateFindingStatusInput,
  BulkUpdateFindingStatusInput,
  ListQueryParams,
} from "@/lib/types/api"

class FindingsService {
  /**
   * Get all findings with optional filtering
   */
  async getFindings(params?: ListQueryParams): Promise<PaginatedResponse<ApiFinding>> {
    // API client already throws errors for failed requests
    // Paginated responses return { data: [], links: {...}, meta: {...} } directly
    return await apiClient.get<PaginatedResponse<ApiFinding>>("/findings", params)
  }

  /**
   * Get single finding by ID
   */
  async getFinding(findingId: string): Promise<ApiFinding> {
    const response = await apiClient.get<ApiResponse<ApiFinding>>(`/findings/${findingId}`)
    return response.data
  }

  /**
   * Create new finding
   */
  async createFinding(data: CreateFindingInput): Promise<ApiFinding> {
    const response = await apiClient.post<ApiResponse<ApiFinding>>("/findings", data)
    return response.data
  }

  /**
   * Update existing finding
   */
  async updateFinding(findingId: string, data: UpdateFindingInput): Promise<ApiFinding> {
    const response = await apiClient.put<ApiResponse<ApiFinding>>(`/findings/${findingId}`, data)
    return response.data
  }

  /**
   * Update finding status
   */
  async updateFindingStatus(findingId: string, data: UpdateFindingStatusInput): Promise<ApiFinding> {
    const response = await apiClient.put<ApiResponse<ApiFinding>>(`/findings/${findingId}/status`, data)
    return response.data
  }

  /**
   * Bulk update finding statuses
   */
  async bulkUpdateFindingStatus(data: BulkUpdateFindingStatusInput): Promise<{ count: number }> {
    const response = await apiClient.put<ApiResponse<{ count: number }>>("/findings/bulk/status", data)
    return response.data
  }

  /**
   * Delete finding
   */
  async deleteFinding(findingId: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/findings/${findingId}`)
    // API client throws error if request fails, so if we reach here, it succeeded
  }

  /**
   * Get findings for a specific scope
   */
  async getScopeFindings(scopeId: string): Promise<ApiFinding[]> {
    const response = await apiClient.get<PaginatedResponse<ApiFinding>>("/findings", {
      search: scopeId,
      searchColumn: "scope_id",
      perPage: "all",
    })
    return response.data
  }

  /**
   * Get findings by severity
   */
  async getFindingsBySeverity(severity: ApiFinding["severity"]): Promise<ApiFinding[]> {
    const response = await this.getFindings({
      search: severity,
      searchColumn: "severity",
      perPage: "all",
    })
    return response.data
  }

  /**
   * Get open findings
   */
  async getOpenFindings(): Promise<ApiFinding[]> {
    const response = await this.getFindings({
      search: "open",
      searchColumn: "status",
      perPage: "all",
    })
    return response.data
  }

  /**
   * Get critical and high severity findings
   */
  async getCriticalFindings(): Promise<ApiFinding[]> {
    const allFindings = await this.getFindings({ perPage: "all" })
    return allFindings.data.filter((f) => f.severity === "critical" || f.severity === "high")
  }

  /**
   * Get finding activities
   */
  async getFindingActivities(findingId: string, params?: ListQueryParams): Promise<PaginatedResponse<any>> {
    return await apiClient.get<PaginatedResponse<any>>(`/findings/${findingId}/activities`, params)
  }

  // Convenience aliases for hook compatibility
  list = this.getFindings.bind(this)
  get = this.getFinding.bind(this)
  create = this.createFinding.bind(this)
  update = this.updateFinding.bind(this)
  updateStatus = this.updateFindingStatus.bind(this)
  bulkUpdateStatus = this.bulkUpdateFindingStatus.bind(this)
  delete = this.deleteFinding.bind(this)
  getActivities = this.getFindingActivities.bind(this)
}

// Export singleton instance
export const findingsService = new FindingsService()
