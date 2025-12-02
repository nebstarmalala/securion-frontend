/**
 * Template Selector Component
 *
 * A reusable component for selecting and applying templates.
 * Supports preview, search, and quick-apply functionality.
 */

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  FileText,
  Search,
  Check,
  ChevronDown,
  Star,
  Clock,
  User,
  Globe,
  Loader2,
  BookTemplate,
} from "lucide-react"
import {
  useProjectTemplates,
  useFindingTemplates,
  useScopeTemplates,
} from "@/hooks"
import type {
  ProjectTemplate,
  FindingTemplate,
  ScopeTemplate,
} from "@/lib/types"

// ============================================================================
// Types
// ============================================================================

export type TemplateType = "project" | "finding" | "scope"

export interface TemplateSelectorProps<T = any> {
  /** Type of template to select */
  type: TemplateType
  /** Currently selected template ID */
  selectedId?: string
  /** Callback when template is selected */
  onSelect: (template: T) => void
  /** Callback when template is applied (data merged) */
  onApply?: (templateData: Partial<T>) => void
  /** Custom trigger element */
  trigger?: React.ReactNode
  /** Whether to show in popover (compact) or dialog (full) mode */
  variant?: "popover" | "dialog"
  /** Placeholder text */
  placeholder?: string
  /** Whether the selector is disabled */
  disabled?: boolean
  /** Additional class name */
  className?: string
}

// ============================================================================
// Template Preview Components
// ============================================================================

function ProjectTemplatePreview({ template }: { template: ProjectTemplate }) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium">{template.name}</h4>
        {template.description && (
          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{template.type}</Badge>
        {template.is_public && (
          <Badge variant="secondary">
            <Globe className="mr-1 h-3 w-3" />
            Public
          </Badge>
        )}
      </div>
      {template.settings && Object.keys(template.settings).length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Settings:</span>
          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-24">
            {JSON.stringify(template.settings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function FindingTemplatePreview({ template }: { template: FindingTemplate }) {
  const severityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
    info: "bg-gray-100 text-gray-800 border-gray-200",
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium">{template.title}</h4>
        {template.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {template.description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge className={cn("border", severityColors[template.severity])}>
          {template.severity.toUpperCase()}
        </Badge>
        <Badge variant="outline">{template.vulnerability_type}</Badge>
        {template.is_public && (
          <Badge variant="secondary">
            <Globe className="mr-1 h-3 w-3" />
            Public
          </Badge>
        )}
      </div>
      {template.cvss && (
        <div className="text-sm">
          <span className="font-medium">CVSS {template.cvss.version}:</span>{" "}
          <span className="text-muted-foreground">{template.cvss.score}</span>
        </div>
      )}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function ScopeTemplatePreview({ template }: { template: ScopeTemplate }) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium">{template.name}</h4>
        {template.description && (
          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{template.type}</Badge>
        {template.is_public && (
          <Badge variant="secondary">
            <Globe className="mr-1 h-3 w-3" />
            Public
          </Badge>
        )}
      </div>
      {template.default_settings && Object.keys(template.default_settings).length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Default Settings:</span>
          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-24">
            {JSON.stringify(template.default_settings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Template List Item
// ============================================================================

interface TemplateListItemProps<T> {
  template: T
  isSelected: boolean
  onClick: () => void
  type: TemplateType
}

function TemplateListItem<T extends { id: string; name?: string; title?: string; is_public?: boolean }>({
  template,
  isSelected,
  onClick,
  type,
}: TemplateListItemProps<T>) {
  const name = (template as any).name || (template as any).title || "Untitled"

  return (
    <CommandItem
      value={name}
      onSelect={onClick}
      className={cn(
        "flex items-center gap-2 p-2 cursor-pointer",
        isSelected && "bg-accent"
      )}
    >
      <FileText className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <span className="truncate">{name}</span>
      </div>
      {template.is_public && <Globe className="h-3 w-3 text-muted-foreground" />}
      {isSelected && <Check className="h-4 w-4 text-primary" />}
    </CommandItem>
  )
}

// ============================================================================
// Main Template Selector Component
// ============================================================================

export function TemplateSelector<T extends { id: string }>({
  type,
  selectedId,
  onSelect,
  onApply,
  trigger,
  variant = "popover",
  placeholder = "Select template...",
  disabled = false,
  className,
}: TemplateSelectorProps<T>) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [previewTemplate, setPreviewTemplate] = useState<T | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "public" | "mine">("all")

  // Fetch templates based on type
  const { data: projectTemplates, isLoading: loadingProjects } = useProjectTemplates(
    { search: searchQuery },
    { enabled: type === "project" }
  )
  const { data: findingTemplates, isLoading: loadingFindings } = useFindingTemplates(
    { search: searchQuery },
    { enabled: type === "finding" }
  )
  const { data: scopeTemplates, isLoading: loadingScopes } = useScopeTemplates(
    { search: searchQuery },
    { enabled: type === "scope" }
  )

  const isLoading = loadingProjects || loadingFindings || loadingScopes

  const templates = useMemo(() => {
    switch (type) {
      case "project":
        return (projectTemplates?.data || []) as unknown as T[]
      case "finding":
        return (findingTemplates?.data || []) as unknown as T[]
      case "scope":
        return (scopeTemplates?.data || []) as unknown as T[]
      default:
        return []
    }
  }, [type, projectTemplates, findingTemplates, scopeTemplates])

  const filteredTemplates = useMemo(() => {
    let filtered = templates

    if (activeTab === "public") {
      filtered = filtered.filter((t) => (t as any).is_public)
    } else if (activeTab === "mine") {
      filtered = filtered.filter((t) => !(t as any).is_public)
    }

    return filtered
  }, [templates, activeTab])

  const selectedTemplate = templates.find((t) => t.id === selectedId)

  const handleSelect = (template: T) => {
    onSelect(template)
    setPreviewTemplate(null)
    setOpen(false)
  }

  const handleApply = () => {
    if (previewTemplate && onApply) {
      onApply(previewTemplate as Partial<T>)
      setPreviewTemplate(null)
      setOpen(false)
    }
  }

  const renderPreview = () => {
    if (!previewTemplate) return null

    switch (type) {
      case "project":
        return <ProjectTemplatePreview template={previewTemplate as unknown as ProjectTemplate} />
      case "finding":
        return <FindingTemplatePreview template={previewTemplate as unknown as FindingTemplate} />
      case "scope":
        return <ScopeTemplatePreview template={previewTemplate as unknown as ScopeTemplate} />
      default:
        return null
    }
  }

  // Popover variant
  if (variant === "popover") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn("w-full justify-between", className)}
            >
              <span className="flex items-center gap-2 truncate">
                <BookTemplate className="h-4 w-4" />
                {selectedTemplate
                  ? (selectedTemplate as any).name || (selectedTemplate as any).title
                  : placeholder}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Search ${type} templates...`}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No templates found.</CommandEmpty>
                  <CommandGroup>
                    {filteredTemplates.map((template) => (
                      <TemplateListItem
                        key={template.id}
                        template={template}
                        isSelected={template.id === selectedId}
                        onClick={() => handleSelect(template)}
                        type={type}
                      />
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  // Dialog variant (full mode with preview)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            disabled={disabled}
            className={cn("gap-2", className)}
          >
            <BookTemplate className="h-4 w-4" />
            {selectedTemplate
              ? (selectedTemplate as any).name || (selectedTemplate as any).title
              : placeholder}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select {type.charAt(0).toUpperCase() + type.slice(1)} Template</DialogTitle>
          <DialogDescription>
            Choose a template to apply or use as a starting point.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 h-[500px]">
          {/* Left: Template list */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${type} templates...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b px-2">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="public" className="text-xs">
                  <Globe className="mr-1 h-3 w-3" />
                  Public
                </TabsTrigger>
                <TabsTrigger value="mine" className="text-xs">
                  <User className="mr-1 h-3 w-3" />
                  Mine
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No templates found</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredTemplates.map((template) => {
                      const name = (template as any).name || (template as any).title
                      const isPreview = previewTemplate?.id === template.id
                      const isSelected = selectedId === template.id

                      return (
                        <button
                          key={template.id}
                          onClick={() => setPreviewTemplate(template)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg transition-colors",
                            "hover:bg-accent",
                            isPreview && "bg-accent",
                            isSelected && "ring-2 ring-primary"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate">{name}</span>
                            {(template as any).is_public && (
                              <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary shrink-0 ml-auto" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right: Preview */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b bg-muted/50">
              <h4 className="font-medium text-sm">Preview</h4>
            </div>
            <ScrollArea className="flex-1 p-4">
              {previewTemplate ? (
                renderPreview()
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Select a template to preview</p>
                </div>
              )}
            </ScrollArea>
            {previewTemplate && (
              <div className="p-3 border-t flex gap-2 justify-end">
                {onApply && (
                  <Button variant="outline" onClick={handleApply}>
                    Apply Data
                  </Button>
                )}
                <Button onClick={() => handleSelect(previewTemplate)}>
                  <Check className="mr-1 h-4 w-4" />
                  Use Template
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Quick Template Apply Button
// ============================================================================

interface QuickTemplateApplyProps<T = any> {
  type: TemplateType
  onApply: (templateData: Partial<T>) => void
  className?: string
}

export function QuickTemplateApply<T>({
  type,
  onApply,
  className,
}: QuickTemplateApplyProps<T>) {
  return (
    <TemplateSelector
      type={type}
      variant="popover"
      onSelect={() => {}}
      onApply={onApply}
      trigger={
        <Button variant="ghost" size="sm" className={cn("gap-1", className)}>
          <BookTemplate className="h-4 w-4" />
          From Template
        </Button>
      }
    />
  )
}
