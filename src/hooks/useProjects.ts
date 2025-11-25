import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { projectsService } from "@/lib/api"
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryParams,
} from "@/lib/types/api"

export function useProjects(params?: ProjectQueryParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectsService.list(params),
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id!),
    queryFn: () => projectsService.get(id!),
    enabled: !!id,
  })
}

export function useProjectActivities(id: string | undefined, params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: queryKeys.projects.activities(id!),
    queryFn: () => projectsService.getActivities(id!, params),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    },
  })
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<UpdateProjectInput>) => projectsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    },
  })
}

export function useAssignUsers(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userIds: string[]) => projectsService.assignUsers(id, { user_ids: userIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
    },
  })
}

export function useAssignLead(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => projectsService.assignLead(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
    },
  })
}

export function useUpdateMemberRole(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      projectsService.updateMemberRole(id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
    },
  })
}

export function useRemoveUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => projectsService.removeUser(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    },
  })
}