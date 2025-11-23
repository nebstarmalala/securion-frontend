/**
 * Onboarding Checklist Component
 * Guides new users through initial setup steps
 */

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Sparkles,
  FolderPlus,
  Target,
  Users,
  Settings,
  FileText,
  Rocket,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/contexts/auth-context"
import { cn } from "@/lib/utils"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href?: string
  action?: string
  checkComplete: () => boolean
}

const STORAGE_KEY = "securion_onboarding_dismissed"

export function OnboardingChecklist() {
  const { user, hasPermission } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Check if onboarding was dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY)
    if (wasDismissed === "true") {
      setDismissed(true)
    }
  }, [])

  // Define onboarding steps based on user role
  const steps: OnboardingStep[] = [
    {
      id: "profile",
      title: "Complete your profile",
      description: "Add your details and preferences",
      icon: <Settings className="h-4 w-4" />,
      href: "/settings",
      checkComplete: () => !!user?.email && !!user?.username,
    },
    {
      id: "first-project",
      title: "Create your first project",
      description: "Start a new pentest engagement",
      icon: <FolderPlus className="h-4 w-4" />,
      href: "/projects",
      action: "new",
      checkComplete: () => completedSteps.includes("first-project"),
    },
    {
      id: "add-scope",
      title: "Define testing scope",
      description: "Add targets to your project",
      icon: <Target className="h-4 w-4" />,
      checkComplete: () => completedSteps.includes("add-scope"),
    },
    {
      id: "invite-team",
      title: "Invite team members",
      description: "Collaborate with your team",
      icon: <Users className="h-4 w-4" />,
      href: "/users",
      checkComplete: () => !hasPermission("user-invite") || completedSteps.includes("invite-team"),
    },
    {
      id: "explore-reports",
      title: "Explore reports",
      description: "Learn about report generation",
      icon: <FileText className="h-4 w-4" />,
      href: "/reports",
      checkComplete: () => completedSteps.includes("explore-reports"),
    },
  ]

  // Calculate progress
  const completedCount = steps.filter(s => s.checkComplete()).length
  const progressPercent = (completedCount / steps.length) * 100

  // Handle dismissal
  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, "true")
  }

  // Mark a step as complete
  const markComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  // Don't show if dismissed or all complete
  if (dismissed || progressPercent === 100) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Welcome to Securion!</CardTitle>
              <CardDescription>Let's get you started</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Setup progress</span>
            <span className="font-medium">{completedCount} of {steps.length} complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Steps list */}
        <div className="space-y-2">
          {steps.map((step) => {
            const isComplete = step.checkComplete()
            return (
              <OnboardingStepItem
                key={step.id}
                step={step}
                isComplete={isComplete}
                onComplete={() => markComplete(step.id)}
              />
            )
          })}
        </div>

        {/* Skip button */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface OnboardingStepItemProps {
  step: OnboardingStep
  isComplete: boolean
  onComplete: () => void
}

function OnboardingStepItem({ step, isComplete, onComplete }: OnboardingStepItemProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-3 transition-colors",
        isComplete
          ? "bg-green-500/10"
          : "hover:bg-accent cursor-pointer"
      )}
      onClick={() => !isComplete && onComplete()}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          isComplete
            ? "bg-green-500 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          step.icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            isComplete && "text-muted-foreground line-through"
          )}
        >
          {step.title}
        </p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
      </div>
      {!isComplete && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  )

  if (step.href && !isComplete) {
    return <Link to={step.href}>{content}</Link>
  }

  return content
}

/**
 * Compact onboarding progress indicator
 */
export function OnboardingProgress() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY)
    if (wasDismissed === "true") {
      setDismissed(true)
    }
  }, [])

  if (dismissed) {
    return null
  }

  return (
    <Link to="/">
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm hover:bg-primary/10 transition-colors">
        <Rocket className="h-4 w-4 text-primary" />
        <span>Continue setup</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  )
}
