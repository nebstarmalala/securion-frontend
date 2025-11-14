import { useComments } from "@/hooks"
import { CommentList } from "./CommentList"
import { CommentForm } from "./CommentForm"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface CommentSectionProps {
  entityType: "Finding" | "Scope" | "Project"
  entityId: string
}

export function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const { data: comments, isLoading } = useComments(entityType, entityId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Comments
          {comments && comments.meta && (
            <span className="text-sm text-muted-foreground ml-2">
              ({comments.meta.total})
            </span>
          )}
        </h3>

        <CommentForm
          entityType={entityType}
          entityId={entityId}
        />
      </div>

      {comments && comments.data.length > 0 && (
        <>
          <Separator />
          <CommentList comments={comments.data} />
        </>
      )}
    </div>
  )
}
