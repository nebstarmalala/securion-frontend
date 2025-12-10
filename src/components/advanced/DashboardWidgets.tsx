import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  X,
  Settings,
  Plus,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface Widget {
  id: string;
  type: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  defaultSize: WidgetSize;
  config?: Record<string, any>;
  refreshInterval?: number;
}

export type WidgetSize = "small" | "medium" | "large" | "full";

interface DashboardWidget extends Widget {
  position: number;
  size: WidgetSize;
  visible: boolean;
  expanded: boolean;
}

interface WidgetContainerProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
  onResize: (id: string, size: WidgetSize) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onToggleExpand: (id: string) => void;
  onConfigure?: (id: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function WidgetContainer({
  widget,
  onRemove,
  onResize,
  onMove,
  onToggleExpand,
  onConfigure,
  canMoveUp,
  canMoveDown,
}: WidgetContainerProps) {
  const Component = widget.component;

  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-2",
    large: "col-span-3",
    full: "col-span-full",
  };

  return (
    <Card className={cn(sizeClasses[widget.size], widget.expanded && "row-span-2")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="cursor-move">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
            {widget.description && (
              <CardDescription className="text-xs">{widget.description}</CardDescription>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleExpand(widget.id)}
            title={widget.expanded ? "Collapse" : "Expand"}
          >
            {widget.expanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
          {onConfigure && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onConfigure(widget.id)}
              title="Configure"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRemove(widget.id)}
            title="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Component config={widget.config} />
      </CardContent>
    </Card>
  );
}

interface DashboardGridProps {
  widgets: DashboardWidget[];
  onUpdateWidgets: (widgets: DashboardWidget[]) => void;
  columns?: number;
  className?: string;
}

export function DashboardGrid({
  widgets,
  onUpdateWidgets,
  columns = 4,
  className,
}: DashboardGridProps) {
  const visibleWidgets = widgets.filter((w) => w.visible).sort((a, b) => a.position - b.position);

  const handleRemove = useCallback(
    (id: string) => {
      onUpdateWidgets(widgets.filter((w) => w.id !== id));
    },
    [widgets, onUpdateWidgets]
  );

  const handleResize = useCallback(
    (id: string, size: WidgetSize) => {
      onUpdateWidgets(
        widgets.map((w) => (w.id === id ? { ...w, size } : w))
      );
    },
    [widgets, onUpdateWidgets]
  );

  const handleMove = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = visibleWidgets.findIndex((w) => w.id === id);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === visibleWidgets.length - 1)
      ) {
        return;
      }

      const newWidgets = [...visibleWidgets];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newWidgets[index], newWidgets[targetIndex]] = [
        newWidgets[targetIndex],
        newWidgets[index],
      ];

      const updatedWidgets = newWidgets.map((w, i) => ({ ...w, position: i }));
      onUpdateWidgets(updatedWidgets);
    },
    [visibleWidgets, onUpdateWidgets]
  );

  const handleToggleExpand = useCallback(
    (id: string) => {
      onUpdateWidgets(
        widgets.map((w) => (w.id === id ? { ...w, expanded: !w.expanded } : w))
      );
    },
    [widgets, onUpdateWidgets]
  );

  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4",
        className
      )}
    >
      {visibleWidgets.map((widget, index) => (
        <WidgetContainer
          key={widget.id}
          widget={widget}
          onRemove={handleRemove}
          onResize={handleResize}
          onMove={handleMove}
          onToggleExpand={handleToggleExpand}
          canMoveUp={index > 0}
          canMoveDown={index < visibleWidgets.length - 1}
        />
      ))}
    </div>
  );
}

interface WidgetLibraryProps {
  availableWidgets: Widget[];
  currentWidgets: DashboardWidget[];
  onAddWidget: (widget: Widget) => void;
}

export function WidgetLibrary({
  availableWidgets,
  currentWidgets,
  onAddWidget,
}: WidgetLibraryProps) {
  const [open, setOpen] = useState(false);

  const handleAdd = (widget: Widget) => {
    onAddWidget(widget);
    setOpen(false);
  };

  const isAdded = (widgetId: string) =>
    currentWidgets.some((w) => w.type === widgetId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Widget Library</DialogTitle>
          <DialogDescription>
            Choose widgets to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {availableWidgets.map((widget) => (
            <Card
              key={widget.id}
              className={cn(
                "cursor-pointer hover:border-primary transition-colors",
                isAdded(widget.type) && "opacity-50"
              )}
              onClick={() => !isAdded(widget.type) && handleAdd(widget)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {widget.description}
                    </CardDescription>
                  </div>
                  {isAdded(widget.type) && (
                    <Badge variant="secondary" className="text-xs">
                      Added
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface WidgetManagerProps {
  widgets: DashboardWidget[];
  onUpdateWidgets: (widgets: DashboardWidget[]) => void;
}

export function WidgetManager({ widgets, onUpdateWidgets }: WidgetManagerProps) {
  const [open, setOpen] = useState(false);

  const handleToggleVisibility = (id: string) => {
    onUpdateWidgets(
      widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const handleRemove = (id: string) => {
    onUpdateWidgets(widgets.filter((w) => w.id !== id));
  };

  const handleResetLayout = () => {
    if (confirm("Reset dashboard to default layout?")) {
      onUpdateWidgets(
        widgets.map((w, i) => ({
          ...w,
          size: w.defaultSize,
          position: i,
          visible: true,
          expanded: false,
        }))
      );
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Manage Widgets
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Dashboard Widgets</DialogTitle>
          <DialogDescription>
            Show, hide, or remove widgets from your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleVisibility(widget.id)}
                >
                  {widget.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <div>
                  <p className="text-sm font-medium">{widget.title}</p>
                  <p className="text-xs text-muted-foreground">{widget.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemove(widget.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleResetLayout}>
            Reset Layout
          </Button>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const STORAGE_KEY = "dashboard-widgets";

export function useDashboardWidgets(availableWidgets: Widget[]) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DashboardWidget[];
        return parsed.map((w) => ({
          ...w,
          component:
            availableWidgets.find((aw) => aw.type === w.type)?.component ||
            (() => <div>Widget not found</div>),
        }));
      }
    } catch (error) {
      console.error("Failed to load widgets:", error);
    }

    return availableWidgets.map((w, i) => ({
      ...w,
      position: i,
      size: w.defaultSize,
      visible: true,
      expanded: false,
    }));
  });

  const saveWidgets = useCallback((newWidgets: DashboardWidget[]) => {
    const toSave = newWidgets.map(({ component, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setWidgets(newWidgets);
  }, []);

  const addWidget = useCallback(
    (widget: Widget) => {
      const newWidget: DashboardWidget = {
        ...widget,
        position: widgets.length,
        size: widget.defaultSize,
        visible: true,
        expanded: false,
      };
      saveWidgets([...widgets, newWidget]);
    },
    [widgets, saveWidgets]
  );

  const removeWidget = useCallback(
    (id: string) => {
      saveWidgets(widgets.filter((w) => w.id !== id));
    },
    [widgets, saveWidgets]
  );

  const updateWidget = useCallback(
    (id: string, updates: Partial<DashboardWidget>) => {
      saveWidgets(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    },
    [widgets, saveWidgets]
  );

  const resetWidgets = useCallback(() => {
    const defaultWidgets = availableWidgets.map((w, i) => ({
      ...w,
      position: i,
      size: w.defaultSize,
      visible: true,
      expanded: false,
    }));
    saveWidgets(defaultWidgets);
  }, [availableWidgets, saveWidgets]);

  return {
    widgets,
    setWidgets: saveWidgets,
    addWidget,
    removeWidget,
    updateWidget,
    resetWidgets,
  };
}
