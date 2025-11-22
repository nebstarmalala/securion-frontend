/**
 * CreateTemplateDialog Component
 *
 * Dialog for creating or editing templates (project, finding, or scope).
 */

import { useState, useEffect } from "react"
import { Loader2, Plus, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useCreateProjectTemplate,
  useUpdateProjectTemplate,
  useCreateFindingTemplate,
  useUpdateFindingTemplate,
  useCreateScopeTemplate,
  useUpdateScopeTemplate,
} from "@/lib/hooks/useTemplates"
import type { ProjectTemplate, FindingTemplate, ScopeTemplate } from "@/lib/types"

type TemplateType = "project" | "finding" | "scope"
type Template = ProjectTemplate | FindingTemplate | ScopeTemplate

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: TemplateType
  template?: Template | null
  onSuccess?: () => void
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  type,
  template,
  onSuccess,
}: CreateTemplateDialogProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTag, setNewTag] = useState("")
  const [newReference, setNewReference] = useState("")

  // Mutations for each type
  const createProject = useCreateProjectTemplate()
  const updateProject = useUpdateProjectTemplate()
  const createFinding = useCreateFindingTemplate()
  const updateFinding = useUpdateFindingTemplate()
  const createScope = useCreateScopeTemplate()
  const updateScope = useUpdateScopeTemplate()

  const isEditing = !!template

  // Initialize form based on type
  useEffect(() => {
    if (open) {
      if (template) {
        setFormData({ ...template })
      } else {
        setFormData(getDefaultFormData(type))
      }
      setErrors({})
      setActiveTab("basic")
    }
  }, [open, template, type])

  const getDefaultFormData = (templateType: TemplateType) => {
    switch (templateType) {
      case "project":
        return {
          name: "",
          description: "",
          type: "web-app",
          settings: {},
          is_public: false,
        }
      case "finding":
        return {
          title: "",
          description: "",
          vulnerability_type: "",
          severity: "medium",
          cvss: { version: "3.1", score: 0, vector: "" },
          remediation: { summary: "", steps: [], priority: "medium" },
          references: [],
          tags: [],
          is_public: false,
        }
      case "scope":
        return {
          name: "",
          description: "",
          type: "domain",
          default_settings: {},
          is_public: false,
        }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (type === "project" || type === "scope") {
      if (!formData.name?.trim()) {
        newErrors.name = "Name is required"
      }
    }

    if (type === "finding") {
      if (!formData.title?.trim()) {
        newErrors.title = "Title is required"
      }
      if (!formData.description?.trim()) {
        newErrors.description = "Description is required"
      }
      if (!formData.vulnerability_type?.trim()) {
        newErrors.vulnerability_type = "Vulnerability type is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      if (type === "project") {
        if (isEditing && template) {
          await updateProject.mutateAsync({ id: template.id, data: formData })
        } else {
          await createProject.mutateAsync(formData)
        }
      } else if (type === "finding") {
        if (isEditing && template) {
          await updateFinding.mutateAsync({ id: template.id, data: formData })
        } else {
          await createFinding.mutateAsync(formData)
        }
      } else if (type === "scope") {
        if (isEditing && template) {
          await updateScope.mutateAsync({ id: template.id, data: formData })
        } else {
          await createScope.mutateAsync(formData)
        }
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Error handled by mutation
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev: any) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags?.filter((t: string) => t !== tag) || [],
    }))
  }

  const addReference = () => {
    if (newReference.trim() && !formData.references?.includes(newReference.trim())) {
      setFormData((prev: any) => ({
        ...prev,
        references: [...(prev.references || []), newReference.trim()],
      }))
      setNewReference("")
    }
  }

  const removeReference = (ref: string) => {
    setFormData((prev: any) => ({
      ...prev,
      references: prev.references?.filter((r: string) => r !== ref) || [],
    }))
  }

  const addRemediationStep = () => {
    setFormData((prev: any) => ({
      ...prev,
      remediation: {
        ...prev.remediation,
        steps: [...(prev.remediation?.steps || []), ""],
      },
    }))
  }

  const updateRemediationStep = (index: number, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      remediation: {
        ...prev.remediation,
        steps: prev.remediation?.steps?.map((step: string, i: number) =>
          i === index ? value : step
        ) || [],
      },
    }))
  }

  const removeRemediationStep = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      remediation: {
        ...prev.remediation,
        steps: prev.remediation?.steps?.filter((_: string, i: number) => i !== index) || [],
      },
    }))
  }

  const isPending =
    createProject.isPending ||
    updateProject.isPending ||
    createFinding.isPending ||
    updateFinding.isPending ||
    createScope.isPending ||
    updateScope.isPending

  const getTitle = () => {
    const action = isEditing ? "Edit" : "Create"
    const typeName = type.charAt(0).toUpperCase() + type.slice(1)
    return `${action} ${typeName} Template`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this template with new settings."
              : `Create a reusable ${type} template for your team.`}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            {type === "finding" && <TabsTrigger value="details">Details</TabsTrigger>}
            {type !== "finding" && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 px-1">
              {/* Name/Title */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {type === "finding" ? "Title" : "Name"} *
                </Label>
                <Input
                  id="name"
                  value={type === "finding" ? formData.title || "" : formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      [type === "finding" ? "title" : "name"]: e.target.value,
                    }))
                  }
                  placeholder={
                    type === "finding"
                      ? "e.g., SQL Injection in Login Form"
                      : `e.g., Standard ${type} template`
                  }
                  className={
                    errors.name || errors.title ? "border-destructive" : ""
                  }
                />
                {(errors.name || errors.title) && (
                  <p className="text-sm text-destructive">
                    {errors.name || errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description {type === "finding" && "*"}</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe this template..."
                  rows={3}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Type selector */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  {type === "finding" ? "Vulnerability Type *" : "Type"}
                </Label>
                {type === "project" && (
                  <Select
                    value={formData.type || "web-app"}
                    onValueChange={(value) =>
                      setFormData((prev: any) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-app">Web Application</SelectItem>
                      <SelectItem value="mobile-app">Mobile Application</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="cloud">Cloud</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {type === "finding" && (
                  <Input
                    id="vulnerability_type"
                    value={formData.vulnerability_type || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        vulnerability_type: e.target.value,
                      }))
                    }
                    placeholder="e.g., SQL Injection, XSS, CSRF"
                    className={errors.vulnerability_type ? "border-destructive" : ""}
                  />
                )}
                {type === "scope" && (
                  <Select
                    value={formData.type || "domain"}
                    onValueChange={(value) =>
                      setFormData((prev: any) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domain">Domain</SelectItem>
                      <SelectItem value="ip">IP Address</SelectItem>
                      <SelectItem value="subnet">Subnet</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {errors.vulnerability_type && (
                  <p className="text-sm text-destructive">{errors.vulnerability_type}</p>
                )}
              </div>

              {/* Severity for findings */}
              {type === "finding" && (
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity || "medium"}
                    onValueChange={(value) =>
                      setFormData((prev: any) => ({ ...prev, severity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Public toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_public">Public Template</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other team members to use this template
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={formData.is_public || false}
                  onCheckedChange={(checked) =>
                    setFormData((prev: any) => ({ ...prev, is_public: checked }))
                  }
                />
              </div>
            </TabsContent>

            {/* Details Tab (for findings) */}
            {type === "finding" && (
              <TabsContent value="details" className="space-y-4 px-1">
                {/* Remediation */}
                <div className="space-y-2">
                  <Label>Remediation Summary</Label>
                  <Textarea
                    value={formData.remediation?.summary || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        remediation: {
                          ...prev.remediation,
                          summary: e.target.value,
                        },
                      }))
                    }
                    placeholder="How to fix this vulnerability..."
                    rows={3}
                  />
                </div>

                {/* Remediation Steps */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Remediation Steps</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRemediationStep}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Step
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.remediation?.steps?.map((step: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-6">
                          {index + 1}.
                        </span>
                        <Input
                          value={step}
                          onChange={(e) => updateRemediationStep(index, e.target.value)}
                          placeholder="Enter step..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRemediationStep(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <button
                            type="button"
                            className="ml-1 hover:text-destructive"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* References */}
                <div className="space-y-2">
                  <Label>References</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newReference}
                      onChange={(e) => setNewReference(e.target.value)}
                      placeholder="Add a reference URL..."
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addReference())
                      }
                    />
                    <Button type="button" variant="outline" onClick={addReference}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.references?.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formData.references.map((ref: string) => (
                        <div
                          key={ref}
                          className="flex items-center justify-between text-sm bg-muted px-2 py-1 rounded"
                        >
                          <span className="truncate">{ref}</span>
                          <button
                            type="button"
                            className="ml-2 hover:text-destructive"
                            onClick={() => removeReference(ref)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Settings Tab (for project/scope) */}
            {type !== "finding" && (
              <TabsContent value="settings" className="space-y-4 px-1">
                <div className="text-sm text-muted-foreground">
                  Custom settings for this template can be configured here. These will be
                  applied when using the template.
                </div>
                {/* Placeholder for custom settings - can be expanded based on needs */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground text-center">
                    Settings configuration coming soon
                  </p>
                </div>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Template"
            ) : (
              "Create Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
