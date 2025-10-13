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
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ApiFinding>>>("/findings", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to fetch findings")
  }

  /**
   * Get single finding by ID
   */
  async getFinding(findingId: string): Promise<ApiFinding> {
    const response = await apiClient.get<ApiResponse<ApiFinding>>(`/findings/${findingId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to fetch finding")
  }

  /**
   * Create new finding
   */
  async createFinding(data: CreateFindingInput): Promise<ApiFinding> {
    const response = await apiClient.post<ApiResponse<ApiFinding>>("/findings", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create finding")
  }

  /**
   * Update existing finding
   */
  async updateFinding(findingId: string, data: UpdateFindingInput): Promise<ApiFinding> {
    const response = await apiClient.put<ApiResponse<ApiFinding>>(`/findings/${findingId}`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update finding")
  }

  /**
   * Update finding status
   */
  async updateFindingStatus(findingId: string, data: UpdateFindingStatusInput): Promise<ApiFinding> {
    const response = await apiClient.put<ApiResponse<ApiFinding>>(`/findings/${findingId}/status`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update finding status")
  }

  /**
   * Bulk update finding statuses
   */
  async bulkUpdateFindingStatus(data: BulkUpdateFindingStatusInput): Promise<{ count: number }> {
    const response = await apiClient.put<ApiResponse<{ count: number }>>("/findings/bulk/status", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to bulk update findings")
  }

  /**
   * Delete finding
   */
  async deleteFinding(findingId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(`/findings/${findingId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to delete finding")
    }
  }

  /**
   * Get findings for a specific scope
   */
  async getScopeFindings(scopeId: string): Promise<ApiFinding[]> {
    const response = await apiClient.get<ApiResponse<ApiFinding[]>>("/findings", {
      search: scopeId,
      searchColumn: "scope_id",
      perPage: "all",
    })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to fetch scope findings")
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
}

// Export singleton instance
export const findingsService = new FindingsService()
