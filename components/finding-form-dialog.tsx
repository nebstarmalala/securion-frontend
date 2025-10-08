"use client"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface FindingFormDialogProps {
  mode?: "add" | "edit"
  initialData?: {
    title: string
    severity: string
    vulnType: string
    cvss: string
    status: string
    assignedTo: string
    description: string
    impact: string
    remediation: string
    poc: string
  }
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FindingFormDialog({
  mode = "add",
  initialData,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: FindingFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [title, setTitle] = useState("")
  const [severity, setSeverity] = useState("")
  const [vulnType, setVulnType] = useState("")
  const [cvss, setCvss] = useState("")
  const [status, setStatus] = useState("open")
  const [assignedTo, setAssignedTo] = useState("")
  const [description, setDescription] = useState("")
  const [impact, setImpact] = useState("")
  const [remediation, setRemediation] = useState("")
  const [poc, setPoc] = useState("")

  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title || "")
      setSeverity(initialData.severity || "")
      setVulnType(initialData.vulnType || "")
      setCvss(initialData.cvss || "")
      setStatus(initialData.status || "open")
      setAssignedTo(initialData.assignedTo || "")
      setDescription(initialData.description || "")
      setImpact(initialData.impact || "")
      setRemediation(initialData.remediation || "")
      setPoc(initialData.poc || "")
    } else if (open && !initialData) {
      // Reset form for add mode
      setTitle("")
      setSeverity("")
      setVulnType("")
      setCvss("")
      setStatus("open")
      setAssignedTo("")
      setDescription("")
      setImpact("")
      setRemediation("")
      setPoc("")
    }
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("[v0] Finding form submitted:", {
      title,
      severity,
      vulnType,
      cvss,
      status,
      assignedTo,
      description,
      impact,
      remediation,
      poc,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Finding
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Finding" : "Edit Finding"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Document a new security vulnerability discovered during testing"
              : "Update the finding details and information"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
                <Label htmlFor="cvss">CVSS Score</Label>
                <Input
                  id="cvss"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="9.8"
                  value={cvss}
                  onChange={(e) => setCvss(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="accepted">Accepted Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vulnType">Vulnerability Type *</Label>
                <Select value={vulnType} onValueChange={setVulnType} required>
                  <SelectTrigger id="vulnType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Authentication">Broken Authentication</SelectItem>
                    <SelectItem value="XSS">Cross-Site Scripting (XSS)</SelectItem>
                    <SelectItem value="Access Control">Broken Access Control</SelectItem>
                    <SelectItem value="Security Misconfiguration">Security Misconfiguration</SelectItem>
                    <SelectItem value="Cryptographic Failures">Cryptographic Failures</SelectItem>
                    <SelectItem value="SSRF">Server-Side Request Forgery</SelectItem>
                    <SelectItem value="Deserialization">Insecure Deserialization</SelectItem>
                    <SelectItem value="Components">Vulnerable Components</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alex Rivera">Alex Rivera</SelectItem>
                    <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                    <SelectItem value="Marcus Johnson">Marcus Johnson</SelectItem>
                    <SelectItem value="Emily Watson">Emily Watson</SelectItem>
                    <SelectItem value="David Kim">David Kim</SelectItem>
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
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impact</Label>
              <Textarea
                id="impact"
                placeholder="Describe the potential impact of this vulnerability..."
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poc">Proof of Concept</Label>
              <Textarea
                id="poc"
                placeholder="Provide steps to reproduce or proof of concept code..."
                value={poc}
                onChange={(e) => setPoc(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remediation">Remediation</Label>
              <Textarea
                id="remediation"
                placeholder="Provide recommendations for fixing this vulnerability..."
                value={remediation}
                onChange={(e) => setRemediation(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{mode === "add" ? "Add Finding" : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
