/**
 * SaveReportTemplateDialog Component
 *
 * Dialog for saving report settings as a reusable template.
 */

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCreateSavedReportTemplate,
  useUpdateSavedReportTemplate,
} from "@/lib/hooks/useReports"
import type { SavedReportTemplate, CreateSavedReportTemplateInput } from "@/lib/types"

interface SaveReportTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: SavedReportTemplate | null
  defaultOptions?: Record<string, any>
  onSuccess?: () => void
}

export function SaveReportTemplateDialog({
  open,
  onOpenChange,
  template,
  defaultOptions,
  onSuccess,
}: SaveReportTemplateDialogProps) {
  const [formData, setFormData] = useState<CreateSavedReportTemplateInput>({
    name: "",
    description: "",
    report_type: "technical",
    format: "pdf",
    is_public: false,
    options: {},
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createTemplate = useCreateSavedReportTemplate()
  const updateTemplate = useUpdateSavedReportTemplate()

  const isEditing = !!template

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (template) {
        setFormData({
          name: template.name,
          description: template.description || "",
          report_type: template.report_type,
          format: template.format,
          is_public: template.is_public,
          options: template.options,
        })
      } else {
        setFormData({
          name: "",
          description: "",
          report_type: "technical",
          format: "pdf",
          is_public: false,
          options: defaultOptions || {},
        })
      }
      setErrors({})
    }
  }, [open, template, defaultOptions])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      if (isEditing && template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          data: formData,
        })
      } else {
        await createTemplate.mutateAsync(formData)
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Error handled by mutation
    }
  }

  const isPending = createTemplate.isPending || updateTemplate.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Report Template" : "Save as Template"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this report template settings."
              : "Save your report settings as a reusable template."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Standard Web App Report"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe when to use this template..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report_type">Report Type</Label>
              <Select
                value={formData.report_type}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, report_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Default Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">Public Template</Label>
              <p className="text-sm text-muted-foreground">
                Allow other team members to use this template
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_public: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : isEditing ? (
              "Update Template"
            ) : (
              "Save Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
