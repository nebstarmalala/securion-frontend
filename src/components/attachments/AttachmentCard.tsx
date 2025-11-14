import { useState } from "react"
import { useDeleteAttachment } from "@/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, MoreVertical, Trash2, FileText, FileImage, FileArchive, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Attachment } from "@/lib/types/api"
import { attachmentsService } from "@/lib/api"

interface AttachmentCardProps {
  attachment: Attachment
}

export function AttachmentCard({ attachment }: AttachmentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const deleteAttachment = useDeleteAttachment()

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const blob = await attachmentsService.download(attachment.id)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = attachment.original_filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "File downloaded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download file",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return
    }

    try {
      await deleteAttachment.mutateAsync(attachment.id)
      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete attachment",
        variant: "destructive",
      })
    }
  }

  const Icon = getFileIcon(attachment)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-muted rounded-md">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate" title={attachment.original_filename}>
                  {attachment.original_filename}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {attachment.file_size_human}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
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

            {attachment.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {attachment.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {attachment.virus_scan_status === "clean" && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="mr-1 h-3 w-3 text-green-500" />
                  Scanned
                </Badge>
              )}

              <span className="text-xs text-muted-foreground">
                {attachment.download_count} downloads
              </span>

              <span className="text-xs text-muted-foreground">
                • {attachment.uploaded_at_human}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getFileIcon(attachment: Attachment) {
  if (attachment.is_image) {
    return FileImage
  }

  const extension = attachment.file_extension.toLowerCase()
  if (extension === "zip" || extension === "rar" || extension === "7z") {
    return FileArchive
  }

  return FileText
}
