import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Filter,
  Download,
  Search,
  Calendar,
  User,
  Shield,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  changes?: Record<string, { before: any; after: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: "info" | "warning" | "critical";
  status?: "success" | "failure";
}

interface AuditLogViewerProps {
  entries: AuditLogEntry[];
  onExport?: () => void;
  className?: string;
}

export function AuditLogViewer({
  entries,
  onExport,
  className,
}: AuditLogViewerProps) {
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          entry.userName.toLowerCase().includes(searchLower) ||
          entry.action.toLowerCase().includes(searchLower) ||
          entry.entityType.toLowerCase().includes(searchLower) ||
          entry.entityName?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // User filter
      if (userFilter !== "all" && entry.userId !== userFilter) {
        return false;
      }

      // Action filter
      if (actionFilter !== "all" && entry.action !== actionFilter) {
        return false;
      }

      // Entity type filter
      if (entityTypeFilter !== "all" && entry.entityType !== entityTypeFilter) {
        return false;
      }

      // Date range filter
      if (dateRange !== "all") {
        const now = new Date();
        const entryDate = new Date(entry.timestamp);
        const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateRange === "today" && daysDiff > 0) return false;
        if (dateRange === "week" && daysDiff > 7) return false;
        if (dateRange === "month" && daysDiff > 30) return false;
      }

      return true;
    });
  }, [entries, search, userFilter, actionFilter, entityTypeFilter, dateRange]);

  const uniqueUsers = useMemo(() => {
    const users = new Map<string, { id: string; name: string }>();
    entries.forEach((entry) => {
      if (!users.has(entry.userId)) {
        users.set(entry.userId, { id: entry.userId, name: entry.userName });
      }
    });
    return Array.from(users.values());
  }, [entries]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.action)));
  }, [entries]);

  const uniqueEntityTypes = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.entityType)));
  }, [entries]);

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "failure":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("create")) return <FileText className="h-4 w-4" />;
    if (action.includes("update") || action.includes("edit")) return <Settings className="h-4 w-4" />;
    if (action.includes("delete")) return <XCircle className="h-4 w-4" />;
    if (action.includes("view") || action.includes("read")) return <Search className="h-4 w-4" />;
    if (action.includes("login") || action.includes("auth")) return <Shield className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Audit Log
            </span>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="pl-9"
              />
            </div>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueEntityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredEntries.length} of {entries.length} entries
            </span>
            {(search || userFilter !== "all" || actionFilter !== "all" || entityTypeFilter !== "all" || dateRange !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setUserFilter("all");
                  setActionFilter("all");
                  setEntityTypeFilter("all");
                  setDateRange("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No audit log entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.status)}
                      {getSeverityIcon(entry.severity)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={entry.userAvatar} />
                        <AvatarFallback className="text-xs">
                          {entry.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{entry.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(entry.action)}
                      <span className="text-sm">{entry.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{entry.entityType}</p>
                      {entry.entityName && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {entry.entityName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Audit Log Entry Details</DialogTitle>
            <DialogDescription>
              Detailed information about this audit log entry
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                  <p className="text-sm">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedEntry.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {selectedEntry.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{selectedEntry.userName}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <p className="text-sm">{selectedEntry.action}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity</p>
                  <p className="text-sm">{selectedEntry.entityType}</p>
                </div>
                {selectedEntry.ipAddress && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                    <p className="text-sm font-mono">{selectedEntry.ipAddress}</p>
                  </div>
                )}
                {selectedEntry.status && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={selectedEntry.status === "success" ? "default" : "destructive"}>
                      {selectedEntry.status}
                    </Badge>
                  </div>
                )}
              </div>

              {selectedEntry.changes && Object.keys(selectedEntry.changes).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Changes</h4>
                  <div className="space-y-2 rounded-lg border p-4 max-h-[300px] overflow-y-auto">
                    {Object.entries(selectedEntry.changes).map(([field, change]) => (
                      <div key={field} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{field}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Before</p>
                          <p className="text-sm font-mono bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">
                            {JSON.stringify(change.before)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">After</p>
                          <p className="text-sm font-mono bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded">
                            {JSON.stringify(change.after)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Metadata</h4>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedEntry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function useAuditLog(initialEntries: AuditLogEntry[] = []) {
  const [entries, setEntries] = useState<AuditLogEntry[]>(initialEntries);

  const addEntry = (entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  const clearEntries = () => {
    setEntries([]);
  };

  const exportEntries = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    entries,
    addEntry,
    clearEntries,
    exportEntries,
  };
}
