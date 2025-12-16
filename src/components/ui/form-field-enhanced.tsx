import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  helpText?: string
  tooltip?: string
  maxLength?: number
  required?: boolean
  validate?: (value: string) => boolean | string
  className?: string
}

export function FormFieldEnhanced({
  name,
  label,
  type = "text",
  placeholder,
  helpText,
  tooltip,
  maxLength,
  required,
  validate,
  className,
}: FormFieldProps) {
  const {
    register,
    watch,
    formState: { errors, touchedFields },
  } = useFormContext()

  const value = watch(name)
  const error = errors[name]
  const touched = touchedFields[name]
  const hasValue = value && value.length > 0

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="flex items-center gap-2">
          {label}
          {required && <span className="text-destructive">*</span>}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        {maxLength && hasValue && (
          <span className={cn(
            "text-xs",
            value.length > maxLength ? "text-destructive" : "text-muted-foreground"
          )}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name, {
            required: required ? `${label} is required` : false,
            maxLength: maxLength ? {
              value: maxLength,
              message: `${label} must be ${maxLength} characters or less`
            } : undefined,
            validate,
          })}
          className={cn(
            "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            touched && !error && hasValue && "border-green-500 focus-visible:ring-green-500"
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        />

        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {error && <AlertCircle className="h-4 w-4 text-destructive" />}
          {touched && !error && hasValue && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>
      </div>

      {/* Help Text */}
      {helpText && !error && (
        <p id={`${name}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error.message as string}
        </p>
      )}
    </div>
  )
}
