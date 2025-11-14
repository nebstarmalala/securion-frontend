import { useState, useCallback } from "react"
import { useUploadAttachment } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttachmentUploadProps {
  entityType: "projects" | "findings" | "scopes" | "comments"
  entityId: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/zip",
]

export function AttachmentUpload({ entityType, entityId }: AttachmentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const uploadAttachment = useUploadAttachment()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      fileArray.forEach(file => validateAndAddFile(file))
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      fileArray.forEach(file => validateAndAddFile(file))
    }
  }

  const validateAndAddFile = (selectedFile: File) => {
    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: `${selectedFile.name}: File size must be less than 10MB`,
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast({
        title: "Error",
        description: `${selectedFile.name}: File type not allowed. Supported types: JPG, PNG, GIF, PDF, DOCX, TXT, ZIP`,
        variant: "destructive",
      })
      return
    }

    // Check for duplicates
    if (files.some(f => f.name === selectedFile.name && f.size === selectedFile.size)) {
      toast({
        title: "Error",
        description: `${selectedFile.name} is already added`,
        variant: "destructive",
      })
      return
    }

    setFiles(prev => [...prev, selectedFile])
  }

  const handleUploadAll = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    let successCount = 0
    let failCount = 0

    try {
      for (const file of files) {
        try {
          await uploadAttachment.mutateAsync({
            entityType,
            entityId,
            file,
            description: descriptions[file.name]?.trim() || undefined,
          })
          successCount++
        } catch (error: any) {
          failCount++
          toast({
            title: "Upload Failed",
            description: `${file.name}: ${error.message || "Failed to upload"}`,
            variant: "destructive",
          })
        }
      }

      if (successCount > 0) {
        toast({
          title: "Success",
          description: `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        })
      }

      // Reset form
      setFiles([])
      setDescriptions({})
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName))
    setDescriptions(prev => {
      const newDesc = { ...prev }
      delete newDesc[fileName]
      return newDesc
    })
  }

  const handleDescriptionChange = (fileName: string, description: string) => {
    setDescriptions(prev => ({
      ...prev,
      [fileName]: description
    }))
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary hover:bg-muted/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-muted-foreground">
          Maximum file size: 10MB per file
        </p>
        <p className="text-xs text-muted-foreground">
          Supported: JPG, PNG, GIF, PDF, DOCX, TXT, ZIP
        </p>
        <Input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.txt,.zip"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Selected Files ({files.length})
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFiles([])
                setDescriptions({})
              }}
              disabled={uploading}
            >
              Clear all
            </Button>
          </div>

          {files.map((file) => (
            <div key={file.name} className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFile(file.name)}
                  disabled={uploading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Add a description (optional)..."
                value={descriptions[file.name] || ""}
                onChange={(e) => handleDescriptionChange(file.name, e.target.value)}
                rows={2}
                className="text-sm"
                disabled={uploading}
              />
            </div>
          ))}

          <Button
            onClick={handleUploadAll}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading {files.length} file{files.length > 1 ? 's' : ''}...
              </>
            ) : (
              `Upload ${files.length} file${files.length > 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
