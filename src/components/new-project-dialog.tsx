"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { projectsService } from "@/lib/api/projects"
import type { CreateProjectInput, UpdateProjectInput, ApiProject } from "@/lib/types/api"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"

interface NewProjectDialogProps {
  mode?: "create" | "edit"
  project?: ApiProject
  onProjectCreated?: () => void
  onProjectUpdated?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewProjectDialog({
  mode = "create",
  project,
  onProjectCreated,
  onProjectUpdated,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: NewProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  // Use controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  // Helper to parse tags from array to comma-separated string
  const formatTagsForInput = (tags?: string[]) => {
    if (!tags || tags.length === 0) return ""
    return tags.join(", ")
  }

  // Helper to parse date string to Date object
  const parseDate = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date
  }

  // Initialize form data based on mode
  const getInitialFormData = () => {
    if (mode === "edit" && project) {
      return {
        name: project.name || "",
        // Read from root level (API sends it there) but we'll send it back in metadata
        client: project.client || project.metadata?.client || "",
        description: project.description || "",
        status: project.status || "planning",
        testType: project.test_type || project.metadata?.testType || "black-box",
        tags: formatTagsForInput(project.tags),
      }
    }
    return {
      name: "",
      client: "",
      description: "",
      status: "planning" as const,
      testType: "black-box",
      tags: "",
    }
  }

  // Form state
  const [formData, setFormData] = useState(getInitialFormData())
  const [startDate, setStartDate] = useState<Date | undefined>(
    mode === "edit" && project ? parseDate(project.start_date) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    mode === "edit" && project ? parseDate(project.end_date) : undefined
  )

  // Update form data when project changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && project) {
      setFormData(getInitialFormData())
      setStartDate(parseDate(project.start_date))
      setEndDate(parseDate(project.end_date))
    }
  }, [mode, project])

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required"
    }

    if (!formData.testType) {
      newErrors.testType = "Test type is required"
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required"
    }

    if (!endDate) {
      newErrors.endDate = "End date is required"
    }

    if (startDate && endDate) {
      if (endDate <= startDate) {
        newErrors.endDate = "End date must be after start date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Validation failed", {
        description: "Please fix the errors in the form",
      })
      return
    }

    if (!user?.id && mode === "create") {
      toast.error("Authentication error", {
        description: "User not authenticated. Please log in again.",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Parse tags from comma-separated string
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Prepare metadata with client and testType
      const metadata: Record<string, any> = {
        testType: formData.testType, // testType is required
      }
      if (formData.client) {
        metadata.client = formData.client
      }

      if (mode === "edit" && project) {
        // Update existing project
        const updateData: UpdateProjectInput = {
          name: formData.name,
          description: formData.description || undefined,
          status: formData.status,
          start_date: startDate?.toISOString().split("T")[0] || "",
          end_date: endDate?.toISOString().split("T")[0] || "",
          tags: tags.length > 0 ? tags : undefined,
          metadata: metadata, // Always include metadata with testType
        }

        await projectsService.updateProject(project.id, updateData)

        toast.success("Project updated successfully", {
          description: `${formData.name} has been updated`,
        })

        // Close dialog
        setOpen(false)

        // Notify parent component
        onProjectUpdated?.()
      } else {
        // Create new project
        const projectData: CreateProjectInput = {
          name: formData.name,
          description: formData.description || undefined,
          status: formData.status,
          start_date: startDate?.toISOString().split("T")[0] || "",
          end_date: endDate?.toISOString().split("T")[0] || "",
          created_by: user.id,
          tags: tags.length > 0 ? tags : undefined,
          metadata: metadata, // Always include metadata with testType
        }

        await projectsService.createProject(projectData)

        toast.success("Project created successfully", {
          description: `${formData.name} has been added to your workspace`,
        })

        // Reset form
        setFormData({
          name: "",
          client: "",
          description: "",
          status: "planning",
          testType: "black-box",
          tags: "",
        })
        setStartDate(undefined)
        setEndDate(undefined)

        // Close dialog
        setOpen(false)

        // Notify parent component
        onProjectCreated?.()
      }
    } catch (error: any) {
      console.error(`Failed to ${mode} project:`, error)

      // Handle validation errors from API
      if (error.status === 422 && error.errors) {
        const apiErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, messages]) => {
          apiErrors[key] = (messages as string[])[0]
        })
        setErrors(apiErrors)
      }

      toast.error(`Failed to ${mode} project`, {
        description: error.message || `An error occurred while ${mode === "create" ? "creating" : "updating"} the project`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === "create" && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Project" : "Edit Project"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new penetration testing project to your workspace."
              : "Update the project information."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="E.g., API Security Assessment"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              placeholder="E.g., Acme Corporation"
              value={formData.client}
              onChange={(e) => handleInputChange("client", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the project scope and objectives..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleInputChange("status", value as "planning" | "active" | "on-hold" | "completed")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="testType">
                Test Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.testType}
                onValueChange={(value) => handleInputChange("testType", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="testType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black-box">Black Box</SelectItem>
                  <SelectItem value="white-box">White Box</SelectItem>
                  <SelectItem value="gray-box">Gray Box</SelectItem>
                </SelectContent>
              </Select>
              {errors.testType && <p className="text-sm text-destructive">{errors.testType}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                date={startDate}
                onDateChange={(date) => {
                  setStartDate(date)
                  // Clear error for this field
                  if (errors.startDate || errors.start_date) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.startDate
                      delete newErrors.start_date
                      return newErrors
                    })
                  }
                }}
                placeholder="Select start date"
                disabled={isSubmitting}
                toDate={endDate}
              />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
              {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                date={endDate}
                onDateChange={(date) => {
                  setEndDate(date)
                  // Clear error for this field
                  if (errors.endDate || errors.end_date) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.endDate
                      delete newErrors.end_date
                      return newErrors
                    })
                  }
                }}
                placeholder="Select end date"
                disabled={isSubmitting}
                fromDate={startDate}
              />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
              {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Comma-separated tags (e.g., high-priority, fintech)"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create Project"
                : "Update Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
