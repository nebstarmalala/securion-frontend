import { useState, useCallback, useRef } from "react";
import { Download, Upload, FileJson, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export type ExportFormat = "json" | "csv" | "xlsx";

interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeMetadata?: boolean;
  fields?: string[];
}

interface ImportOptions {
  format: ExportFormat;
  validateSchema?: boolean;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
}

interface ImportResult<T> {
  success: T[];
  failed: Array<{ row: number; data: any; error: string }>;
  totalProcessed: number;
}

export function exportToJSON<T>(data: T[], options: ExportOptions = { format: "json" }) {
  const { filename = "export.json", includeMetadata = true } = options;

  const exportData = includeMetadata
    ? {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "1.0",
          recordCount: data.length,
        },
        data,
      }
    : data;

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  downloadBlob(blob, filename);
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = { format: "csv" }
) {
  const { filename = "export.csv", fields } = options;

  if (data.length === 0) {
    throw new Error("No data to export");
  }

  const headers = fields || Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        const stringValue = value?.toString() || "";
        return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importFromJSON<T>(
  file: File,
  options: ImportOptions = { format: "json" }
): Promise<ImportResult<T>> {
  const { validateSchema, onProgress } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        const data = Array.isArray(parsed)
          ? parsed
          : parsed.data || [];

        if (validateSchema) {
          // Schema validation logic here
        }

        onProgress?.(100);

        resolve({
          success: data,
          failed: [],
          totalProcessed: data.length,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export async function importFromCSV<T>(
  file: File,
  options: ImportOptions & { headers?: string[] } = { format: "csv" }
): Promise<ImportResult<T>> {
  const { onProgress, headers: customHeaders } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split("\n").filter((line) => line.trim());

        if (lines.length === 0) {
          reject(new Error("File is empty"));
          return;
        }

        const headers = customHeaders || lines[0].split(",").map((h) => h.trim());
        const dataLines = customHeaders ? lines : lines.slice(1);

        const success: T[] = [];
        const failed: Array<{ row: number; data: any; error: string }> = [];

        dataLines.forEach((line, index) => {
          try {
            const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
            const obj = headers.reduce((acc, header, i) => {
              acc[header] = values[i];
              return acc;
            }, {} as any);

            success.push(obj);

            if (onProgress) {
              onProgress(((index + 1) / dataLines.length) * 100);
            }
          } catch (error) {
            failed.push({
              row: index + 2,
              data: line,
              error: error instanceof Error ? error.message : "Parse error",
            });
          }
        });

        resolve({
          success,
          failed,
          totalProcessed: dataLines.length,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

interface BulkExportProps<T> {
  data: T[];
  entityName: string;
  defaultFormat?: ExportFormat;
  fields?: string[];
  onExport?: () => void;
}

export function BulkExport<T extends Record<string, any>>({
  data,
  entityName,
  defaultFormat = "json",
  fields,
  onExport,
}: BulkExportProps<T>) {
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const filename = `${entityName}-${new Date().toISOString().split("T")[0]}.${format}`;

      if (format === "json") {
        exportToJSON(data, { format, filename });
      } else if (format === "csv") {
        exportToCSV(data, { format, filename, fields });
      }

      toast({
        title: "Export successful",
        description: `Exported ${data.length} ${entityName}`,
      });

      onExport?.();
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as ExportFormat)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
      >
        <option value="json">JSON</option>
        <option value="csv">CSV</option>
      </select>
      <Button onClick={handleExport} disabled={data.length === 0}>
        <Download className="h-4 w-4 mr-2" />
        Export ({data.length})
      </Button>
    </div>
  );
}

interface BulkImportProps<T> {
  entityName: string;
  onImport: (data: T[]) => Promise<void>;
  acceptedFormats?: ExportFormat[];
  validateSchema?: boolean;
}

export function BulkImport<T>({
  entityName,
  onImport,
  acceptedFormats = ["json", "csv"],
  validateSchema = false,
}: BulkImportProps<T>) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult<T> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      let importResult: ImportResult<T>;

      if (file.name.endsWith(".json")) {
        importResult = await importFromJSON<T>(file, {
          format: "json",
          validateSchema,
          onProgress: setProgress,
        });
      } else if (file.name.endsWith(".csv")) {
        importResult = await importFromCSV<T>(file, {
          format: "csv",
          validateSchema,
          onProgress: setProgress,
        });
      } else {
        throw new Error("Unsupported file format");
      }

      setResult(importResult);

      if (importResult.success.length > 0) {
        await onImport(importResult.success);
      }

      if (importResult.failed.length === 0) {
        toast({
          title: "Import successful",
          description: `Imported ${importResult.success.length} ${entityName}`,
        });
        setOpen(false);
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const acceptString = acceptedFormats.map((f) => `.${f}`).join(",");

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Import {entityName}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import {entityName}</DialogTitle>
            <DialogDescription>
              Upload a file to import multiple {entityName} at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              {acceptedFormats.includes("json") && (
                <div className="flex-1 p-4 border rounded-lg text-center">
                  <FileJson className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">JSON</p>
                  <p className="text-xs text-muted-foreground">Structured data</p>
                </div>
              )}
              {acceptedFormats.includes("csv") && (
                <div className="flex-1 p-4 border rounded-lg text-center">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">CSV</p>
                  <p className="text-xs text-muted-foreground">Spreadsheet data</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptString}
              onChange={handleFileSelect}
              disabled={importing}
              className="w-full"
            />

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Importing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {result.success.length} imported successfully
                  </span>
                </div>

                {result.failed.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {result.failed.length} failed
                      </span>
                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.failed.map((fail, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-muted-foreground flex items-start gap-1"
                        >
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>
                            Row {fail.row}: {fail.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function useBulkOperations<T>() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedItems(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedItems.has(id),
    [selectedItems]
  );

  return {
    selectedItems: Array.from(selectedItems),
    selectedCount: selectedItems.size,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
  };
}
