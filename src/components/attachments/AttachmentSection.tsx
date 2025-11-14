import { useAttachments } from "@/hooks"
import { AttachmentList } from "./AttachmentList"
import { AttachmentUpload } from "./AttachmentUpload"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface AttachmentSectionProps {
  entityType: "projects" | "findings" | "scopes" | "comments"
  entityId: string
}

export function AttachmentSection({ entityType, entityId }: AttachmentSectionProps) {
  const { data: attachments, isLoading } = useAttachments(entityType, entityId)

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
          Attachments
          {attachments && attachments.meta && (
            <span className="text-sm text-muted-foreground ml-2">
              ({attachments.meta.total})
            </span>
          )}
        </h3>

        <AttachmentUpload entityType={entityType} entityId={entityId} />
      </div>

      {attachments && attachments.data.length > 0 && (
        <>
          <Separator />
          <AttachmentList attachments={attachments.data} />
        </>
      )}
    </div>
  )
}
