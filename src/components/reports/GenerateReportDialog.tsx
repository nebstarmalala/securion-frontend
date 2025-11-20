/**
 * GenerateReportDialog Component
 *
 * Dialog for generating new reports with various options.
 */

import { useState, useEffect } from "react"
import { Loader2, FileText, Settings, CheckSquare } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjects } from "@/lib/hooks/useProjects"
import { useReportTypes, useGenerateReport, useSavedReportTemplates } from "@/lib/hooks/useReports"
import type { GenerateReportInput, SavedReportTemplate } from "@/lib/types"

interface GenerateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  onSuccess?: () => void
}

export function GenerateReportDialog({
  open,
  onOpenChange,
  projectId: initialProjectId,
  onSuccess,
}: GenerateReportDialogProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState<GenerateReportInput>({
    project_id: initialProjectId || "",
    report_type: "technical",
    format: "pdf",
    title: "",
    options: {
      executive_summary: true,
      technical_details: true,
      proof_of_concept: true,
      remediation_steps: true,
      cvss_scores: true,
    },
  })
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: reportTypes, isLoading: typesLoading } = useReportTypes()
  const { data: templates, isLoading: templatesLoading } = useSavedReportTemplates()
  const generateReport = useGenerateReport()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        project_id: initialProjectId || "",
        report_type: "technical",
        format: "pdf",
        title: "",
        options: {
          executive_summary: true,
          technical_details: true,
          proof_of_concept: true,
          remediation_steps: true,
          cvss_scores: true,
        },
      })
      setSelectedTemplate(null)
      setActiveTab("details")
    }
  }, [open, initialProjectId])

  // Apply template settings
  const handleTemplateSelect = (template: SavedReportTemplate) => {
    setSelectedTemplate(template.id)
    setFormData((prev) => ({
      ...prev,
      report_type: template.report_type,
      format: template.format,
      options: { ...prev.options, ...template.options },
      template_id: template.id,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.project_id) return

    try {
      await generateReport.mutateAsync(formData)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Error handled by mutation
    }
  }

  const updateOption = (key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value,
      },
    }))
  }

  const isLoading = projectsLoading || typesLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Create a new report for your project with customized options.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="options" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Options
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 px-1">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project *</Label>
                    <Select
                      value={formData.project_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, project_id: value }))
                      }
                      disabled={!!initialProjectId}
                    >
                      <SelectTrigger>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Auto-generated if empty"
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
                      <Label htmlFor="format">Format</Label>
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
                </>
              )}
            </TabsContent>

            {/* Options Tab */}
            <TabsContent value="options" className="space-y-4 px-1">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Include in Report</h4>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="executive_summary"
                      checked={formData.options?.executive_summary}
                      onCheckedChange={(checked) =>
                        updateOption("executive_summary", checked as boolean)
                      }
                    />
                    <Label htmlFor="executive_summary" className="text-sm font-normal">
                      Executive Summary
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="technical_details"
                      checked={formData.options?.technical_details}
                      onCheckedChange={(checked) =>
                        updateOption("technical_details", checked as boolean)
                      }
                    />
                    <Label htmlFor="technical_details" className="text-sm font-normal">
                      Technical Details
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="proof_of_concept"
                      checked={formData.options?.proof_of_concept}
                      onCheckedChange={(checked) =>
                        updateOption("proof_of_concept", checked as boolean)
                      }
                    />
                    <Label htmlFor="proof_of_concept" className="text-sm font-normal">
                      Proof of Concept
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remediation_steps"
                      checked={formData.options?.remediation_steps}
                      onCheckedChange={(checked) =>
                        updateOption("remediation_steps", checked as boolean)
                      }
                    />
                    <Label htmlFor="remediation_steps" className="text-sm font-normal">
                      Remediation Steps
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cvss_scores"
                      checked={formData.options?.cvss_scores}
                      onCheckedChange={(checked) =>
                        updateOption("cvss_scores", checked as boolean)
                      }
                    />
                    <Label htmlFor="cvss_scores" className="text-sm font-normal">
                      CVSS Scores
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4 px-1">
              {templatesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : templates?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved templates yet</p>
                  <p className="text-sm">Create a template to reuse report settings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates?.data.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          {template.description && (
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {template.report_type} / {template.format.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.project_id || generateReport.isPending}
          >
            {generateReport.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
