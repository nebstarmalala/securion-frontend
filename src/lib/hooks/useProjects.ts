/**
 * Projects React Query Hooks
 *
 * Provides hooks for project management operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { projectsService } from "../api/projects"
import type {
  ApiProject,
  CreateProjectInput,
  UpdateProjectInput,
  AssignUsersInput,
  ListQueryParams,
} from "../types"
import { handleError } from "../errors"

// ============================================================================
// Query Keys Factory
// ============================================================================

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters?: ListQueryParams) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  activities: (id: string) => [...projectKeys.all, id, "activities"] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch paginated list of projects
 */
export function useProjects(filters?: ListQueryParams) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectsService.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId!),
    queryFn: () => projectsService.getProject(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch project activities
 */
export function useProjectActivities(projectId: string | undefined, params?: ListQueryParams) {
  return useQuery({
    queryKey: projectKeys.activities(projectId!),
    queryFn: () => projectsService.getProjectActivities(projectId!, params),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch active projects
 */
export function useActiveProjects() {
  return useQuery({
    queryKey: [...projectKeys.all, "active"] as const,
    queryFn: () => projectsService.getActiveProjects(),
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsService.createProject(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success("Project created successfully", {
        description: `Created project: ${newProject.name}`,
      })
    },
    onError: (error) => {
      handleError(error, "Failed to create project")
    },
  })
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      projectsService.updateProject(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) })
      const previousProject = queryClient.getQueryData<ApiProject>(projectKeys.detail(id))

      if (previousProject) {
        queryClient.setQueryData<ApiProject>(projectKeys.detail(id), {
          ...previousProject,
          ...data,
        })
      }

      return { previousProject }
    },
    onSuccess: (updatedProject, { id }) => {
      queryClient.setQueryData(projectKeys.detail(id), updatedProject)
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success("Project updated successfully")
    },
    onError: (error, { id }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject)
      }
      handleError(error, "Failed to update project")
    },
  })
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => projectsService.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) })
      toast.success("Project deleted successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to delete project")
    },
  })
}

/**
 * Hook to assign users to a project
 */
export function useAssignUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: AssignUsersInput }) =>
      projectsService.assignUsers(projectId, data),
    onSuccess: (updatedProject, { projectId }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject)
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success("Users assigned successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to assign users")
    },
  })
}

/**
 * Hook to assign project lead
 */
export function useAssignLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectsService.assignLead(projectId, userId),
    onSuccess: (updatedProject, { projectId }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject)
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success("Project lead assigned successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to assign project lead")
    },
  })
}

/**
 * Hook to update member role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      role,
    }: {
      projectId: string
      userId: string
      role: "lead" | "member" | "viewer"
    }) => projectsService.updateMemberRole(projectId, userId, role),
    onSuccess: (updatedProject, { projectId }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject)
      toast.success("Member role updated successfully")
    },
    onError: (error) => {
      handleError(error, "Failed to update member role")
    },
  })
}

/**
 * Hook to remove user from project
 */
export function useRemoveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectsService.removeUser(projectId, userId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      toast.success("User removed from project")
    },
    onError: (error) => {
      handleError(error, "Failed to remove user")
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to prefetch a project
 */
export function usePrefetchProject() {
  const queryClient = useQueryClient()

  return (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: projectKeys.detail(projectId),
      queryFn: () => projectsService.getProject(projectId),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Combined hook for project management
 */
export function useProjectManagement(filters?: ListQueryParams) {
  const projects = useProjects(filters)
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const prefetchProject = usePrefetchProject()

  return {
    // Query
    projects,
    isLoading: projects.isLoading,
    error: projects.error,

    // Mutations
    createProject,
    updateProject,
    deleteProject,

    // Utilities
    prefetchProject,

    // Mutation states
    isCreating: createProject.isPending,
    isUpdating: updateProject.isPending,
    isDeleting: deleteProject.isPending,
  }
}
