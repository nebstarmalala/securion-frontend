/**
 * Workflows React Query Hooks
 *
 * Provides hooks for workflow automation management including
 * CRUD operations, execution, testing, and statistics.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  workflowsService,
  type WorkflowFilters,
  type WorkflowExecutionFilters,
  type TestWorkflowInput,
} from "../api/workflows"
import type { CreateWorkflowInput, UpdateWorkflowInput } from "../types"
import { handleError } from "../errors"

// ============================================================================
// Query Keys Factory
// ============================================================================

export const workflowKeys = {
  all: ["workflows"] as const,
  lists: () => [...workflowKeys.all, "list"] as const,
  list: (filters?: WorkflowFilters) => [...workflowKeys.lists(), filters] as const,
  details: () => [...workflowKeys.all, "detail"] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,

  // Executions
  executions: {
    all: ["workflow-executions"] as const,
    lists: () => [...workflowKeys.executions.all, "list"] as const,
    list: (filters?: WorkflowExecutionFilters) => [...workflowKeys.executions.lists(), filters] as const,
    byWorkflow: (workflowId: string, filters?: WorkflowExecutionFilters) =>
      [...workflowKeys.executions.all, "workflow", workflowId, filters] as const,
    details: () => [...workflowKeys.executions.all, "detail"] as const,
    detail: (id: string) => [...workflowKeys.executions.details(), id] as const,
    stats: (params?: Record<string, any>) => [...workflowKeys.executions.all, "stats", params] as const,
  },
}

// ============================================================================
// Workflow Queries
// ============================================================================

/**
 * Hook to fetch paginated list of workflows
 */
export function useWorkflows(filters?: WorkflowFilters) {
  return useQuery({
    queryKey: workflowKeys.list(filters),
    queryFn: () => workflowsService.getWorkflows(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch a single workflow by ID
 */
export function useWorkflow(workflowId: string | undefined) {
  return useQuery({
    queryKey: workflowKeys.detail(workflowId!),
    queryFn: () => workflowsService.getWorkflow(workflowId!),
    enabled: !!workflowId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch active workflows only
 */
export function useActiveWorkflows(filters?: Omit<WorkflowFilters, "is_active">) {
  return useWorkflows({ ...filters, is_active: true })
}

/**
 * Hook to fetch workflows by trigger type
 */
export function useWorkflowsByTrigger(
  trigger: WorkflowFilters["trigger"],
  filters?: Omit<WorkflowFilters, "trigger">
) {
  return useWorkflows({ ...filters, trigger })
}

// ============================================================================
// Workflow Mutations
// ============================================================================

/**
 * Hook to create a new workflow
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkflowInput) => workflowsService.createWorkflow(data),
    onSuccess: (newWorkflow) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      toast.success("Workflow created successfully", {
        description: `"${newWorkflow.name}" is now ${newWorkflow.is_active ? "active" : "inactive"}.`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create workflow")
    },
  })
}

/**
 * Hook to update an existing workflow
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowInput }) =>
      workflowsService.updateWorkflow(id, data),
    onSuccess: (updatedWorkflow, { id }) => {
      queryClient.setQueryData(workflowKeys.detail(id), updatedWorkflow)
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      toast.success("Workflow updated successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to update workflow")
    },
  })
}

/**
 * Hook to delete a workflow
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workflowId: string) => workflowsService.deleteWorkflow(workflowId),
    onSuccess: (_, workflowId) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      queryClient.removeQueries({ queryKey: workflowKeys.detail(workflowId) })
      toast.success("Workflow deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete workflow")
    },
  })
}

/**
 * Hook to toggle workflow active status
 */
export function useToggleWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workflowId: string) => workflowsService.toggleWorkflow(workflowId),
    onSuccess: (updatedWorkflow, workflowId) => {
      queryClient.setQueryData(workflowKeys.detail(workflowId), updatedWorkflow)
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      toast.success(
        updatedWorkflow.is_active ? "Workflow enabled" : "Workflow disabled",
        {
          description: `"${updatedWorkflow.name}" is now ${updatedWorkflow.is_active ? "active" : "inactive"}.`,
        }
      )
    },
    onError: (error) => {
      handleError(error, "Failed to toggle workflow")
    },
  })
}

/**
 * Hook to test a workflow
 */
export function useTestWorkflow() {
  return useMutation({
    mutationFn: ({ workflowId, input }: { workflowId: string; input: TestWorkflowInput }) =>
      workflowsService.testWorkflow(workflowId, input),
    onSuccess: (result) => {
      if (result.success && result.conditions_matched) {
        toast.success("Workflow test passed", {
          description: `${result.actions_that_would_run.length} action(s) would be executed.`,
        })
      } else if (result.success && !result.conditions_matched) {
        toast.info("Workflow test completed", {
          description: "No conditions matched for the provided data.",
        })
      } else {
        toast.error("Workflow test failed", {
          description: result.errors?.join(", ") || "Unknown error",
        })
      }
    },
    onError: (error) => {
      handleError(error, "Failed to test workflow")
    },
  })
}

/**
 * Hook to manually execute a workflow
 */
export function useExecuteWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, triggerData }: { workflowId: string; triggerData: Record<string, any> }) =>
      workflowsService.executeWorkflow(workflowId, triggerData),
    onSuccess: (execution, { workflowId }) => {
      // Invalidate executions for this workflow
      queryClient.invalidateQueries({
        queryKey: workflowKeys.executions.byWorkflow(workflowId),
      })
      queryClient.invalidateQueries({ queryKey: workflowKeys.executions.lists() })
      queryClient.invalidateQueries({ queryKey: workflowKeys.executions.stats() })

      toast.success("Workflow execution started", {
        description: `Execution ID: ${execution.id}`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to execute workflow")
    },
  })
}

// ============================================================================
// Execution Queries
// ============================================================================

/**
 * Hook to fetch executions for a specific workflow
 */
export function useWorkflowExecutions(
  workflowId: string | undefined,
  filters?: WorkflowExecutionFilters
) {
  return useQuery({
    queryKey: workflowKeys.executions.byWorkflow(workflowId!, filters),
    queryFn: () => workflowsService.getWorkflowExecutions(workflowId!, filters),
    enabled: !!workflowId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to fetch all executions across all workflows
 */
export function useAllWorkflowExecutions(filters?: WorkflowExecutionFilters) {
  return useQuery({
    queryKey: workflowKeys.executions.list(filters),
    queryFn: () => workflowsService.getAllExecutions(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to fetch a single execution by ID
 */
export function useWorkflowExecution(executionId: string | undefined) {
  return useQuery({
    queryKey: workflowKeys.executions.detail(executionId!),
    queryFn: () => workflowsService.getExecution(executionId!),
    enabled: !!executionId,
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to fetch execution statistics
 */
export function useWorkflowExecutionStats(params?: {
  workflow_id?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: workflowKeys.executions.stats(params),
    queryFn: () => workflowsService.getExecutionStatistics(params),
    staleTime: 60 * 1000, // 1 minute
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to prefetch a workflow
 */
export function usePrefetchWorkflow() {
  const queryClient = useQueryClient()

  return (workflowId: string) => {
    queryClient.prefetchQuery({
      queryKey: workflowKeys.detail(workflowId),
      queryFn: () => workflowsService.getWorkflow(workflowId),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Combined hook for workflow management
 */
export function useWorkflowManagement(filters?: WorkflowFilters) {
  const workflows = useWorkflows(filters)
  const createWorkflow = useCreateWorkflow()
  const updateWorkflow = useUpdateWorkflow()
  const deleteWorkflow = useDeleteWorkflow()
  const toggleWorkflow = useToggleWorkflow()
  const testWorkflow = useTestWorkflow()
  const executeWorkflow = useExecuteWorkflow()
  const prefetchWorkflow = usePrefetchWorkflow()

  return {
    // Query
    workflows,
    isLoading: workflows.isLoading,
    error: workflows.error,

    // Mutations
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    testWorkflow,
    executeWorkflow,

    // Utilities
    prefetchWorkflow,

    // Mutation states
    isCreating: createWorkflow.isPending,
    isUpdating: updateWorkflow.isPending,
    isDeleting: deleteWorkflow.isPending,
    isToggling: toggleWorkflow.isPending,
    isTesting: testWorkflow.isPending,
    isExecuting: executeWorkflow.isPending,
  }
}

/**
 * Combined hook for workflow execution monitoring
 */
export function useWorkflowExecutionMonitoring(workflowId?: string) {
  const executions = workflowId
    ? useWorkflowExecutions(workflowId)
    : useAllWorkflowExecutions()
  const stats = useWorkflowExecutionStats(
    workflowId ? { workflow_id: workflowId } : undefined
  )

  return {
    executions,
    stats,
    isLoading: executions.isLoading || stats.isLoading,
    error: executions.error || stats.error,
  }
}
