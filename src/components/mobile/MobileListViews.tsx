import { cn } from "@/lib/utils";
import { ChevronRight, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  badges?: React.ReactNode;
  avatar?: {
    src?: string;
    fallback: string;
  };
  href?: string;
  onClick?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive";
  }>;
  metadata?: Array<{
    label: string;
    value: string | number;
  }>;
  className?: string;
}

export function MobileListItem({
  title,
  subtitle,
  description,
  badges,
  avatar,
  href,
  onClick,
  actions,
  metadata,
  className,
}: MobileListItemProps) {
  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-4 bg-card border rounded-lg active:bg-muted transition-colors",
        (href || onClick) && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {avatar && (
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={avatar.src} />
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    className={
                      action.variant === "destructive"
                        ? "text-destructive"
                        : undefined
                    }
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {badges && <div className="flex flex-wrap gap-1.5">{badges}</div>}

        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="font-medium">{item.label}:</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(href || onClick) && (
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 self-center" />
      )}
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCard({ children, className }: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-4 space-y-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function MobileCardHeader({
  title,
  subtitle,
  action,
}: MobileCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface MobileCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardContent({
  children,
  className,
}: MobileCardContentProps) {
  return <div className={cn("text-sm", className)}>{children}</div>;
}

interface MobileCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardFooter({
  children,
  className,
}: MobileCardFooterProps) {
  return (
    <div className={cn("flex items-center gap-2 pt-2 border-t", className)}>
      {children}
    </div>
  );
}

interface MobileGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function MobileGrid({
  children,
  columns = 1,
  gap = "md",
  className,
}: MobileGridProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div
      className={cn(
        "grid",
        columns === 2 && "grid-cols-2",
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function MobileStatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: MobileStatCardProps) {
  const variantClasses = {
    default: "bg-card",
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.direction === "up" && trend.value > 0
                ? "text-green-600 dark:text-green-400"
                : trend.direction === "down" && trend.value < 0
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground"
            )}
          >
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface MobileSectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function MobileSection({
  title,
  action,
  children,
  className,
}: MobileSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

interface MobileListProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileList({ children, className }: MobileListProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

interface MobileEmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function MobileEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: MobileEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/50 mb-3" />}
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  className?: string;
}

export function MobileSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onFocus,
  className,
}: MobileSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="w-full h-10 px-4 pr-10 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}

interface MobileFilterChipsProps {
  filters: Array<{
    label: string;
    active: boolean;
    onClick: () => void;
  }>;
  className?: string;
}

export function MobileFilterChips({ filters, className }: MobileFilterChipsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 -mx-4 px-4", className)}>
      {filters.map((filter, index) => (
        <button
          key={index}
          onClick={filter.onClick}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
            filter.active
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:bg-muted"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
