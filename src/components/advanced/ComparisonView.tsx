import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Check, X, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComparisonField {
  label: string;
  key: string;
  render?: (value: any, item: any) => React.ReactNode;
  compare?: (a: any, b: any) => "same" | "different" | "improved" | "worsened";
}

interface ComparisonViewProps<T> {
  items: T[];
  fields: ComparisonField[];
  itemLabel?: (item: T) => string;
  className?: string;
}

export function ComparisonView<T extends Record<string, any>>({
  items,
  fields,
  itemLabel = (item) => item.title || item.name || "Item",
  className,
}: ComparisonViewProps<T>) {
  if (items.length < 2) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ArrowLeftRight className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Select at least 2 items to compare</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Comparing {items.length} Items
        </h2>
        <Badge variant="outline">
          {fields.length} fields
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 bg-muted font-medium text-sm sticky left-0 z-10">
                Field
              </th>
              {items.map((item, idx) => (
                <th
                  key={idx}
                  className="text-left p-3 bg-muted font-medium text-sm min-w-[250px]"
                >
                  {itemLabel(item)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => {
              const values = items.map((item) => item[field.key]);
              const allSame = values.every((v) => JSON.stringify(v) === JSON.stringify(values[0]));

              return (
                <tr key={field.key} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium text-sm bg-background sticky left-0">
                    {field.label}
                  </td>
                  {items.map((item, idx) => {
                    const value = item[field.key];
                    const renderedValue = field.render
                      ? field.render(value, item)
                      : String(value || "-");

                    let comparison: "same" | "different" | "improved" | "worsened" = "same";
                    if (field.compare && idx > 0) {
                      comparison = field.compare(items[idx - 1][field.key], value);
                    } else if (!allSame) {
                      comparison = "different";
                    }

                    return (
                      <td
                        key={idx}
                        className={cn(
                          "p-3 text-sm",
                          comparison === "different" && "bg-yellow-50 dark:bg-yellow-950/20",
                          comparison === "improved" && "bg-green-50 dark:bg-green-950/20",
                          comparison === "worsened" && "bg-red-50 dark:bg-red-950/20"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {comparison === "same" && allSame && (
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          {comparison === "different" && !allSame && (
                            <Minus className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          )}
                          {comparison === "improved" && (
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          {comparison === "worsened" && (
                            <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">{renderedValue}</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SideBySideComparisonProps<T> {
  leftItem: T;
  rightItem: T;
  fields: ComparisonField[];
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function SideBySideComparison<T extends Record<string, any>>({
  leftItem,
  rightItem,
  fields,
  leftLabel = "Item 1",
  rightLabel = "Item 2",
  className,
}: SideBySideComparisonProps<T>) {
  return (
    <div className={cn("grid grid-cols-2 gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{leftLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field) => {
            const value = leftItem[field.key];
            const renderedValue = field.render
              ? field.render(value, leftItem)
              : String(value || "-");

            return (
              <div key={field.key}>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {field.label}
                </p>
                <div className="text-sm">{renderedValue}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{rightLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field) => {
            const value = rightItem[field.key];
            const renderedValue = field.render
              ? field.render(value, rightItem)
              : String(value || "-");

            const leftValue = leftItem[field.key];
            const isDifferent = JSON.stringify(value) !== JSON.stringify(leftValue);

            return (
              <div key={field.key}>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {field.label}
                </p>
                <div
                  className={cn(
                    "text-sm",
                    isDifferent && "text-yellow-600 dark:text-yellow-400 font-medium"
                  )}
                >
                  {renderedValue}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

interface DiffViewProps {
  oldText: string;
  newText: string;
  title?: string;
  className?: string;
}

export function DiffView({ oldText, newText, title, className }: DiffViewProps) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const maxLength = Math.max(oldLines.length, newLines.length);

  return (
    <div className={cn("space-y-2", className)}>
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      <div className="grid grid-cols-2 gap-0 border rounded-lg overflow-hidden">
        <div className="bg-red-50 dark:bg-red-950/20">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 text-sm font-medium">
            Original
          </div>
          <ScrollArea className="h-[400px]">
            <pre className="p-4 text-xs font-mono">
              {oldLines.map((line, idx) => (
                <div key={idx} className="hover:bg-red-100 dark:hover:bg-red-900/20">
                  <span className="text-muted-foreground mr-4">{idx + 1}</span>
                  {line}
                </div>
              ))}
            </pre>
          </ScrollArea>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 text-sm font-medium">
            Updated
          </div>
          <ScrollArea className="h-[400px]">
            <pre className="p-4 text-xs font-mono">
              {newLines.map((line, idx) => {
                const isDifferent = line !== oldLines[idx];
                return (
                  <div
                    key={idx}
                    className={cn(
                      "hover:bg-green-100 dark:hover:bg-green-900/20",
                      isDifferent && "bg-green-200 dark:bg-green-900/40 font-semibold"
                    )}
                  >
                    <span className="text-muted-foreground mr-4">{idx + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

interface ComparisonSliderProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onCompare?: (itemA: T, itemB: T) => void;
  className?: string;
}

export function ComparisonSlider<T>({
  items,
  renderItem,
  onCompare,
  className,
}: ComparisonSliderProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (items.length < 2) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Need at least 2 items
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];

  const handleNext = () => {
    if (currentIndex < items.length - 2) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Comparing {currentIndex + 1} & {currentIndex + 2} of {items.length}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex >= items.length - 2}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Item {currentIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent>{renderItem(currentItem)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Item {currentIndex + 2}</CardTitle>
          </CardHeader>
          <CardContent>{renderItem(nextItem)}</CardContent>
        </Card>
      </div>

      {onCompare && (
        <Button
          className="w-full"
          onClick={() => onCompare(currentItem, nextItem)}
        >
          Compare These Items
        </Button>
      )}
    </div>
  );
}

export function useComparison<T>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const toggleItem = (item: T) => {
    setSelectedItems((prev) => {
      const exists = prev.some((i) => JSON.stringify(i) === JSON.stringify(item));
      if (exists) {
        return prev.filter((i) => JSON.stringify(i) !== JSON.stringify(item));
      }
      return [...prev, item];
    });
  };

  const isSelected = (item: T) => {
    return selectedItems.some((i) => JSON.stringify(i) === JSON.stringify(item));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const canCompare = selectedItems.length >= 2;

  return {
    selectedItems,
    toggleItem,
    isSelected,
    clearSelection,
    canCompare,
  };
}
