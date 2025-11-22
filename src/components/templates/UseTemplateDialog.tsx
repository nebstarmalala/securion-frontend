/**
 * UseTemplateDialog Component
 *
 * Dialog for using a template to create a new entity.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProjects } from "@/lib/hooks/useProjects"
import { useScopes } from "@/lib/hooks/useScopes"
import {
  useUseProjectTemplate,
  useUseFindingTemplate,
  useUseScopeTemplate,
} from "@/lib/hooks/useTemplates"
import type { ProjectTemplate, FindingTemplate, ScopeTemplate } from "@/lib/types"

type TemplateType = "project" | "finding" | "scope"
type Template = ProjectTemplate | FindingTemplate | ScopeTemplate

interface UseTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  type: TemplateType
  projectId?: string
  onSuccess?: () => void
}

export function UseTemplateDialog({
  open,
  onOpenChange,
  template,
  type,
  projectId: initialProjectId,
  onSuccess,
}: UseTemplateDialogProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: projects } = useProjects()
  const { data: scopes } = useScopes(
    formData.project_id ? { project_id: formData.project_id } : undefined
  )

  const useProjectTemplate = useUseProjectTemplate()
  const useFindingTemplate = useUseFindingTemplate()
  const useScopeTemplate = useUseScopeTemplate()

  // Initialize form based on type
  useEffect(() => {
    if (open && template) {
      if (type === "project") {
        setFormData({
          name: `${(template as ProjectTemplate).name} - Copy`,
          description: (template as ProjectTemplate).description || "",
          client_name: "",
          start_date: "",
          end_date: "",
        })
      } else if (type === "finding") {
        setFormData({
          project_id: initialProjectId || "",
          scope_id: "",
          overrides: {
            title: (template as FindingTemplate).title,
          },
        })
      } else if (type === "scope") {
        setFormData({
          project_id: initialProjectId || "",
          name: (template as ScopeTemplate).name,
        })
      }
      setErrors({})
    }
  }, [open, template, type, initialProjectId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (type === "project") {
      if (!formData.name?.trim()) {
        newErrors.name = "Name is required"
      }
    } else {
      if (!formData.project_id) {
        newErrors.project_id = "Project is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !template) return

    try {
      if (type === "project") {
        await useProjectTemplate.mutateAsync({
          templateId: template.id,
          data: formData,
        })
      } else if (type === "finding") {
        await useFindingTemplate.mutateAsync({
          templateId: template.id,
          data: formData,
        })
      } else if (type === "scope") {
        await useScopeTemplate.mutateAsync({
          templateId: template.id,
          data: formData,
        })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Error handled by mutation
    }
  }

  const isPending =
    useProjectTemplate.isPending ||
    useFindingTemplate.isPending ||
    useScopeTemplate.isPending

  const getTitle = () => {
    const typeName = type.charAt(0).toUpperCase() + type.slice(1)
    return `Create ${typeName} from Template`
  }

  const getTemplateName = () => {
    if (!template) return ""
    if ("title" in template) return template.title
    return template.name
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Create a new {type} using the "{getTemplateName()}" template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Template Fields */}
          {type === "project" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter project name"
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
                    setFormData((prev: any) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Project description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_name || ""}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      client_name: e.target.value,
                    }))
                  }
                  placeholder="Enter client name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Finding Template Fields */}
          {type === "finding" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <Select
                  value={formData.project_id || ""}
                  onValueChange={(value) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      project_id: value,
                      scope_id: "", // Reset scope when project changes
                    }))
                  }
                  disabled={!!initialProjectId}
                >
                  <SelectTrigger className={errors.project_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.data.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_id && (
                  <p className="text-sm text-destructive">{errors.project_id}</p>
                )}
              </div>

              {formData.project_id && (
                <div className="space-y-2">
                  <Label htmlFor="scope_id">Scope (Optional)</Label>
                  <Select
                    value={formData.scope_id || ""}
                    onValueChange={(value) =>
                      setFormData((prev: any) => ({ ...prev, scope_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a scope (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopes?.data.map((scope) => (
                        <SelectItem key={scope.id} value={scope.id}>
                          {scope.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Finding Title</Label>
                <Input
                  id="title"
                  value={formData.overrides?.title || ""}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      overrides: {
                        ...prev.overrides,
                        title: e.target.value,
                      },
                    }))
                  }
                  placeholder="Override the template title"
                />
              </div>
            </>
          )}

          {/* Scope Template Fields */}
          {type === "scope" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <Select
                  value={formData.project_id || ""}
                  onValueChange={(value) =>
                    setFormData((prev: any) => ({ ...prev, project_id: value }))
                  }
                  disabled={!!initialProjectId}
                >
                  <SelectTrigger className={errors.project_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.data.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_id && (
                  <p className="text-sm text-destructive">{errors.project_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Scope Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Override the template name"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
