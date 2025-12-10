import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  AlertCircle,
  Pause,
  Play,
  Zap,
  Shield,
  AlertTriangle,
} from "lucide-react";

export type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantConfig: Record<
  StatusVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    defaultLabel: string;
  }
> = {
  default: {
    icon: Circle,
    className: "bg-muted text-muted-foreground",
    defaultLabel: "Default",
  },
  success: {
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    defaultLabel: "Success",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    defaultLabel: "Warning",
  },
  error: {
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    defaultLabel: "Error",
  },
  info: {
    icon: AlertCircle,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    defaultLabel: "Info",
  },
  pending: {
    icon: Clock,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    defaultLabel: "Pending",
  },
  "in-progress": {
    icon: Play,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    defaultLabel: "In Progress",
  },
  completed: {
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    defaultLabel: "Completed",
  },
  cancelled: {
    icon: XCircle,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    defaultLabel: "Cancelled",
  },
};

const sizeConfig = {
  sm: {
    badge: "h-5 text-xs px-2",
    icon: "h-3 w-3",
  },
  md: {
    badge: "h-6 text-sm px-2.5",
    icon: "h-3.5 w-3.5",
  },
  lg: {
    badge: "h-7 text-base px-3",
    icon: "h-4 w-4",
  },
};

export function StatusBadge({
  variant,
  label,
  showIcon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;
  const sizeClasses = sizeConfig[size];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        config.className,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{displayLabel}</span>
    </Badge>
  );
}

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const severityConfig: Record<
  SeverityLevel,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    label: string;
  }
> = {
  critical: {
    icon: AlertCircle,
    className: "bg-red-600 text-white border-red-700 dark:bg-red-700 dark:border-red-800",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    label: "High",
  },
  medium: {
    icon: AlertCircle,
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    label: "Medium",
  },
  low: {
    icon: Circle,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    label: "Low",
  },
  info: {
    icon: AlertCircle,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    label: "Info",
  },
};

export function SeverityBadge({
  severity,
  showIcon = true,
  size = "md",
  className,
}: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;
  const sizeClasses = sizeConfig[size];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        config.className,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "urgent";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const priorityConfig = {
  low: {
    icon: Circle,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    label: "Low",
  },
  medium: {
    icon: Circle,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    label: "Medium",
  },
  high: {
    icon: AlertTriangle,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    label: "High",
  },
  urgent: {
    icon: Zap,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    label: "Urgent",
  },
};

export function PriorityBadge({
  priority,
  showIcon = true,
  size = "md",
  className,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  const sizeClasses = sizeConfig[size];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        config.className,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </Badge>
  );
}

interface ProjectStatusBadgeProps {
  status: "active" | "on-hold" | "completed" | "cancelled";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const projectStatusConfig = {
  active: {
    icon: Play,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    label: "Active",
  },
  "on-hold": {
    icon: Pause,
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    label: "On Hold",
  },
  completed: {
    icon: CheckCircle2,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    label: "Completed",
  },
  cancelled: {
    icon: XCircle,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    label: "Cancelled",
  },
};

export function ProjectStatusBadge({
  status,
  showIcon = true,
  size = "md",
  className,
}: ProjectStatusBadgeProps) {
  const config = projectStatusConfig[status];
  const Icon = config.icon;
  const sizeClasses = sizeConfig[size];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        config.className,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </Badge>
  );
}

interface FindingStatusBadgeProps {
  status: "open" | "in-review" | "accepted" | "fixed" | "risk-accepted" | "false-positive";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const findingStatusConfig = {
  open: {
    icon: Circle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    label: "Open",
  },
  "in-review": {
    icon: Clock,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    label: "In Review",
  },
  accepted: {
    icon: CheckCircle2,
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    label: "Accepted",
  },
  fixed: {
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    label: "Fixed",
  },
  "risk-accepted": {
    icon: Shield,
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    label: "Risk Accepted",
  },
  "false-positive": {
    icon: XCircle,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    label: "False Positive",
  },
};

export function FindingStatusBadge({
  status,
  showIcon = true,
  size = "md",
  className,
}: FindingStatusBadgeProps) {
  const config = findingStatusConfig[status];
  const Icon = config.icon;
  const sizeClasses = sizeConfig[size];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        config.className,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </Badge>
  );
}

interface CVEStatusBadgeProps {
  status: "unpatched" | "patched" | "mitigated" | "not-applicable";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const cveStatusConfig = {
  unpatched: {
    icon: AlertCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    label: "Unpatched",
  },
  patched: {
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    label: "Patched",
  },
  mitigated: {
    icon: Shield,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    label: "Mitigated",
  },
  "not-applicable": {
    icon: XCircle,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    label: "Not Applicable",
  },
};

export function CVEStatusBadge({
  status,
  showIcon = true,
  size = "md",
  className,
}: CVEStatusBadgeProps) {
  const config = cveStatusConfig[status];
  const Icon = config.icon;
  const sizeClasses = sizeConfig[size];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        config.className,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </Badge>
  );
}
