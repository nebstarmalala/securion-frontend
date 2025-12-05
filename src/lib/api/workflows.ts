/**
 * Workflows API Service
 *
 * Handles all workflow automation management operations including
 * workflow CRUD, execution, testing, and statistics.
 */

import { apiClient, type ApiResponse, type PaginatedResponse } from "./client"
import type {
  Workflow,
  WorkflowExecution,
  WorkflowExecutionStats,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  ListQueryParams,
} from "../types"

// ============================================================================
// Types
// ============================================================================

export interface WorkflowFilters extends ListQueryParams {
  trigger?: "finding_created" | "finding_updated" | "project_created" | "status_changed"
  is_active?: boolean
  created_by?: string
}

export interface WorkflowExecutionFilters extends ListQueryParams {
  workflow_id?: string
  status?: "pending" | "running" | "completed" | "failed"
  date_from?: string
  date_to?: string
}

export interface TestWorkflowInput {
  trigger_data: Record<string, any>
}

export interface TestWorkflowResult {
  success: boolean
  conditions_matched: boolean
  actions_that_would_run: string[]
  errors?: string[]
}

// ============================================================================
// Workflows Service
// ============================================================================

class WorkflowsService {
  // --------------------------------------------------------------------------
  // Workflow CRUD
  // --------------------------------------------------------------------------

  /**
   * Get paginated list of workflows
   * GET /workflows
   */
  async getWorkflows(params?: WorkflowFilters): Promise<PaginatedResponse<Workflow>> {
    return await apiClient.get<PaginatedResponse<Workflow>>("/workflows", params)
  }

  /**
   * Get a single workflow by ID
   * GET /workflows/{workflow}
   */
  async getWorkflow(workflowId: string): Promise<Workflow> {
    const response = await apiClient.get<ApiResponse<Workflow>>(`/workflows/${workflowId}`)
    return response.data
  }

  /**
   * Create a new workflow
   * POST /workflows
   */
  async createWorkflow(data: CreateWorkflowInput): Promise<Workflow> {
    const response = await apiClient.post<ApiResponse<Workflow>>("/workflows", data)
    return response.data
  }

  /**
   * Update an existing workflow
   * PUT /workflows/{workflow}
   */
  async updateWorkflow(workflowId: string, data: UpdateWorkflowInput): Promise<Workflow> {
    const response = await apiClient.put<ApiResponse<Workflow>>(`/workflows/${workflowId}`, data)
    return response.data
  }

  /**
   * Delete a workflow
   * DELETE /workflows/{workflow}
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await apiClient.delete(`/workflows/${workflowId}`)
  }

  // --------------------------------------------------------------------------
  // Workflow Actions
  // --------------------------------------------------------------------------

  /**
   * Toggle workflow active status (enable/disable)
   * POST /workflows/{workflow}/toggle
   */
  async toggleWorkflow(workflowId: string): Promise<Workflow> {
    const response = await apiClient.post<ApiResponse<Workflow>>(
      `/workflows/${workflowId}/toggle`
    )
    return response.data
  }

  /**
   * Test workflow with sample data
   * POST /workflows/{workflow}/test
   */
  async testWorkflow(workflowId: string, input: TestWorkflowInput): Promise<TestWorkflowResult> {
    const response = await apiClient.post<ApiResponse<TestWorkflowResult>>(
      `/workflows/${workflowId}/test`,
      input
    )
    return response.data
  }

  /**
   * Manually execute a workflow
   * POST /workflows/{workflow}/execute
   */
  async executeWorkflow(
    workflowId: string,
    triggerData: Record<string, any>
  ): Promise<WorkflowExecution> {
    const response = await apiClient.post<ApiResponse<WorkflowExecution>>(
      `/workflows/${workflowId}/execute`,
      { trigger_data: triggerData }
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Workflow Executions
  // --------------------------------------------------------------------------

  /**
   * Get execution history for a specific workflow
   * GET /workflows/{workflow}/executions
   */
  async getWorkflowExecutions(
    workflowId: string,
    params?: WorkflowExecutionFilters
  ): Promise<PaginatedResponse<WorkflowExecution>> {
    return await apiClient.get<PaginatedResponse<WorkflowExecution>>(
      `/workflows/${workflowId}/executions`,
      params
    )
  }

  /**
   * Get all executions across all workflows
   * GET /workflows/executions
   */
  async getAllExecutions(
    params?: WorkflowExecutionFilters
  ): Promise<PaginatedResponse<WorkflowExecution>> {
    return await apiClient.get<PaginatedResponse<WorkflowExecution>>(
      "/workflows/executions",
      params
    )
  }

  /**
   * Get a single execution by ID
   * GET /workflows/executions/{execution}
   */
  async getExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await apiClient.get<ApiResponse<WorkflowExecution>>(
      `/workflows/executions/${executionId}`
    )
    return response.data
  }

  /**
   * Get execution statistics
   * GET /workflows/executions/statistics
   */
  async getExecutionStatistics(params?: {
    workflow_id?: string
    date_from?: string
    date_to?: string
  }): Promise<WorkflowExecutionStats> {
    const response = await apiClient.get<ApiResponse<WorkflowExecutionStats>>(
      "/workflows/executions/statistics",
      params
    )
    return response.data
  }

  // --------------------------------------------------------------------------
  // Convenience Aliases (for React Query compatibility)
  // --------------------------------------------------------------------------

  list = this.getWorkflows.bind(this)
  get = this.getWorkflow.bind(this)
  create = this.createWorkflow.bind(this)
  update = this.updateWorkflow.bind(this)
  delete = this.deleteWorkflow.bind(this)
  toggle = this.toggleWorkflow.bind(this)
  test = this.testWorkflow.bind(this)
  execute = this.executeWorkflow.bind(this)
  getExecutions = this.getWorkflowExecutions.bind(this)
  listAllExecutions = this.getAllExecutions.bind(this)
  getStats = this.getExecutionStatistics.bind(this)
}

// Export singleton instance
export const workflowsService = new WorkflowsService()
