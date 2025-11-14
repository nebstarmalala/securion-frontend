import { useState } from "react"
import { useCreateComment, useReplyToComment, useUpdateComment } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface CommentFormProps {
  entityType: "Finding" | "Scope" | "Project"
  entityId: string
  parentId?: string
  initialContent?: string
  commentId?: string
  onCancel?: () => void
  onSuccess?: () => void
  placeholder?: string
}

export function CommentForm({
  entityType,
  entityId,
  parentId,
  initialContent = "",
  commentId,
  onCancel,
  onSuccess,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent)
  const { toast } = useToast()

  const createComment = useCreateComment()
  const replyToComment = useReplyToComment()
  const updateComment = useUpdateComment()

  const isEditing = !!commentId
  const isReplying = !!parentId

  const mutation = isEditing
    ? updateComment
    : isReplying
    ? replyToComment
    : createComment

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      if (isEditing) {
        await updateComment.mutateAsync({
          commentId: commentId!,
          content: content.trim(),
        })
        toast({
          title: "Success",
          description: "Comment updated successfully",
        })
      } else if (isReplying) {
        await replyToComment.mutateAsync({
          commentId: parentId!,
          data: {
            content: content.trim(),
            mentions: extractMentions(content),
          },
        })
        toast({
          title: "Success",
          description: "Reply added successfully",
        })
      } else {
        await createComment.mutateAsync({
          commentable_type: entityType,
          commentable_id: entityId,
          content: content.trim(),
          mentions: extractMentions(content),
        })
        toast({
          title: "Success",
          description: "Comment created successfully",
        })
      }

      setContent("")
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save comment",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="resize-none"
      />

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={mutation.isPending || !content.trim()}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update" : isReplying ? "Reply" : "Comment"}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">
          Tip: Use @username to mention users
        </span>
      </div>
    </form>
  )
}

function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }

  return mentions
}
