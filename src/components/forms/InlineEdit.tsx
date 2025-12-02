/**
 * Inline Edit Components
 *
 * Reusable components for inline editing of text, select values, and badges.
 * Supports keyboard navigation, escape to cancel, and optimistic updates.
 */

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, X, Pencil, Loader2 } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export interface InlineEditBaseProps {
  /** Whether editing is allowed */
  isEditable?: boolean
  /** Whether the edit is saving */
  isSaving?: boolean
  /** Callback when save completes */
  onSave: (value: any) => Promise<void> | void
  /** Callback when editing is cancelled */
  onCancel?: () => void
  /** Custom class name */
  className?: string
  /** Show edit icon on hover */
  showEditIcon?: boolean
  /** Placeholder when value is empty */
  placeholder?: string
}

// ============================================================================
// Inline Text Edit
// ============================================================================

export interface InlineTextEditProps extends InlineEditBaseProps {
  /** Current value */
  value: string
  /** Whether to use textarea instead of input */
  multiline?: boolean
  /** Number of rows for textarea */
  rows?: number
  /** Maximum length */
  maxLength?: number
  /** Input type for validation */
  type?: "text" | "email" | "url" | "number"
  /** Render custom display element */
  renderDisplay?: (value: string, onEdit: () => void) => React.ReactNode
}

export function InlineTextEdit({
  value,
  onSave,
  onCancel,
  isEditable = true,
  isSaving = false,
  className,
  showEditIcon = true,
  placeholder = "Click to edit",
  multiline = false,
  rows = 3,
  maxLength,
  type = "text",
  renderDisplay,
}: InlineTextEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)
  const [isLocalSaving, setIsLocalSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Sync with external value
  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value)
    }
  }, [value, isEditing])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (currentValue === value) {
      setIsEditing(false)
      return
    }

    try {
      setIsLocalSaving(true)
      await onSave(currentValue)
      setIsEditing(false)
    } catch {
      // Keep editing on error
    } finally {
      setIsLocalSaving(false)
    }
  }

  const handleCancel = () => {
    setCurrentValue(value)
    setIsEditing(false)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const saving = isSaving || isLocalSaving

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input

    return (
      <div className={cn("flex items-start gap-2", className)}>
        <InputComponent
          ref={inputRef as any}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Delay to allow button clicks
            setTimeout(() => {
              if (document.activeElement?.closest("[data-inline-edit-actions]")) {
                return
              }
              handleCancel()
            }, 150)
          }}
          disabled={saving}
          maxLength={maxLength}
          rows={multiline ? rows : undefined}
          type={multiline ? undefined : type}
          className={cn("flex-1", multiline && "resize-none")}
        />
        <div className="flex items-center gap-1" data-inline-edit-actions>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    )
  }

  // Display mode
  if (renderDisplay) {
    return renderDisplay(value, () => isEditable && setIsEditing(true))
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2",
        isEditable && "cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1 -mx-2 -my-1",
        className
      )}
      onClick={() => isEditable && setIsEditing(true)}
      role={isEditable ? "button" : undefined}
      tabIndex={isEditable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isEditable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          setIsEditing(true)
        }
      }}
    >
      <span className={cn(!value && "text-muted-foreground italic")}>
        {value || placeholder}
      </span>
      {showEditIcon && isEditable && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  )
}

// ============================================================================
// Inline Select Edit
// ============================================================================

export interface InlineSelectOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
}

export interface InlineSelectEditProps extends Omit<InlineEditBaseProps, "placeholder"> {
  /** Current value */
  value: string
  /** Available options */
  options: InlineSelectOption[]
  /** Render custom display for value */
  renderValue?: (value: string, option?: InlineSelectOption) => React.ReactNode
}

export function InlineSelectEdit({
  value,
  options,
  onSave,
  onCancel,
  isEditable = true,
  isSaving = false,
  className,
  showEditIcon = true,
  renderValue,
}: InlineSelectEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLocalSaving, setIsLocalSaving] = useState(false)

  const currentOption = options.find((o) => o.value === value)
  const saving = isSaving || isLocalSaving

  const handleChange = async (newValue: string) => {
    if (newValue === value) {
      setIsEditing(false)
      return
    }

    try {
      setIsLocalSaving(true)
      await onSave(newValue)
      setIsEditing(false)
    } catch {
      // Keep editing on error
    } finally {
      setIsLocalSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Select
          value={value}
          onValueChange={handleChange}
          disabled={saving}
          onOpenChange={(open) => {
            if (!open && !saving) {
              setIsEditing(false)
              onCancel?.()
            }
          }}
          defaultOpen
        >
          <SelectTrigger className="w-auto min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon && <option.icon className="h-4 w-4" />}
                  <span style={{ color: option.color }}>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
    )
  }

  // Display mode
  const displayContent = renderValue ? (
    renderValue(value, currentOption)
  ) : (
    <span className="flex items-center gap-2">
      {currentOption?.icon && <currentOption.icon className="h-4 w-4" />}
      <span style={{ color: currentOption?.color }}>{currentOption?.label || value}</span>
    </span>
  )

  return (
    <div
      className={cn(
        "group flex items-center gap-2",
        isEditable && "cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1 -mx-2 -my-1",
        className
      )}
      onClick={() => isEditable && setIsEditing(true)}
      role={isEditable ? "button" : undefined}
      tabIndex={isEditable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isEditable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          setIsEditing(true)
        }
      }}
    >
      {displayContent}
      {showEditIcon && isEditable && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  )
}

// ============================================================================
// Inline Badge Edit (for severity, status, etc.)
// ============================================================================

export interface InlineBadgeEditProps extends Omit<InlineEditBaseProps, "placeholder"> {
  /** Current value */
  value: string
  /** Available options */
  options: InlineSelectOption[]
  /** Get badge variant/color based on value */
  getBadgeClassName?: (value: string) => string
}

export function InlineBadgeEdit({
  value,
  options,
  onSave,
  onCancel,
  isEditable = true,
  isSaving = false,
  className,
  getBadgeClassName,
}: InlineBadgeEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLocalSaving, setIsLocalSaving] = useState(false)

  const currentOption = options.find((o) => o.value === value)
  const saving = isSaving || isLocalSaving

  const handleChange = async (newValue: string) => {
    if (newValue === value) {
      setIsEditing(false)
      return
    }

    try {
      setIsLocalSaving(true)
      await onSave(newValue)
      setIsEditing(false)
    } catch {
      // Keep editing on error
    } finally {
      setIsLocalSaving(false)
    }
  }

  if (isEditing) {
    return (
      <Select
        value={value}
        onValueChange={handleChange}
        disabled={saving}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setIsEditing(false)
            onCancel?.()
          }
        }}
        defaultOpen
      >
        <SelectTrigger className={cn("w-auto border-none p-0 h-auto", className)}>
          <Badge className={cn(getBadgeClassName?.(value))}>
            {saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {currentOption?.label || value}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <Badge className={cn(getBadgeClassName?.(option.value))}>{option.label}</Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Badge
      className={cn(
        getBadgeClassName?.(value),
        isEditable && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={() => isEditable && setIsEditing(true)}
      role={isEditable ? "button" : undefined}
      tabIndex={isEditable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isEditable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          setIsEditing(true)
        }
      }}
    >
      {currentOption?.icon && <currentOption.icon className="mr-1 h-3 w-3" />}
      {currentOption?.label || value}
    </Badge>
  )
}

// ============================================================================
// Inline Number Edit
// ============================================================================

export interface InlineNumberEditProps extends Omit<InlineEditBaseProps, "onSave"> {
  /** Current value */
  value: number
  /** Save handler */
  onSave: (value: number) => Promise<void> | void
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step value */
  step?: number
  /** Format function for display */
  format?: (value: number) => string
}

export function InlineNumberEdit({
  value,
  onSave,
  onCancel,
  isEditable = true,
  isSaving = false,
  className,
  showEditIcon = true,
  placeholder = "0",
  min,
  max,
  step = 1,
  format,
}: InlineNumberEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value.toString())
  const [isLocalSaving, setIsLocalSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value.toString())
    }
  }, [value, isEditing])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    const numValue = parseFloat(currentValue)
    if (isNaN(numValue) || numValue === value) {
      setIsEditing(false)
      setCurrentValue(value.toString())
      return
    }

    // Validate bounds
    let finalValue = numValue
    if (min !== undefined) finalValue = Math.max(min, finalValue)
    if (max !== undefined) finalValue = Math.min(max, finalValue)

    try {
      setIsLocalSaving(true)
      await onSave(finalValue)
      setIsEditing(false)
    } catch {
      // Keep editing on error
    } finally {
      setIsLocalSaving(false)
    }
  }

  const handleCancel = () => {
    setCurrentValue(value.toString())
    setIsEditing(false)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const saving = isSaving || isLocalSaving

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          ref={inputRef}
          type="number"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(handleCancel, 150)}
          disabled={saving}
          min={min}
          max={max}
          step={step}
          className="w-24"
        />
        <div className="flex items-center gap-1" data-inline-edit-actions>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    )
  }

  const displayValue = format ? format(value) : value.toString()

  return (
    <div
      className={cn(
        "group flex items-center gap-2",
        isEditable && "cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1 -mx-2 -my-1",
        className
      )}
      onClick={() => isEditable && setIsEditing(true)}
      role={isEditable ? "button" : undefined}
      tabIndex={isEditable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isEditable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          setIsEditing(true)
        }
      }}
    >
      <span>{displayValue || placeholder}</span>
      {showEditIcon && isEditable && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  )
}
