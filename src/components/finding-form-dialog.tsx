import type React from "react"

import { useState, useEffect } from "react"
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
import { Plus, Loader2, AlertCircle, FileText, Shield, Code, CheckCircle2 } from "lucide-react"
import { useCreateFinding, useUpdateFinding } from "@/lib/hooks/useFindings"
import type { CreateFindingInput, UpdateFindingInput, ApiFinding, CVSS } from "@/lib/types/api"
import { toast } from "sonner"
import { authService } from "@/lib/api"
import { DatePicker } from "@/components/ui/date-picker"
import { AttachmentUpload } from "@/components/attachments"
import { Separator } from "@/components/ui/separator"
import { CVSSCalculator } from "@/components/cvss-calculator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getSeverityColor } from "@/lib/style-utils"

interface FindingFormDialogProps {
  mode?: "add" | "edit"
  scopeId?: string
  findingId?: string
  initialData?: {
    title: string
    severity: string
    vulnerability_type: string
    cvss: string
    status: string
    description: string
    remediation: string
    proof_of_concept: string
  }
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onFindingCreated?: () => void
  onFindingUpdated?: () => void
}

export function FindingFormDialog({
  mode = "add",
  scopeId,
  findingId,
  initialData,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onFindingCreated,
  onFindingUpdated,
}: FindingFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [title, setTitle] = useState("")
  const [severity, setSeverity] = useState<"info" | "low" | "medium" | "high" | "critical" | "">("")
  const [vulnerabilityType, setVulnerabilityType] = useState("")
  const [cvssData, setCvssData] = useState<CVSS | undefined>(undefined)
  const [status, setStatus] = useState<"open" | "confirmed" | "false-positive" | "fixed" | "accepted">("open")
  const [description, setDescription] = useState("")
  const [remediation, setRemediation] = useState("")
  const [poc, setPoc] = useState("")
  const [discoveredAt, setDiscoveredAt] = useState<Date | undefined>(undefined)
  const [currentTab, setCurrentTab] = useState("details")

  // Use the new hooks
  const createFindingMutation = useCreateFinding()
  const updateFindingMutation = useUpdateFinding()

  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title || "")
      setSeverity(initialData.severity as any || "")
      setVulnerabilityType(initialData.vulnerability_type || "")
      // Parse CVSS if it's a string
      if (initialData.cvss) {
        setCvssData(typeof initialData.cvss === 'string' ? JSON.parse(initialData.cvss) : initialData.cvss as any)
      }
      setStatus(initialData.status as any || "open")
      setDescription(initialData.description || "")
      setRemediation(initialData.remediation || "")
      setPoc(initialData.proof_of_concept || "")
    } else if (open && !initialData) {
      // Reset form for add mode
      setTitle("")
      setSeverity("")
      setVulnerabilityType("")
      setCvssData(undefined)
      setStatus("open")
      setDescription("")
      setRemediation("")
      setPoc("")
      setDiscoveredAt(undefined)
      setCurrentTab("details")
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "add" && !scopeId) {
      toast.error("Scope ID is required to create a finding")
      return
    }

    if (!severity) {
      toast.error("Please select a severity level")
      return
    }

    try {
      // Get current user
      const currentUser = await authService.getCurrentUser()

      if (mode === "add" && scopeId) {
        // Create new finding
        const findingData: CreateFindingInput = {
          scope_id: scopeId,
          title,
          description,
          vulnerability_type: vulnerabilityType,
          severity,
          status,
          discovered_by: currentUser.id,
        }

        // Add optional fields
        if (cvssData) {
          findingData.cvss = cvssData
        }

        if (poc) {
          findingData.proof_of_concept = {
            payload: poc,
          }
        }

        if (remediation) {
          findingData.remediation = {
            summary: remediation,
          }
        }

        if (discoveredAt) {
          findingData.discovered_at = discoveredAt.toISOString()
        }

        await createFindingMutation.mutateAsync(findingData)
        onFindingCreated?.()
        setOpen(false)
      } else if (mode === "edit" && findingId) {
        // Update existing finding
        const updateData: UpdateFindingInput = {
          title,
          description,
          vulnerability_type: vulnerabilityType,
          severity,
          status,
        }

        // Add optional fields
        if (cvssData) {
          updateData.cvss = cvssData
        }

        if (poc) {
          updateData.proof_of_concept = {
            payload: poc,
          }
        }

        if (remediation) {
          updateData.remediation = {
            summary: remediation,
          }
        }

        await updateFindingMutation.mutateAsync({ id: findingId, data: updateData })
        onFindingUpdated?.()
        setOpen(false)
      }
    } catch (err) {
      // Error is already handled by the mutation hooks
    }
  }

  const isLoading = createFindingMutation.isPending || updateFindingMutation.isPending

  return (
    <>
      {/* Render trigger button only when not controlled externally */}
      {!controlledOpen && !trigger && (
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Finding
        </Button>
      )}
      {!controlledOpen && trigger && (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {mode === "add" ? "Add New Finding" : "Edit Finding"}
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                {mode === "add"
                  ? "Document a new security vulnerability discovered during testing"
                  : "Update the finding details and information"}
              </DialogDescription>
            </div>
            {severity && (
              <Badge className={cn("font-semibold border", getSeverityColor(severity))}>
                {severity.toUpperCase()}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" className="gap-2">
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="cvss" className="gap-2">
                <Shield className="h-4 w-4" />
                CVSS Score
              </TabsTrigger>
              <TabsTrigger value="poc" className="gap-2">
                <Code className="h-4 w-4" />
                Proof of Concept
              </TabsTrigger>
              <TabsTrigger value="remediation" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Remediation
              </TabsTrigger>
            </TabsList>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Finding Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., SQL Injection in User Search Endpoint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select value={severity} onValueChange={setSeverity} required>
                    <SelectTrigger id="severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="info">Informational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="false-positive">False Positive</SelectItem>
                      <SelectItem value="accepted">Accepted Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vulnerabilityType">Vulnerability Type *</Label>
                  <Select value={vulnerabilityType} onValueChange={setVulnerabilityType} required>
                    <SelectTrigger id="vulnerabilityType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="authentication">Broken Authentication</SelectItem>
                      <SelectItem value="xss">Cross-Site Scripting (XSS)</SelectItem>
                      <SelectItem value="access-control">Broken Access Control</SelectItem>
                      <SelectItem value="security-misconfiguration">Security Misconfiguration</SelectItem>
                      <SelectItem value="cryptographic-failures">Cryptographic Failures</SelectItem>
                      <SelectItem value="ssrf">Server-Side Request Forgery</SelectItem>
                      <SelectItem value="deserialization">Insecure Deserialization</SelectItem>
                      <SelectItem value="vulnerable-components">Vulnerable Components</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the vulnerability..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discoveredAt">Discovery Date</Label>
                <DatePicker
                  date={discoveredAt}
                  onDateChange={setDiscoveredAt}
                  placeholder="Select discovery date"
                  disabled={isLoading}
                  toDate={new Date()}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: When was this vulnerability discovered?
                </p>
              </div>
            </TabsContent>

            {/* CVSS TAB */}
            <TabsContent value="cvss" className="mt-4">
              <CVSSCalculator value={cvssData} onChange={setCvssData} />
            </TabsContent>

            {/* POC TAB */}
            <TabsContent value="poc" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="poc">Proof of Concept</Label>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <Textarea
                  id="poc"
                  placeholder="Provide steps to reproduce, payloads, or proof of concept code...&#10;&#10;Example:&#10;1. Navigate to /search?q=test&#10;2. Inject payload: ' OR 1=1--&#10;3. Observe unauthorized data access"
                  value={poc}
                  onChange={(e) => setPoc(e.target.value)}
                  rows={16}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Document detailed reproduction steps, HTTP requests, payloads, or code samples that demonstrate the vulnerability
                </p>
              </div>
            </TabsContent>

            {/* REMEDIATION TAB */}
            <TabsContent value="remediation" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="remediation">Remediation Recommendations</Label>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <Textarea
                  id="remediation"
                  placeholder="Provide detailed recommendations for fixing this vulnerability...&#10;&#10;Example:&#10;- Use parameterized queries or prepared statements&#10;- Implement input validation and sanitization&#10;- Apply principle of least privilege to database accounts&#10;- Use ORMs with built-in protection"
                  value={remediation}
                  onChange={(e) => setRemediation(e.target.value)}
                  rows={16}
                />
                <p className="text-xs text-muted-foreground">
                  Provide actionable steps, code examples, and best practices to remediate this vulnerability
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "add" ? "Add Finding" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
