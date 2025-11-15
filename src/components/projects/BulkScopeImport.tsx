"use client"

import { useState, useRef, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Download, Loader2 } from "lucide-react"
import { useBulkCreateScopes } from "@/hooks"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface BulkScopeImportProps {
  projectId: string
  onScopesImported?: () => void
}

interface ParsedScope {
  name: string
  type: string
  target: string
  port?: number
  protocol?: string
  notes?: string
  status?: string
  valid: boolean
  errors?: string[]
}

export function BulkScopeImport({ projectId, onScopesImported }: BulkScopeImportProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedScopes, setParsedScopes] = useState<ParsedScope[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bulkCreateMutation = useBulkCreateScopes()

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()

    if (fileExtension !== "csv" && fileExtension !== "json") {
      setParseError("Invalid file type. Please upload a CSV or JSON file.")
      return
    }

    setFile(selectedFile)
    setParseError(null)
    parseFile(selectedFile)
  }

  const parseFile = async (file: File) => {
    try {
      const text = await file.text()
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      let scopes: ParsedScope[]

      if (fileExtension === "csv") {
        scopes = parseCSV(text)
      } else {
        scopes = parseJSON(text)
      }

      setParsedScopes(scopes)
    } catch (error) {
      setParseError(
        error instanceof Error ? error.message : "Failed to parse file. Please check the file format."
      )
      setParsedScopes([])
    }
  }

  const parseCSV = (text: string): ParsedScope[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) {
      throw new Error("CSV file must contain headers and at least one row of data")
    }

    // Parse headers (case-insensitive)
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const requiredHeaders = ["name", "type", "target"]

    // Check if all required headers exist
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`)
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim())
      const scope: any = {}

      headers.forEach((header, i) => {
        scope[header] = values[i] || ""
      })

      return validateScope(scope, index + 2)
    })
  }

  const parseJSON = (text: string): ParsedScope[] => {
    const data = JSON.parse(text)
    const scopesArray = Array.isArray(data) ? data : data.scopes || []

    if (!Array.isArray(scopesArray)) {
      throw new Error("JSON must be an array or contain a 'scopes' array")
    }

    return scopesArray.map((scope, index) => validateScope(scope, index + 1))
  }

  const validateScope = (scope: any, lineNumber: number): ParsedScope => {
    const errors: string[] = []

    if (!scope.name || scope.name.trim() === "") {
      errors.push("Name is required")
    }

    if (!scope.type || scope.type.trim() === "") {
      errors.push("Type is required")
    } else {
      const validTypes = ["web", "api", "mobile", "network", "cloud", "other"]
      if (!validTypes.includes(scope.type.toLowerCase())) {
        errors.push(`Invalid type. Must be one of: ${validTypes.join(", ")}`)
      }
    }

    if (!scope.target || scope.target.trim() === "") {
      errors.push("Target is required")
    }

    const port = scope.port ? parseInt(scope.port) : undefined
    if (scope.port && (isNaN(port!) || port! < 1 || port! > 65535)) {
      errors.push("Port must be between 1 and 65535")
    }

    return {
      name: scope.name || `Scope ${lineNumber}`,
      type: scope.type || "other",
      target: scope.target || "",
      port,
      protocol: scope.protocol,
      notes: scope.notes,
      status: scope.status || "in-scope",
      valid: errors.length === 0,
      errors,
    }
  }

  const handleImport = async () => {
    const validScopes = parsedScopes.filter((s) => s.valid)

    if (validScopes.length === 0) {
      toast.error("No valid scopes to import")
      return
    }

    try {
      const scopesData = {
        project_id: projectId,
        scopes: validScopes.map((s) => ({
          name: s.name,
          type: s.type,
          target: s.target,
          port: s.port,
          protocol: s.protocol,
          notes: s.notes,
          status: s.status || "in-scope",
        })),
      }

      await bulkCreateMutation.mutateAsync(scopesData)

      toast.success(`Successfully imported ${validScopes.length} scope${validScopes.length !== 1 ? "s" : ""}`)
      setOpen(false)
      resetForm()
      onScopesImported?.()
    } catch (error: any) {
      toast.error("Failed to import scopes", {
        description: error.message || "An error occurred while importing scopes",
      })
    }
  }

  const resetForm = () => {
    setFile(null)
    setParsedScopes([])
    setParseError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const downloadTemplate = (format: "csv" | "json") => {
    const template =
      format === "csv"
        ? `name,type,target,port,protocol,notes,status
Example Web App,web,https://example.com,443,https,Main application,in-scope
API Server,api,api.example.com,443,https,REST API endpoint,in-scope
Internal Network,network,192.168.1.0/24,,,,in-scope`
        : JSON.stringify(
            {
              scopes: [
                {
                  name: "Example Web App",
                  type: "web",
                  target: "https://example.com",
                  port: 443,
                  protocol: "https",
                  notes: "Main application",
                  status: "in-scope",
                },
                {
                  name: "API Server",
                  type: "api",
                  target: "api.example.com",
                  port: 443,
                  protocol: "https",
                  notes: "REST API endpoint",
                  status: "in-scope",
                },
              ],
            },
            null,
            2
          )

    const blob = new Blob([template], { type: format === "csv" ? "text/csv" : "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `scope-template.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validCount = parsedScopes.filter((s) => s.valid).length
  const invalidCount = parsedScopes.filter((s) => !s.valid).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Scopes</DialogTitle>
          <DialogDescription>Import multiple scopes from CSV or JSON file</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Downloads */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Download template:</p>
            <Button variant="outline" size="sm" onClick={() => downloadTemplate("csv")}>
              <Download className="mr-2 h-3 w-3" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadTemplate("json")}>
              <Download className="mr-2 h-3 w-3" />
              JSON
            </Button>
          </div>

          {/* File Upload */}
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-12 transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
              parseError && "border-destructive"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-center">
              {file ? (
                <>
                  <FileText className="h-12 w-12 text-primary mb-4" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      resetForm()
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove file
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">CSV or JSON files only</p>
                </>
              )}
            </div>
          </div>

          {/* Parse Error */}
          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {parsedScopes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Preview ({parsedScopes.length} scopes)</h3>
                <div className="flex items-center gap-2">
                  {validCount > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      {validCount} valid
                    </Badge>
                  )}
                  {invalidCount > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      {invalidCount} invalid
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Port</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedScopes.map((scope, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {scope.valid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{scope.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{scope.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{scope.target}</TableCell>
                        <TableCell>{scope.port || "-"}</TableCell>
                        <TableCell>
                          {scope.errors && scope.errors.length > 0 && (
                            <p className="text-xs text-destructive">{scope.errors.join(", ")}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || bulkCreateMutation.isPending}
          >
            {bulkCreateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import {validCount} Scope{validCount !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
