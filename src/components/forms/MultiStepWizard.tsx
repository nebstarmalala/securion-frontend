/**
 * Multi-Step Wizard Component
 *
 * A reusable wizard component for complex, multi-step forms.
 * Supports step validation, persistence, and navigation controls.
 */

import React, { useState, useCallback, createContext, useContext, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Circle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export interface WizardStep<TData = Record<string, any>> {
  /** Unique step identifier */
  id: string
  /** Step title shown in header */
  title: string
  /** Optional step description */
  description?: string
  /** Icon component for the step indicator */
  icon?: React.ComponentType<{ className?: string }>
  /** Step content component */
  component: React.ComponentType<WizardStepProps<TData>>
  /** Validation function - returns error messages by field */
  validate?: (data: TData) => Record<string, string>
  /** Whether this step is optional (can be skipped) */
  optional?: boolean
  /** Custom next button text */
  nextLabel?: string
  /** Custom back button text */
  backLabel?: string
}

export interface WizardStepProps<TData = Record<string, any>> {
  /** Current wizard data */
  data: TData
  /** Update wizard data */
  updateData: (updates: Partial<TData>) => void
  /** Validation errors for current step */
  errors: Record<string, string>
  /** Clear specific error */
  clearError: (field: string) => void
  /** Clear all errors */
  clearAllErrors: () => void
  /** Whether the wizard is submitting */
  isSubmitting: boolean
  /** Go to next step programmatically */
  goToNext: () => void
  /** Go to previous step programmatically */
  goToPrevious: () => void
  /** Go to specific step */
  goToStep: (stepId: string) => void
}

export interface MultiStepWizardProps<TData = Record<string, any>> {
  /** Array of wizard steps */
  steps: WizardStep<TData>[]
  /** Initial wizard data */
  initialData?: TData
  /** Called when wizard completes successfully */
  onComplete: (finalData: TData) => Promise<void>
  /** Called when wizard is cancelled */
  onCancel?: () => void
  /** Dialog open state (controlled) */
  open?: boolean
  /** Dialog open change handler */
  onOpenChange?: (open: boolean) => void
  /** Trigger element for uncontrolled mode */
  trigger?: React.ReactNode
  /** Wizard title */
  title: string
  /** Wizard description */
  description?: string
  /** Storage key for persistence (optional) */
  persistKey?: string
  /** Custom class name for dialog content */
  className?: string
  /** Show step indicator */
  showStepIndicator?: boolean
  /** Allow clicking on step indicators to navigate */
  allowStepNavigation?: boolean
  /** Custom submit button text */
  submitLabel?: string
  /** Custom cancel button text */
  cancelLabel?: string
}

// ============================================================================
// Wizard Context
// ============================================================================

interface WizardContextValue<TData = Record<string, any>> {
  data: TData
  updateData: (updates: Partial<TData>) => void
  errors: Record<string, string>
  clearError: (field: string) => void
  clearAllErrors: () => void
  currentStepIndex: number
  currentStep: WizardStep<TData>
  steps: WizardStep<TData>[]
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
  goToNext: () => void
  goToPrevious: () => void
  goToStep: (stepId: string) => void
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function useWizard<TData = Record<string, any>>(): WizardContextValue<TData> {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard must be used within a MultiStepWizard")
  }
  return context as WizardContextValue<TData>
}

// ============================================================================
// Step Indicator Component
// ============================================================================

interface StepIndicatorProps<TData = Record<string, any>> {
  steps: WizardStep<TData>[]
  currentIndex: number
  completedSteps: Set<string>
  allowNavigation: boolean
  onNavigate: (index: number) => void
}

function StepIndicator<TData>({
  steps,
  currentIndex,
  completedSteps,
  allowNavigation,
  onNavigate,
}: StepIndicatorProps<TData>) {
  return (
    <div className="mb-6">
      {/* Desktop: Horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id)
          const isCurrent = index === currentIndex
          const isPast = index < currentIndex
          const Icon = step.icon

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => allowNavigation && (isPast || isCompleted) && onNavigate(index)}
                disabled={!allowNavigation || (!isPast && !isCompleted)}
                className={cn(
                  "flex items-center gap-2 group",
                  allowNavigation && (isPast || isCompleted) && "cursor-pointer"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    isCompleted && !isCurrent && "border-primary bg-primary/10 text-primary",
                    !isCurrent && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : Icon ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-foreground",
                      !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.optional && (
                    <span className="text-xs text-muted-foreground">Optional</span>
                  )}
                </div>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    completedSteps.has(step.id) ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Mobile: Compact progress */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{steps[currentIndex].title}</span>
          <span className="text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </span>
        </div>
        <Progress value={((currentIndex + 1) / steps.length) * 100} className="h-2" />
      </div>
    </div>
  )
}

// ============================================================================
// Multi-Step Wizard Component
// ============================================================================

export function MultiStepWizard<TData extends Record<string, any>>({
  steps,
  initialData,
  onComplete,
  onCancel,
  open: controlledOpen,
  onOpenChange,
  trigger,
  title,
  description,
  persistKey,
  className,
  showStepIndicator = true,
  allowStepNavigation = true,
  submitLabel = "Complete",
  cancelLabel = "Cancel",
}: MultiStepWizardProps<TData>) {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [data, setData] = useState<TData>(() => {
    // Try to restore from session storage
    if (persistKey) {
      try {
        const stored = sessionStorage.getItem(`wizard_${persistKey}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          return { ...initialData, ...parsed.data } as TData
        }
      } catch {
        // Ignore parsing errors
      }
    }
    return (initialData || {}) as TData
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  // -------------------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (persistKey && open) {
      try {
        sessionStorage.setItem(
          `wizard_${persistKey}`,
          JSON.stringify({
            data,
            currentStepIndex,
            completedSteps: Array.from(completedSteps),
          })
        )
      } catch {
        // Ignore storage errors
      }
    }
  }, [data, currentStepIndex, completedSteps, persistKey, open])

  // Restore step index on open
  useEffect(() => {
    if (persistKey && open) {
      try {
        const stored = sessionStorage.getItem(`wizard_${persistKey}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.currentStepIndex !== undefined) {
            setCurrentStepIndex(parsed.currentStepIndex)
          }
          if (parsed.completedSteps) {
            setCompletedSteps(new Set(parsed.completedSteps))
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, [persistKey, open])

  // Clear persistence on close
  const clearPersistence = useCallback(() => {
    if (persistKey) {
      sessionStorage.removeItem(`wizard_${persistKey}`)
    }
  }, [persistKey])

  // -------------------------------------------------------------------------
  // Data Management
  // -------------------------------------------------------------------------
  const updateData = useCallback((updates: Partial<TData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  const validateCurrentStep = useCallback((): boolean => {
    if (!currentStep.validate) {
      return true
    }

    const stepErrors = currentStep.validate(data)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return false
    }

    setErrors({})
    return true
  }, [currentStep, data])

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const goToNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return
    }

    setCompletedSteps((prev) => new Set([...prev, currentStep.id]))

    if (isLastStep) {
      // Submit
      handleSubmit()
    } else {
      setCurrentStepIndex((prev) => prev + 1)
      setErrors({})
    }
  }, [validateCurrentStep, currentStep, isLastStep])

  const goToPrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1)
      setErrors({})
    }
  }, [isFirstStep])

  const goToStep = useCallback(
    (stepId: string) => {
      const targetIndex = steps.findIndex((s) => s.id === stepId)
      if (targetIndex !== -1 && targetIndex <= currentStepIndex) {
        setCurrentStepIndex(targetIndex)
        setErrors({})
      }
    },
    [steps, currentStepIndex]
  )

  const handleNavigate = useCallback(
    (index: number) => {
      if (index < currentStepIndex || completedSteps.has(steps[index].id)) {
        setCurrentStepIndex(index)
        setErrors({})
      }
    },
    [currentStepIndex, completedSteps, steps]
  )

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return
    }

    try {
      setIsSubmitting(true)
      await onComplete(data)
      clearPersistence()
      setOpen(false)
      // Reset wizard state
      setCurrentStepIndex(0)
      setData((initialData || {}) as TData)
      setCompletedSteps(new Set())
    } catch (error) {
      // Error handling is expected to be done in onComplete
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Cancel
  // -------------------------------------------------------------------------
  const handleCancel = () => {
    // Don't clear persistence on cancel - user might want to resume
    setOpen(false)
    onCancel?.()
  }

  // -------------------------------------------------------------------------
  // Reset when dialog closes
  // -------------------------------------------------------------------------
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !persistKey) {
      // Reset if not persisting
      setCurrentStepIndex(0)
      setData((initialData || {}) as TData)
      setErrors({})
      setCompletedSteps(new Set())
    }
    setOpen(newOpen)
  }

  // -------------------------------------------------------------------------
  // Render Step Content
  // -------------------------------------------------------------------------
  const StepComponent = currentStep.component

  const contextValue: WizardContextValue<TData> = {
    data,
    updateData,
    errors,
    clearError,
    clearAllErrors,
    currentStepIndex,
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    isSubmitting,
    goToNext,
    goToPrevious,
    goToStep,
  }

  return (
    <WizardContext.Provider value={contextValue as WizardContextValue}>
      {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn("max-w-3xl max-h-[90vh] overflow-y-auto", className)}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          {showStepIndicator && (
            <StepIndicator
              steps={steps}
              currentIndex={currentStepIndex}
              completedSteps={completedSteps}
              allowNavigation={allowStepNavigation}
              onNavigate={handleNavigate}
            />
          )}

          <div className="min-h-[300px] py-4">
            <StepComponent
              data={data}
              updateData={updateData}
              errors={errors}
              clearError={clearError}
              clearAllErrors={clearAllErrors}
              isSubmitting={isSubmitting}
              goToNext={goToNext}
              goToPrevious={goToPrevious}
              goToStep={goToStep}
            />
          </div>

          {/* Footer with navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              {cancelLabel}
            </Button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goToPrevious}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {currentStep.backLabel || "Back"}
                </Button>
              )}

              {currentStep.optional && !isLastStep && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setCompletedSteps((prev) => new Set([...prev, currentStep.id]))
                    setCurrentStepIndex((prev) => prev + 1)
                    setErrors({})
                  }}
                  disabled={isSubmitting}
                >
                  Skip
                </Button>
              )}

              <Button type="button" onClick={goToNext} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLastStep ? (
                  <>
                    {!isSubmitting && <Check className="mr-1 h-4 w-4" />}
                    {currentStep.nextLabel || submitLabel}
                  </>
                ) : (
                  <>
                    {currentStep.nextLabel || "Next"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </WizardContext.Provider>
  )
}

// ============================================================================
// Utility: Create Wizard Step
// ============================================================================

export function createWizardStep<TData = Record<string, any>>(
  config: WizardStep<TData>
): WizardStep<TData> {
  return config
}
