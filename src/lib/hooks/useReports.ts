/**
 * Reports React Query Hooks
 *
 * Provides hooks for report generation, management, and exports.
 * Includes polling for report status and saved template management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  reportsService,
  type ReportFilters,
  type SavedReportTemplateFilters,
  type UpdateSavedReportTemplateInput,
  type ExportFilters,
} from "../api/reports"
import type { GenerateReportInput, CreateSavedReportTemplateInput } from "../types"
import { handleError } from "../errors"

// ============================================================================
// Query Keys Factory
// ============================================================================

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters?: ReportFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  status: (id: string) => [...reportKeys.all, "status", id] as const,
  types: () => [...reportKeys.all, "types"] as const,
  byProject: (projectId: string) => [...reportKeys.all, "project", projectId] as const,

  // Saved report templates
  templates: {
    all: ["report-templates"] as const,
    lists: () => [...reportKeys.templates.all, "list"] as const,
    list: (filters?: SavedReportTemplateFilters) =>
      [...reportKeys.templates.lists(), filters] as const,
    details: () => [...reportKeys.templates.all, "detail"] as const,
    detail: (id: string) => [...reportKeys.templates.details(), id] as const,
  },
}

// ============================================================================
// Report Queries
// ============================================================================

/**
 * Hook to fetch paginated list of reports
 */
export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => reportsService.getReports(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch a single report by ID
 */
export function useReport(reportId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.detail(reportId!),
    queryFn: () => reportsService.getReport(reportId!),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch available report types
 */
export function useReportTypes() {
  return useQuery({
    queryKey: reportKeys.types(),
    queryFn: () => reportsService.getReportTypes(),
    staleTime: 60 * 60 * 1000, // 1 hour (static data)
  })
}

/**
 * Hook to poll report generation status
 * Automatically stops polling when status is completed or failed
 */
export function useReportStatus(reportId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: reportKeys.status(reportId!),
    queryFn: () => reportsService.getReportStatus(reportId!),
    enabled: !!reportId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      // Stop polling when completed or failed
      if (status === "completed" || status === "failed") {
        return false
      }
      return 2000 // Poll every 2 seconds
    },
    staleTime: 0, // Always fresh for status
  })
}

/**
 * Hook to fetch reports by project
 */
export function useProjectReports(projectId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.byProject(projectId!),
    queryFn: () => reportsService.getReports({ project_id: projectId }),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================================================
// Report Mutations
// ============================================================================

/**
 * Hook to generate a new report
 */
export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateReportInput) => reportsService.generateReport(data),
    onSuccess: (newReport) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      if (newReport.project_id) {
        queryClient.invalidateQueries({
          queryKey: reportKeys.byProject(newReport.project_id),
        })
      }

      toast.success("Report generation started", {
        description: `Your ${newReport.type} report is being generated.`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to generate report")
    },
  })
}

/**
 * Hook to delete a report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reportId: string) => reportsService.deleteReport(reportId),
    onSuccess: (_, reportId) => {
      // Invalidate all report lists
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      // Remove from cache
      queryClient.removeQueries({ queryKey: reportKeys.detail(reportId) })

      toast.success("Report deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete report")
    },
  })
}

/**
 * Hook to download a report
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: ({ reportId, filename }: { reportId: string; filename?: string }) =>
      reportsService.downloadReport(reportId, filename),
    onSuccess: () => {
      toast.success("Report download started")
    },
    onError: (error) => {
      handleError(error, "Failed to download report")
    },
  })
}

// ============================================================================
// Saved Report Template Queries
// ============================================================================

/**
 * Hook to fetch saved report templates
 */
export function useSavedReportTemplates(filters?: SavedReportTemplateFilters) {
  return useQuery({
    queryKey: reportKeys.templates.list(filters),
    queryFn: () => reportsService.getSavedReportTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single saved report template
 */
export function useSavedReportTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.templates.detail(templateId!),
    queryFn: () => reportsService.getSavedReportTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch public saved report templates
 */
export function usePublicReportTemplates(filters?: Omit<SavedReportTemplateFilters, "is_public">) {
  return useSavedReportTemplates({ ...filters, is_public: true })
}

/**
 * Hook to fetch user's own report templates
 */
export function useMyReportTemplates(filters?: Omit<SavedReportTemplateFilters, "is_public">) {
  return useSavedReportTemplates({ ...filters, is_public: false })
}

// ============================================================================
// Saved Report Template Mutations
// ============================================================================

/**
 * Hook to create a new saved report template
 */
export function useCreateSavedReportTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSavedReportTemplateInput) =>
      reportsService.createSavedReportTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() })
      toast.success("Report template saved successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to save report template")
    },
  })
}

/**
 * Hook to update a saved report template
 */
export function useUpdateSavedReportTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedReportTemplateInput }) =>
      reportsService.updateSavedReportTemplate(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      queryClient.setQueryData(reportKeys.templates.detail(id), updatedTemplate)
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() })
      toast.success("Report template updated successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to update report template")
    },
  })
}

/**
 * Hook to delete a saved report template
 */
export function useDeleteSavedReportTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => reportsService.deleteSavedReportTemplate(templateId),
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() })
      queryClient.removeQueries({ queryKey: reportKeys.templates.detail(templateId) })
      toast.success("Report template deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete report template")
    },
  })
}

/**
 * Hook to generate a report from a saved template
 */
export function useGenerateFromTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      templateId,
      projectId,
      overrides,
    }: {
      templateId: string
      projectId: string
      overrides?: Partial<GenerateReportInput>
    }) => reportsService.generateFromTemplate(templateId, projectId, overrides),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      if (newReport.project_id) {
        queryClient.invalidateQueries({
          queryKey: reportKeys.byProject(newReport.project_id),
        })
      }
      toast.success("Report generation started from template")
    },
    onError: (error) => {
      handleError(error, "Failed to generate report from template")
    },
  })
}

// ============================================================================
// Export Mutations
// ============================================================================

/**
 * Hook to export projects data
 */
export function useExportProjects() {
  return useMutation({
    mutationFn: ({ filters, filename }: { filters?: ExportFilters; filename?: string }) =>
      reportsService.exportProjects(filters, filename),
    onSuccess: () => {
      toast.success("Projects export started")
    },
    onError: (error) => {
      handleError(error, "Failed to export projects")
    },
  })
}

/**
 * Hook to export findings data
 */
export function useExportFindings() {
  return useMutation({
    mutationFn: ({ filters, filename }: { filters?: ExportFilters; filename?: string }) =>
      reportsService.exportFindings(filters, filename),
    onSuccess: () => {
      toast.success("Findings export started")
    },
    onError: (error) => {
      handleError(error, "Failed to export findings")
    },
  })
}

/**
 * Hook to export scopes data
 */
export function useExportScopes() {
  return useMutation({
    mutationFn: ({ filters, filename }: { filters?: ExportFilters; filename?: string }) =>
      reportsService.exportScopes(filters, filename),
    onSuccess: () => {
      toast.success("Scopes export started")
    },
    onError: (error) => {
      handleError(error, "Failed to export scopes")
    },
  })
}

/**
 * Hook to export CVEs data
 */
export function useExportCVEs() {
  return useMutation({
    mutationFn: ({ filters, filename }: { filters?: ExportFilters; filename?: string }) =>
      reportsService.exportCVEs(filters, filename),
    onSuccess: () => {
      toast.success("CVEs export started")
    },
    onError: (error) => {
      handleError(error, "Failed to export CVEs")
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to prefetch a report
 */
export function usePrefetchReport() {
  const queryClient = useQueryClient()

  return (reportId: string) => {
    queryClient.prefetchQuery({
      queryKey: reportKeys.detail(reportId),
      queryFn: () => reportsService.getReport(reportId),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Hook to prefetch a saved report template
 */
export function usePrefetchSavedReportTemplate() {
  const queryClient = useQueryClient()

  return (templateId: string) => {
    queryClient.prefetchQuery({
      queryKey: reportKeys.templates.detail(templateId),
      queryFn: () => reportsService.getSavedReportTemplate(templateId),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Combined hook for report management
 * Provides all report-related queries and mutations in one hook
 */
export function useReportManagement(filters?: ReportFilters) {
  const reports = useReports(filters)
  const reportTypes = useReportTypes()
  const generateReport = useGenerateReport()
  const deleteReport = useDeleteReport()
  const downloadReport = useDownloadReport()
  const prefetchReport = usePrefetchReport()

  return {
    // Queries
    reports,
    reportTypes,
    isLoading: reports.isLoading || reportTypes.isLoading,
    error: reports.error || reportTypes.error,

    // Mutations
    generateReport,
    deleteReport,
    downloadReport,

    // Utilities
    prefetchReport,

    // Mutation states
    isGenerating: generateReport.isPending,
    isDeleting: deleteReport.isPending,
    isDownloading: downloadReport.isPending,
  }
}

/**
 * Combined hook for saved report template management
 */
export function useSavedReportTemplateManagement(filters?: SavedReportTemplateFilters) {
  const templates = useSavedReportTemplates(filters)
  const createTemplate = useCreateSavedReportTemplate()
  const updateTemplate = useUpdateSavedReportTemplate()
  const deleteTemplate = useDeleteSavedReportTemplate()
  const generateFromTemplate = useGenerateFromTemplate()
  const prefetchTemplate = usePrefetchSavedReportTemplate()

  return {
    // Query
    templates,
    isLoading: templates.isLoading,
    error: templates.error,

    // Mutations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generateFromTemplate,

    // Utilities
    prefetchTemplate,

    // Mutation states
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
    isGenerating: generateFromTemplate.isPending,
  }
}
