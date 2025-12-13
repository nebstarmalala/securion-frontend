import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop";

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === "undefined") return "desktop";
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

export function useIsMobile() {
  const breakpoint = useBreakpoint();
  return breakpoint === "mobile";
}

export function useIsTablet() {
  const breakpoint = useBreakpoint();
  return breakpoint === "tablet";
}

export function useIsDesktop() {
  const breakpoint = useBreakpoint();
  return breakpoint === "desktop";
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "2xl",
  padding = true,
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        padding && "px-4 md:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const gridClasses = cn(
    "grid",
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    gapClasses[gap]
  );

  return <div className={cn(gridClasses, className)}>{children}</div>;
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    mobile?: "horizontal" | "vertical";
    tablet?: "horizontal" | "vertical";
    desktop?: "horizontal" | "vertical";
  };
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end";
}

export function ResponsiveStack({
  children,
  className,
  direction = { mobile: "vertical", tablet: "horizontal", desktop: "horizontal" },
  gap = "md",
  align = "start",
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };

  return (
    <div
      className={cn(
        "flex",
        direction.mobile === "vertical" ? "flex-col" : "flex-row",
        direction.tablet === "vertical" ? "md:flex-col" : "md:flex-row",
        direction.desktop === "vertical" ? "lg:flex-col" : "lg:flex-row",
        gapClasses[gap],
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveShowProps {
  on?: Breakpoint[];
  children: React.ReactNode;
}

export function ResponsiveShow({ on = ["mobile"], children }: ResponsiveShowProps) {
  const breakpoint = useBreakpoint();
  const shouldShow = on.includes(breakpoint);

  if (!shouldShow) return null;

  return <>{children}</>;
}

interface ResponsiveHideProps {
  on?: Breakpoint[];
  children: React.ReactNode;
}

export function ResponsiveHide({ on = ["mobile"], children }: ResponsiveHideProps) {
  const breakpoint = useBreakpoint();
  const shouldHide = on.includes(breakpoint);

  if (shouldHide) return null;

  return <>{children}</>;
}

interface TabletLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarWidth?: "sm" | "md" | "lg";
  sidebarPosition?: "left" | "right";
  className?: string;
}

export function TabletLayout({
  children,
  sidebar,
  sidebarWidth = "md",
  sidebarPosition = "left",
  className,
}: TabletLayoutProps) {
  const widthClasses = {
    sm: "md:w-64",
    md: "md:w-80",
    lg: "md:w-96",
  };

  return (
    <div className={cn("flex flex-col md:flex-row gap-4 md:gap-6", className)}>
      {sidebar && sidebarPosition === "left" && (
        <aside className={cn("flex-shrink-0", widthClasses[sidebarWidth])}>
          {sidebar}
        </aside>
      )}

      <main className="flex-1 min-w-0">{children}</main>

      {sidebar && sidebarPosition === "right" && (
        <aside className={cn("flex-shrink-0", widthClasses[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
    </div>
  );
}

interface SplitViewProps {
  list: React.ReactNode;
  detail?: React.ReactNode;
  emptyDetail?: React.ReactNode;
  className?: string;
}

export function SplitView({
  list,
  detail,
  emptyDetail,
  className,
}: SplitViewProps) {
  const isTabletOrDesktop = !useIsMobile();
  const [selectedItem, setSelectedItem] = useState<boolean>(!!detail);

  useEffect(() => {
    setSelectedItem(!!detail);
  }, [detail]);

  if (!isTabletOrDesktop) {
    // Mobile: Show either list or detail
    if (selectedItem && detail) {
      return <>{detail}</>;
    }
    return <>{list}</>;
  }

  // Tablet/Desktop: Show split view
  return (
    <div className={cn("grid md:grid-cols-[400px_1fr] lg:grid-cols-[450px_1fr] gap-4 h-full", className)}>
      <div className="border-r overflow-y-auto">{list}</div>
      <div className="overflow-y-auto">
        {detail || emptyDetail || (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <p className="text-lg font-medium text-muted-foreground">
                Select an item to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  fullScreenMobile?: boolean;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  footer,
  fullScreenMobile = false,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile && fullScreenMobile) {
    return (
      <>
        {trigger}
        {open && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="flex flex-col h-full">
              <header className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-4">{children}</div>
              {footer && <footer className="border-t p-4">{footer}</footer>}
            </div>
          </div>
        )}
      </>
    );
  }

  // Use regular dialog for desktop
  return (
    <>
      {trigger}
      {/* You would use your actual Dialog component here */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="relative bg-background border rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
            <header className="p-6 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </header>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            {footer && <footer className="border-t p-6">{footer}</footer>}
          </div>
        </div>
      )}
    </>
  );
}

interface AdaptiveSpacingProps {
  children: React.ReactNode;
  className?: string;
}

export function AdaptiveSpacing({ children, className }: AdaptiveSpacingProps) {
  return (
    <div className={cn("space-y-4 md:space-y-6 lg:space-y-8", className)}>
      {children}
    </div>
  );
}

interface TabletOptimizedTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
}

export function TabletOptimizedTable({
  headers,
  rows,
  className,
}: TabletOptimizedTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile: Card-based layout
    return (
      <div className={cn("space-y-3", className)}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="border rounded-lg p-4 space-y-2">
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {headers[cellIndex]}
                </span>
                <span className="text-sm">{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Tablet/Desktop: Traditional table
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {headers.map((header, index) => (
              <th
                key={index}
                className="text-left p-3 text-sm font-medium text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-muted/50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
