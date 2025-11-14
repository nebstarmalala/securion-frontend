import { useState } from "react"
import { useDeleteComment } from "@/hooks"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CommentForm } from "./CommentForm"
import { MoreVertical, Reply, Edit, Trash2, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Comment } from "@/lib/types/api"

interface CommentItemProps {
  comment: Comment
  depth?: number
}

export function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const { toast } = useToast()

  const deleteComment = useDeleteComment()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      await deleteComment.mutateAsync(comment.id)
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const maxDepth = 3 // Maximum nesting level

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 pl-4 border-l-2")}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getInitials(comment.user.username)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{comment.user.username}</span>
              <span className="text-xs text-muted-foreground">
                {comment.human_time}
              </span>
              {comment.is_edited && (
                <Badge variant="outline" className="text-xs">
                  Edited
                </Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsReplying(!isReplying)}>
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditing ? (
            <CommentForm
              entityType={comment.commentable_type.split("\\").pop() as any}
              entityId={comment.commentable_id}
              commentId={comment.id}
              initialContent={comment.content}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
              placeholder="Edit your comment..."
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap break-words">
              {renderContentWithMentions(comment.content, comment.mentioned_users)}
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isReplying && depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(true)}
                className="h-7 text-xs"
              >
                <Reply className="mr-1 h-3 w-3" />
                Reply
              </Button>
            )}

            {comment.replies_count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-7 text-xs"
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                {comment.replies_count} {comment.replies_count === 1 ? "reply" : "replies"}
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="pt-2">
              <CommentForm
                entityType={comment.commentable_type.split("\\").pop() as any}
                entityId={comment.commentable_id}
                parentId={comment.id}
                onCancel={() => setIsReplying(false)}
                onSuccess={() => setIsReplying(false)}
                placeholder="Write a reply..."
              />
            </div>
          )}
        </div>
      </div>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function renderContentWithMentions(content: string, mentionedUsers: any[]) {
  if (!mentionedUsers || mentionedUsers.length === 0) {
    return content
  }

  const parts = content.split(/(@\w+)/g)

  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      const username = part.slice(1)
      const user = mentionedUsers.find((u) => u.username === username)

      if (user) {
        return (
          <span
            key={index}
            className="text-primary font-medium hover:underline cursor-pointer"
          >
            {part}
          </span>
        )
      }
    }

    return <span key={index}>{part}</span>
  })
}
