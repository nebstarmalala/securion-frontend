import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const requirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "Contains number", test: (p: string) => /[0-9]/.test(p) },
    { label: "Contains special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ]

  const passedCount = requirements.filter(req => req.test(password)).length
  const strength = passedCount === 0 ? 0 : passedCount <= 2 ? 1 : passedCount <= 3 ? 2 : passedCount <= 4 ? 3 : 4

  const strengthColors = ["bg-gray-200", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                level <= strength ? strengthColors[strength] : "bg-muted"
              )}
            />
          ))}
        </div>
        {password && (
          <p className="text-xs font-medium text-muted-foreground">
            Password strength: <span className={cn(
              "font-bold",
              strength === 1 && "text-red-500",
              strength === 2 && "text-orange-500",
              strength === 3 && "text-yellow-500",
              strength === 4 && "text-green-500"
            )}>{strengthLabels[strength]}</span>
          </p>
        )}
      </div>

      {/* Requirements List */}
      {password && (
        <div className="space-y-1.5">
          {requirements.map((req, index) => {
            const passed = req.test(password)
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  passed ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                )}
              >
                {passed ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>{req.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
