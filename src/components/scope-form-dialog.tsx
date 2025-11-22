import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Loader2 } from "lucide-react"
import { scopesService } from "@/lib/api"
import type { CreateScopeInput, ApiScope, ScopeService } from "@/lib/types/api"
import { toast } from "sonner"
import { useParams } from "react-router-dom"

interface ScopeFormDialogProps {
  mode?: "add" | "edit"
  scopeId?: string
  projectId?: string
  initialData?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onScopeCreated?: () => void
  onScopeUpdated?: () => void
}

export function ScopeFormDialog({
  mode = "add",
  scopeId,
  projectId,
  initialData,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onScopeCreated,
  onScopeUpdated,
}: ScopeFormDialogProps) {
  const params = useParams()
  const currentProjectId = projectId || params.id

  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "domain",
    target: initialData?.target || "",
    port: initialData?.port?.toString() || "",
    protocol: initialData?.protocol || "https",
    status: initialData?.status || "in-scope",
    notes: initialData?.notes || "",
  })
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [services, setServices] = useState<ScopeService[]>(initialData?.services || [])
  const [serviceInput, setServiceInput] = useState("")
  const [versionInput, setVersionInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serviceErrors, setServiceErrors] = useState<{ name?: string; version?: string }>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleAddService = () => {
    // Clear previous service errors
    setServiceErrors({})

    // Validate service name (required, max 100 chars)
    if (!serviceInput.trim()) {
      setServiceErrors({ name: "Service name is required" })
      return
    }

    if (serviceInput.trim().length > 100) {
      setServiceErrors({ name: "Service name must not exceed 100 characters" })
      return
    }

    // Validate version (optional, max 50 chars)
    if (versionInput.trim() && versionInput.trim().length > 50) {
      setServiceErrors({ version: "Version must not exceed 50 characters" })
      return
    }

    // Create service object
    const newService: ScopeService = {
      name: serviceInput.trim(),
      version: versionInput.trim() || undefined,
    }

    // Check for duplicate service names
    const isDuplicate = services.some(
      (service) => service.name.toLowerCase() === newService.name.toLowerCase()
    )

    if (isDuplicate) {
      setServiceErrors({ name: "This service has already been added" })
      return
    }

    // Add service to the list
    setServices([...services, newService])
    setServiceInput("")
    setVersionInput("")
    setServiceErrors({})
  }

  const handleRemoveService = (serviceName: string) => {
    setServices(services.filter((service) => service.name !== serviceName))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Scope name is required"
    }

    if (!formData.type) {
      newErrors.type = "Type is required"
    }

    if (!formData.target.trim()) {
      newErrors.target = "Target URL/IP is required"
    }

    if (formData.port && (isNaN(Number(formData.port)) || Number(formData.port) < 1 || Number(formData.port) > 65535)) {
      newErrors.port = "Port must be between 1 and 65535"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Validation failed", {
        description: "Please fix the errors in the form",
      })
      return
    }

    if (!currentProjectId) {
      toast.error("Project ID not found", {
        description: "Cannot create scope without a project",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const scopeData: CreateScopeInput = {
        project_id: currentProjectId,
        name: formData.name,
        type: formData.type as "domain" | "ip" | "subnet" | "service" | "application",
        target: formData.target,
        port: formData.port ? Number(formData.port) : undefined,
        protocol: formData.protocol || undefined,
        status: formData.status as "in-scope" | "out-of-scope" | "testing" | "completed",
        notes: formData.notes || undefined,
        services: services.length > 0 ? services : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }

      if (mode === "edit" && scopeId) {
        await scopesService.updateScope(scopeId, scopeData)
        toast.success("Scope updated successfully", {
          description: `${formData.name} has been updated`,
        })
      } else {
        await scopesService.createScope(scopeData)
        toast.success("Scope created successfully", {
          description: `${formData.name} has been added to the project`,
        })
      }

      // Reset form
      setFormData({
        name: "",
        type: "domain",
        target: "",
        port: "",
        protocol: "https",
        status: "in-scope",
        notes: "",
      })
      setTags([])
      setServices([])
      setErrors({})

      // Close dialog
      setOpen(false)

      // Notify parent component
      if (mode === "edit") {
        onScopeUpdated?.()
      } else {
        onScopeCreated?.()
      }
    } catch (error: any) {
      // Handle validation errors from API
      if (error.status === 422 && error.errors) {
        const apiErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, messages]) => {
          apiErrors[key] = (messages as string[])[0]
        })
        setErrors(apiErrors)
      }

      toast.error(`Failed to ${mode === "edit" ? "update" : "create"} scope`, {
        description: error.message || "An error occurred while saving the scope",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Render trigger button only when not controlled externally */}
      {!controlledOpen && !trigger && (
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Scope
        </Button>
      )}
      {!controlledOpen && trigger && (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Scope" : "Edit Scope"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Define a new testing scope for this project"
              : "Update the scope information and settings"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Scope Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Main API Gateway"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domain">Domain</SelectItem>
                    <SelectItem value="ip">IP Address</SelectItem>
                    <SelectItem value="subnet">Subnet</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">
                Target URL/IP <span className="text-destructive">*</span>
              </Label>
              <Input
                id="target"
                placeholder="e.g., https://api.example.com or 192.168.1.1"
                value={formData.target}
                onChange={(e) => handleInputChange("target", e.target.value)}
                disabled={isSubmitting}
              />
              {errors.target && <p className="text-sm text-destructive">{errors.target}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="443"
                  min="1"
                  max="65535"
                  value={formData.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.port && <p className="text-sm text-destructive">{errors.port}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="protocol">Protocol</Label>
                <Input
                  id="protocol"
                  placeholder="e.g., https, http, ssh"
                  value={formData.protocol}
                  onChange={(e) => handleInputChange("protocol", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-scope">In Scope</SelectItem>
                    <SelectItem value="out-of-scope">Out of Scope</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information about this scope..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services & Versions</Label>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    id="services"
                    placeholder="Service name (e.g., Apache, Nginx)"
                    value={serviceInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setServiceInput(e.target.value)
                      if (serviceErrors.name) {
                        setServiceErrors((prev) => ({ ...prev, name: undefined }))
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddService()
                      }
                    }}
                    disabled={isSubmitting}
                    className={serviceErrors.name ? "border-destructive" : ""}
                  />
                  {serviceErrors.name && (
                    <p className="text-xs text-destructive">{serviceErrors.name}</p>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Input
                    id="version"
                    placeholder="Version (e.g., 2.4.41)"
                    value={versionInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setVersionInput(e.target.value)
                      if (serviceErrors.version) {
                        setServiceErrors((prev) => ({ ...prev, version: undefined }))
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddService()
                      }
                    }}
                    disabled={isSubmitting}
                    className={serviceErrors.version ? "border-destructive" : ""}
                  />
                  {serviceErrors.version && (
                    <p className="text-xs text-destructive">{serviceErrors.version}</p>
                  )}
                </div>
                <Button type="button" variant="outline" onClick={handleAddService} disabled={isSubmitting}>
                  Add
                </Button>
              </div>
              {services.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {services.map((service, index) => (
                    <Badge key={`${service.name}-${index}`} variant="secondary" className="gap-1 pr-1">
                      {service.name}
                      {service.version && ` (${service.version})`}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => handleRemoveService(service.name)}
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  disabled={isSubmitting}
                />
                <Button type="button" variant="outline" onClick={handleAddTag} disabled={isSubmitting}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting
                ? mode === "add"
                  ? "Creating..."
                  : "Saving..."
                : mode === "add"
                  ? "Add Scope"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
