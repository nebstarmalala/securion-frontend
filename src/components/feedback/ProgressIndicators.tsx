import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  variant?: "default" | "compact";
  className?: string;
}

export function StepProgress({
  steps,
  currentStep,
  completedSteps = [],
  variant = "default",
  className,
}: StepProgressProps) {
  const isCompact = variant === "compact";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all",
                    isCompact ? "w-8 h-8" : "w-10 h-10",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
                  ) : isCurrent ? (
                    <Loader2 className={cn("animate-spin", isCompact ? "w-4 h-4" : "w-5 h-5")} />
                  ) : (
                    <Circle className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
                  )}
                </div>
                {!isCompact && (
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        (isCompleted || isCurrent) && "text-foreground",
                        isUpcoming && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-all",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {isCompact && (
        <div className="mt-3 text-center">
          <p className="text-sm font-medium">{steps[currentStep]?.label}</p>
          {steps[currentStep]?.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {steps[currentStep].description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-500"
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <p className="text-sm font-medium text-center">{label}</p>
      )}
    </div>
  );
}

interface LinearProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LinearProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = "default",
  size = "md",
  className,
}: LinearProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colors = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", heights[size])}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            colors[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  onCancel?: () => void;
  className?: string;
}

export function UploadProgress({
  fileName,
  progress,
  status,
  onCancel,
  className,
}: UploadProgressProps) {
  const statusLabels = {
    uploading: "Uploading...",
    processing: "Processing...",
    completed: "Completed",
    error: "Failed",
  };

  const statusColors = {
    uploading: "default" as const,
    processing: "warning" as const,
    completed: "success" as const,
    error: "error" as const,
  };

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">{statusLabels[status]}</p>
        </div>
        {onCancel && status === "uploading" && (
          <button
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground ml-2"
          >
            Cancel
          </button>
        )}
      </div>
      <LinearProgress
        value={progress}
        showPercentage={false}
        variant={statusColors[status]}
      />
    </div>
  );
}

interface ProcessStepProps {
  steps: Array<{
    label: string;
    status: "pending" | "processing" | "completed" | "error";
    error?: string;
  }>;
  className?: string;
}

export function ProcessSteps({ steps, className }: ProcessStepProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {step.status === "completed" && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {step.status === "processing" && (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
            {step.status === "error" && (
              <Circle className="w-5 h-5 text-red-500" />
            )}
            {step.status === "pending" && (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "completed" && "text-green-600 dark:text-green-400",
                step.status === "processing" && "text-foreground",
                step.status === "error" && "text-red-600 dark:text-red-400",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            {step.error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {step.error}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
