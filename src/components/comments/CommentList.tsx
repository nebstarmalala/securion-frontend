import { CommentItem } from "./CommentItem"
import type { Comment } from "@/lib/types/api"

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  // Filter to only show top-level comments (those without parent_id)
  const topLevelComments = comments.filter((comment) => !comment.parent_id)

  return (
    <div className="space-y-4">
      {topLevelComments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
