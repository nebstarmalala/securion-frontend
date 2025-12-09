/**
 * Templates React Query Hooks
 *
 * Provides hooks for managing project, finding, and scope templates.
 * Includes CRUD operations and template usage functionality.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  templatesService,
  type ProjectTemplateFilters,
  type FindingTemplateFilters,
  type ScopeTemplateFilters,
  type CreateProjectTemplateInput,
  type CreateFindingTemplateInput,
  type CreateScopeTemplateInput,
  type UpdateProjectTemplateInput,
  type UpdateFindingTemplateInput,
  type UpdateScopeTemplateInput,
  type UseProjectTemplateInput,
  type UseFindingTemplateInput,
  type UseScopeTemplateInput,
} from "../api/templates"
import { handleError } from "../errors"

// ============================================================================
// Query Keys Factory
// ============================================================================

export const templateKeys = {
  // Project templates
  projects: {
    all: ["project-templates"] as const,
    lists: () => [...templateKeys.projects.all, "list"] as const,
    list: (filters?: ProjectTemplateFilters) =>
      [...templateKeys.projects.lists(), filters] as const,
    details: () => [...templateKeys.projects.all, "detail"] as const,
    detail: (id: string) => [...templateKeys.projects.details(), id] as const,
    public: () => [...templateKeys.projects.all, "public"] as const,
  },

  // Finding templates
  findings: {
    all: ["finding-templates"] as const,
    lists: () => [...templateKeys.findings.all, "list"] as const,
    list: (filters?: FindingTemplateFilters) =>
      [...templateKeys.findings.lists(), filters] as const,
    details: () => [...templateKeys.findings.all, "detail"] as const,
    detail: (id: string) => [...templateKeys.findings.details(), id] as const,
    public: () => [...templateKeys.findings.all, "public"] as const,
    bySeverity: (severity: string) => [...templateKeys.findings.all, "severity", severity] as const,
  },

  // Scope templates
  scopes: {
    all: ["scope-templates"] as const,
    lists: () => [...templateKeys.scopes.all, "list"] as const,
    list: (filters?: ScopeTemplateFilters) => [...templateKeys.scopes.lists(), filters] as const,
    details: () => [...templateKeys.scopes.all, "detail"] as const,
    detail: (id: string) => [...templateKeys.scopes.details(), id] as const,
    public: () => [...templateKeys.scopes.all, "public"] as const,
    byType: (type: string) => [...templateKeys.scopes.all, "type", type] as const,
  },
}

// ============================================================================
// Project Template Queries
// ============================================================================

/**
 * Hook to fetch paginated list of project templates
 */
export function useProjectTemplates(filters?: ProjectTemplateFilters) {
  return useQuery({
    queryKey: templateKeys.projects.list(filters),
    queryFn: () => templatesService.getProjectTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single project template by ID
 */
export function useProjectTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: templateKeys.projects.detail(templateId!),
    queryFn: () => templatesService.getProjectTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch public project templates
 */
export function usePublicProjectTemplates(filters?: Omit<ProjectTemplateFilters, "is_public">) {
  return useProjectTemplates({ ...filters, is_public: true })
}

// ============================================================================
// Project Template Mutations
// ============================================================================

/**
 * Hook to create a new project template
 */
export function useCreateProjectTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectTemplateInput) =>
      templatesService.createProjectTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.projects.lists() })
      toast.success("Project template created successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to create project template")
    },
  })
}

/**
 * Hook to update a project template
 */
export function useUpdateProjectTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectTemplateInput }) =>
      templatesService.updateProjectTemplate(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      queryClient.setQueryData(templateKeys.projects.detail(id), updatedTemplate)
      queryClient.invalidateQueries({ queryKey: templateKeys.projects.lists() })
      toast.success("Project template updated successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to update project template")
    },
  })
}

/**
 * Hook to delete a project template
 */
export function useDeleteProjectTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => templatesService.deleteProjectTemplate(templateId),
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.projects.lists() })
      queryClient.removeQueries({ queryKey: templateKeys.projects.detail(templateId) })
      toast.success("Project template deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete project template")
    },
  })
}

/**
 * Hook to use a project template (create project from template)
 */
export function useUseProjectTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UseProjectTemplateInput }) =>
      templatesService.useProjectTemplate(templateId, data),
    onSuccess: (newProject) => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      // Update template use count
      queryClient.invalidateQueries({ queryKey: templateKeys.projects.lists() })

      toast.success("Project created from template", {
        description: `Created project: ${newProject.name}`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create project from template")
    },
  })
}

// ============================================================================
// Finding Template Queries
// ============================================================================

/**
 * Hook to fetch paginated list of finding templates
 */
export function useFindingTemplates(filters?: FindingTemplateFilters) {
  return useQuery({
    queryKey: templateKeys.findings.list(filters),
    queryFn: () => templatesService.getFindingTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single finding template by ID
 */
export function useFindingTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: templateKeys.findings.detail(templateId!),
    queryFn: () => templatesService.getFindingTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch public finding templates
 */
export function usePublicFindingTemplates(filters?: Omit<FindingTemplateFilters, "is_public">) {
  return useFindingTemplates({ ...filters, is_public: true })
}

/**
 * Hook to fetch finding templates by severity
 */
export function useFindingTemplatesBySeverity(
  severity: "info" | "low" | "medium" | "high" | "critical"
) {
  return useFindingTemplates({ severity })
}

// ============================================================================
// Finding Template Mutations
// ============================================================================

/**
 * Hook to create a new finding template
 */
export function useCreateFindingTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFindingTemplateInput) =>
      templatesService.createFindingTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.findings.lists() })
      toast.success("Finding template created successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to create finding template")
    },
  })
}

/**
 * Hook to update a finding template
 */
export function useUpdateFindingTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFindingTemplateInput }) =>
      templatesService.updateFindingTemplate(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      queryClient.setQueryData(templateKeys.findings.detail(id), updatedTemplate)
      queryClient.invalidateQueries({ queryKey: templateKeys.findings.lists() })
      toast.success("Finding template updated successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to update finding template")
    },
  })
}

/**
 * Hook to delete a finding template
 */
export function useDeleteFindingTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => templatesService.deleteFindingTemplate(templateId),
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.findings.lists() })
      queryClient.removeQueries({ queryKey: templateKeys.findings.detail(templateId) })
      toast.success("Finding template deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete finding template")
    },
  })
}

/**
 * Hook to use a finding template (create finding from template)
 */
export function useUseFindingTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UseFindingTemplateInput }) =>
      templatesService.useFindingTemplate(templateId, data),
    onSuccess: (newFinding, { data }) => {
      // Invalidate findings list
      queryClient.invalidateQueries({ queryKey: ["findings"] })
      // Invalidate project's findings if we have project_id
      if (data.project_id) {
        queryClient.invalidateQueries({
          queryKey: ["projects", data.project_id, "findings"],
        })
      }
      // Update template use count
      queryClient.invalidateQueries({ queryKey: templateKeys.findings.lists() })

      toast.success("Finding created from template", {
        description: `Created finding: ${newFinding.title}`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create finding from template")
    },
  })
}

// ============================================================================
// Scope Template Queries
// ============================================================================

/**
 * Hook to fetch paginated list of scope templates
 */
export function useScopeTemplates(filters?: ScopeTemplateFilters) {
  return useQuery({
    queryKey: templateKeys.scopes.list(filters),
    queryFn: () => templatesService.getScopeTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single scope template by ID
 */
export function useScopeTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: templateKeys.scopes.detail(templateId!),
    queryFn: () => templatesService.getScopeTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch public scope templates
 */
export function usePublicScopeTemplates(filters?: Omit<ScopeTemplateFilters, "is_public">) {
  return useScopeTemplates({ ...filters, is_public: true })
}

/**
 * Hook to fetch scope templates by type
 */
export function useScopeTemplatesByType(
  type: "domain" | "ip" | "subnet" | "service" | "application"
) {
  return useScopeTemplates({ type })
}

// ============================================================================
// Scope Template Mutations
// ============================================================================

/**
 * Hook to create a new scope template
 */
export function useCreateScopeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScopeTemplateInput) => templatesService.createScopeTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.scopes.lists() })
      toast.success("Scope template created successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to create scope template")
    },
  })
}

/**
 * Hook to update a scope template
 */
export function useUpdateScopeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScopeTemplateInput }) =>
      templatesService.updateScopeTemplate(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      queryClient.setQueryData(templateKeys.scopes.detail(id), updatedTemplate)
      queryClient.invalidateQueries({ queryKey: templateKeys.scopes.lists() })
      toast.success("Scope template updated successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to update scope template")
    },
  })
}

/**
 * Hook to delete a scope template
 */
export function useDeleteScopeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => templatesService.deleteScopeTemplate(templateId),
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.scopes.lists() })
      queryClient.removeQueries({ queryKey: templateKeys.scopes.detail(templateId) })
      toast.success("Scope template deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete scope template")
    },
  })
}

/**
 * Hook to use a scope template (create scope from template)
 */
export function useUseScopeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UseScopeTemplateInput }) =>
      templatesService.useScopeTemplate(templateId, data),
    onSuccess: (newScope, { data }) => {
      // Invalidate scopes list
      queryClient.invalidateQueries({ queryKey: ["scopes"] })
      // Invalidate project's scopes if we have project_id
      if (data.project_id) {
        queryClient.invalidateQueries({
          queryKey: ["projects", data.project_id, "scopes"],
        })
      }
      // Update template use count
      queryClient.invalidateQueries({ queryKey: templateKeys.scopes.lists() })

      toast.success("Scope created from template", {
        description: `Created scope: ${newScope.name}`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create scope from template")
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to prefetch a project template
 */
export function usePrefetchProjectTemplate() {
  const queryClient = useQueryClient()

  return (templateId: string) => {
    queryClient.prefetchQuery({
      queryKey: templateKeys.projects.detail(templateId),
      queryFn: () => templatesService.getProjectTemplate(templateId),
      staleTime: 10 * 60 * 1000,
    })
  }
}

/**
 * Hook to prefetch a finding template
 */
export function usePrefetchFindingTemplate() {
  const queryClient = useQueryClient()

  return (templateId: string) => {
    queryClient.prefetchQuery({
      queryKey: templateKeys.findings.detail(templateId),
      queryFn: () => templatesService.getFindingTemplate(templateId),
      staleTime: 10 * 60 * 1000,
    })
  }
}

/**
 * Hook to prefetch a scope template
 */
export function usePrefetchScopeTemplate() {
  const queryClient = useQueryClient()

  return (templateId: string) => {
    queryClient.prefetchQuery({
      queryKey: templateKeys.scopes.detail(templateId),
      queryFn: () => templatesService.getScopeTemplate(templateId),
      staleTime: 10 * 60 * 1000,
    })
  }
}

// ============================================================================
// Combined Management Hooks
// ============================================================================

/**
 * Combined hook for project template management
 */
export function useProjectTemplateManagement(filters?: ProjectTemplateFilters) {
  const templates = useProjectTemplates(filters)
  const createTemplate = useCreateProjectTemplate()
  const updateTemplate = useUpdateProjectTemplate()
  const deleteTemplate = useDeleteProjectTemplate()
  const useTemplate = useUseProjectTemplate()
  const prefetchTemplate = usePrefetchProjectTemplate()

  return {
    // Query
    templates,
    isLoading: templates.isLoading,
    error: templates.error,

    // Mutations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,

    // Utilities
    prefetchTemplate,

    // Mutation states
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
    isUsing: useTemplate.isPending,
  }
}

/**
 * Combined hook for finding template management
 */
export function useFindingTemplateManagement(filters?: FindingTemplateFilters) {
  const templates = useFindingTemplates(filters)
  const createTemplate = useCreateFindingTemplate()
  const updateTemplate = useUpdateFindingTemplate()
  const deleteTemplate = useDeleteFindingTemplate()
  const useTemplate = useUseFindingTemplate()
  const prefetchTemplate = usePrefetchFindingTemplate()

  return {
    // Query
    templates,
    isLoading: templates.isLoading,
    error: templates.error,

    // Mutations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,

    // Utilities
    prefetchTemplate,

    // Mutation states
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
    isUsing: useTemplate.isPending,
  }
}

/**
 * Combined hook for scope template management
 */
export function useScopeTemplateManagement(filters?: ScopeTemplateFilters) {
  const templates = useScopeTemplates(filters)
  const createTemplate = useCreateScopeTemplate()
  const updateTemplate = useUpdateScopeTemplate()
  const deleteTemplate = useDeleteScopeTemplate()
  const useTemplate = useUseScopeTemplate()
  const prefetchTemplate = usePrefetchScopeTemplate()

  return {
    // Query
    templates,
    isLoading: templates.isLoading,
    error: templates.error,

    // Mutations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,

    // Utilities
    prefetchTemplate,

    // Mutation states
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
    isUsing: useTemplate.isPending,
  }
}

/**
 * Combined hook for all template types
 * Useful for template library views
 */
export function useAllTemplates() {
  const projectTemplates = useProjectTemplates()
  const findingTemplates = useFindingTemplates()
  const scopeTemplates = useScopeTemplates()

  return {
    projectTemplates,
    findingTemplates,
    scopeTemplates,
    isLoading:
      projectTemplates.isLoading || findingTemplates.isLoading || scopeTemplates.isLoading,
    error: projectTemplates.error || findingTemplates.error || scopeTemplates.error,
  }
}
