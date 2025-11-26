import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attachmentsService } from "@/lib/api"
import type { Attachment, PaginatedData, UpdateAttachmentInput } from "@/lib/types/api"

export function useAttachments(
  entityType: string | undefined,
  entityId: string | undefined,
  params?: { page?: number; per_page?: number }
) {
  return useQuery<PaginatedData<Attachment>>({
    queryKey: ["attachments", entityType, entityId, params],
    queryFn: () => attachmentsService.list(entityType!, entityId!, params),
    enabled: !!entityType && !!entityId,
  })
}

export function useAttachment(attachmentId: string | undefined) {
  return useQuery<Attachment>({
    queryKey: ["attachments", attachmentId],
    queryFn: () => attachmentsService.get(attachmentId!),
    enabled: !!attachmentId,
  })
}

export function useUploadAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      file,
      description,
    }: {
      entityType: string
      entityId: string
      file: File
      description?: string
    }) => attachmentsService.upload(entityType, entityId, file, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", variables.entityType, variables.entityId],
      })
      // Update attachment count on entity
      if (variables.entityType === "findings") {
        queryClient.invalidateQueries({ queryKey: ["findings", variables.entityId] })
      } else if (variables.entityType === "scopes") {
        queryClient.invalidateQueries({ queryKey: ["scopes", variables.entityId] })
      } else if (variables.entityType === "projects") {
        queryClient.invalidateQueries({ queryKey: ["projects", variables.entityId] })
      }
    },
  })
}

export function useUpdateAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attachmentId, data }: { attachmentId: string; data: UpdateAttachmentInput }) =>
      attachmentsService.update(attachmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] })
    },
  })
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: string) => attachmentsService.delete(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] })
    },
  })
}
