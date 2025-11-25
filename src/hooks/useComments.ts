import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { commentsService } from "@/lib/api"
import type { Comment, PaginatedData, CreateCommentInput, ReplyCommentInput } from "@/lib/types/api"

export function useComments(
  type: string | undefined,
  id: string | undefined,
  params?: { page?: number; per_page?: number }
) {
  return useQuery<PaginatedData<Comment>>({
    queryKey: ["comments", type, id, params],
    queryFn: () => commentsService.list(type!, id!, params),
    enabled: !!type && !!id,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentInput) => commentsService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.commentable_type, variables.commentable_id],
      })
      // Also invalidate the entity to update comment count
      if (variables.commentable_type === "Finding") {
        queryClient.invalidateQueries({ queryKey: ["findings", variables.commentable_id] })
      } else if (variables.commentable_type === "Scope") {
        queryClient.invalidateQueries({ queryKey: ["scopes", variables.commentable_id] })
      } else if (variables.commentable_type === "Project") {
        queryClient.invalidateQueries({ queryKey: ["projects", variables.commentable_id] })
      }
    },
  })
}

export function useReplyToComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: ReplyCommentInput }) =>
      commentsService.reply(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] })
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentsService.update(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => commentsService.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] })
    },
  })
}
