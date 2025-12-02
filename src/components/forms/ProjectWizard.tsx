/**
 * Project Creation Wizard
 *
 * A multi-step wizard for creating new projects.
 * Demonstrates Phase 6 features: wizard, templates, smart defaults, autosave.
 */

import React, { useState, useEffect } from "react"
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
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Plus,
  FileText,
  Settings,
  Users,
  CheckCircle2,
  Building2,
  Calendar,
  Tag,
  X,
  BookTemplate,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

import {
  MultiStepWizard,
  createWizardStep,
  type WizardStepProps,
} from "./MultiStepWizard"
import { TemplateSelector } from "./TemplateSelector"
import { useAutoSave, formatAutoSaveStatus } from "@/hooks/useAutoSave"
import { useProjectDefaults } from "@/hooks/useSmartDefaults"
import { useAuth } from "@/lib/contexts/auth-context"
import { projectsService } from "@/lib/api/projects"
import type { CreateProjectInput, ProjectTemplate } from "@/lib/types"

// ============================================================================
// Types
// ============================================================================

interface ProjectWizardData {
  // Step 1: Basic Info
  name: string
  client: string
  description: string
  // Step 2: Configuration
  testType: string
  status: string
  tags: string[]
  // Step 3: Timeline
  startDate: Date | null
  endDate: Date | null
  // Step 4: Team (optional)
  teamMembers: string[]
  // Template info
  templateId?: string
}

interface ProjectWizardProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onProjectCreated?: () => void
  trigger?: React.ReactNode
}

// ============================================================================
// Step 1: Basic Information
// ============================================================================

function BasicInfoStep({ data, updateData, errors, clearError }: WizardStepProps<ProjectWizardData>) {
  const { defaults, recentClients, favoriteTags } = useProjectDefaults()
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !data.tags.includes(tag)) {
      updateData({ tags: [...data.tags, tag] })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateData({ tags: data.tags.filter((t) => t !== tagToRemove) })
  }

  return (
    <div className="space-y-6">
      {/* Template selector */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <BookTemplate className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Start from a template</p>
            <p className="text-xs text-muted-foreground">
              Pre-fill fields with a project template
            </p>
          </div>
        </div>
        <TemplateSelector<ProjectTemplate>
          type="project"
          variant="popover"
          selectedId={data.templateId}
          placeholder="Choose template"
          onSelect={(template) => {
            updateData({
              templateId: template.id,
              name: template.name || data.name,
              description: template.description || data.description,
              testType: template.type || data.testType,
            })
          }}
        />
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">
            Project Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="E.g., API Security Assessment Q4 2024"
            value={data.name}
            onChange={(e) => {
              updateData({ name: e.target.value })
              clearError("name")
            }}
          />
          {errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="client">Client</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="client"
              placeholder="E.g., Acme Corporation"
              value={data.client}
              onChange={(e) => updateData({ client: e.target.value })}
              className="pl-9"
              list="recent-clients"
            />
            {recentClients.length > 0 && (
              <datalist id="recent-clients">
                {recentClients.map((client) => (
                  <option key={client} value={client} />
                ))}
              </datalist>
            )}
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the project scope and objectives..."
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {favoriteTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs text-muted-foreground">Suggestions:</span>
              {favoriteTags
                .filter((t) => !data.tags.includes(t))
                .slice(0, 5)
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent text-xs"
                    onClick={() => updateData({ tags: [...data.tags, tag] })}
                  >
                    {tag}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Step 2: Configuration
// ============================================================================

function ConfigurationStep({ data, updateData, errors, clearError }: WizardStepProps<ProjectWizardData>) {
  const { defaults } = useProjectDefaults()

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="testType">
            Test Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.testType}
            onValueChange={(value) => {
              updateData({ testType: value })
              clearError("testType")
            }}
          >
            <SelectTrigger id="testType">
              <SelectValue placeholder="Select test type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="black-box">
                <div className="flex flex-col">
                  <span>Black Box</span>
                  <span className="text-xs text-muted-foreground">No prior knowledge</span>
                </div>
              </SelectItem>
              <SelectItem value="white-box">
                <div className="flex flex-col">
                  <span>White Box</span>
                  <span className="text-xs text-muted-foreground">Full access and documentation</span>
                </div>
              </SelectItem>
              <SelectItem value="gray-box">
                <div className="flex flex-col">
                  <span>Gray Box</span>
                  <span className="text-xs text-muted-foreground">Partial knowledge</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.testType && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.testType}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <Select
            value={data.status}
            onValueChange={(value) => updateData({ status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Test Type Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {data.testType === "black-box" && (
            <p>
              Testing performed without any prior knowledge of the internal workings of the
              application. Simulates an external attacker's perspective.
            </p>
          )}
          {data.testType === "white-box" && (
            <p>
              Testing performed with complete knowledge of the application, including source
              code, architecture, and documentation. Allows for thorough analysis.
            </p>
          )}
          {data.testType === "gray-box" && (
            <p>
              Testing performed with partial knowledge of the application. Typically includes
              user-level access and some documentation, simulating an insider threat.
            </p>
          )}
          {!data.testType && <p>Select a test type to see more details.</p>}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Step 3: Timeline
// ============================================================================

function TimelineStep({ data, updateData, errors, clearError }: WizardStepProps<ProjectWizardData>) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>
            Start Date <span className="text-destructive">*</span>
          </Label>
          <DatePicker
            date={data.startDate || undefined}
            onDateChange={(date) => {
              updateData({ startDate: date || null })
              clearError("startDate")
            }}
            placeholder="Select start date"
            toDate={data.endDate || undefined}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.startDate}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            End Date <span className="text-destructive">*</span>
          </Label>
          <DatePicker
            date={data.endDate || undefined}
            onDateChange={(date) => {
              updateData({ endDate: date || null })
              clearError("endDate")
            }}
            placeholder="Select end date"
            fromDate={data.startDate || undefined}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.endDate}
            </p>
          )}
        </div>
      </div>

      {data.startDate && data.endDate && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Project Duration</p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil(
                    (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// Step 4: Review
// ============================================================================

function ReviewStep({ data }: WizardStepProps<ProjectWizardData>) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Not set"
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Review Project Details
          </CardTitle>
          <CardDescription>
            Please review the project information before creating.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project Name</p>
              <p className="font-medium">{data.name || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client</p>
              <p>{data.client || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Test Type</p>
              <Badge variant="outline">{data.testType || "Not selected"}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="secondary">{data.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              <p>{formatDate(data.startDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">End Date</p>
              <p>{formatDate(data.endDate)}</p>
            </div>
          </div>

          {data.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm mt-1">{data.description}</p>
            </div>
          )}

          {data.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Wizard Steps Configuration
// ============================================================================

const wizardSteps = [
  createWizardStep<ProjectWizardData>({
    id: "basic",
    title: "Basic Info",
    description: "Project name and details",
    icon: FileText,
    component: BasicInfoStep,
    validate: (data) => {
      const errors: Record<string, string> = {}
      if (!data.name.trim()) {
        errors.name = "Project name is required"
      }
      return errors
    },
  }),
  createWizardStep<ProjectWizardData>({
    id: "config",
    title: "Configuration",
    description: "Test type and settings",
    icon: Settings,
    component: ConfigurationStep,
    validate: (data) => {
      const errors: Record<string, string> = {}
      if (!data.testType) {
        errors.testType = "Test type is required"
      }
      return errors
    },
  }),
  createWizardStep<ProjectWizardData>({
    id: "timeline",
    title: "Timeline",
    description: "Project dates",
    icon: Calendar,
    component: TimelineStep,
    validate: (data) => {
      const errors: Record<string, string> = {}
      if (!data.startDate) {
        errors.startDate = "Start date is required"
      }
      if (!data.endDate) {
        errors.endDate = "End date is required"
      }
      if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        errors.endDate = "End date must be after start date"
      }
      return errors
    },
  }),
  createWizardStep<ProjectWizardData>({
    id: "review",
    title: "Review",
    description: "Confirm details",
    icon: CheckCircle2,
    component: ReviewStep,
    nextLabel: "Create Project",
  }),
]

// ============================================================================
// Main Component
// ============================================================================

export function ProjectWizard({
  open,
  onOpenChange,
  onProjectCreated,
  trigger,
}: ProjectWizardProps) {
  const { user } = useAuth()
  const { defaults, recordUsage } = useProjectDefaults()

  const initialData: ProjectWizardData = {
    name: "",
    client: "",
    description: "",
    testType: defaults.testType || "black-box",
    status: defaults.status || "planning",
    tags: [],
    startDate: null,
    endDate: null,
    teamMembers: [],
  }

  const handleComplete = async (data: ProjectWizardData) => {
    if (!user?.id) {
      toast.error("Authentication error", {
        description: "Please log in to create a project.",
      })
      throw new Error("Not authenticated")
    }

    try {
      const projectData: CreateProjectInput = {
        name: data.name,
        description: data.description || undefined,
        status: data.status as any,
        start_date: data.startDate?.toISOString().split("T")[0] || "",
        end_date: data.endDate?.toISOString().split("T")[0] || "",
        created_by: user.id,
        tags: data.tags.length > 0 ? data.tags : undefined,
        metadata: {
          testType: data.testType,
          client: data.client || undefined,
        },
      }

      await projectsService.createProject(projectData)

      // Record usage for smart defaults
      recordUsage(
        {
          status: data.status,
          testType: data.testType,
          tags: data.tags,
        },
        data.client
      )

      toast.success("Project created successfully", {
        description: `${data.name} has been added to your workspace`,
      })

      onProjectCreated?.()
    } catch (error: any) {
      toast.error("Failed to create project", {
        description: error.message || "An error occurred",
      })
      throw error
    }
  }

  return (
    <MultiStepWizard<ProjectWizardData>
      steps={wizardSteps}
      initialData={initialData}
      onComplete={handleComplete}
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )
      }
      title="Create New Project"
      description="Set up a new penetration testing project"
      persistKey="new-project"
      showStepIndicator={true}
      allowStepNavigation={true}
      submitLabel="Create Project"
    />
  )
}
