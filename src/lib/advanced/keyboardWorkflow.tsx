import { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Search,
  Home,
  FolderKanban,
  Shield,
  FileText,
  Settings,
  Command,
} from "lucide-react";

export interface KeyboardCommand {
  id: string;
  name: string;
  description?: string;
  keywords: string[];
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  category: string;
  action: () => void | Promise<void>;
  condition?: () => boolean;
}

interface CommandPaletteProps {
  commands: KeyboardCommand[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ commands, open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter((cmd) => {
    if (cmd.condition && !cmd.condition()) return false;

    const searchLower = search.toLowerCase();
    return (
      cmd.name.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(searchLower)) ||
      cmd.category.toLowerCase().includes(searchLower)
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, KeyboardCommand[]>);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const executeCommand = async (command: KeyboardCommand) => {
    onOpenChange(false);
    await command.action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => {
              let currentIndex = 0;
              for (const cat of Object.keys(groupedCommands)) {
                if (cat === category) break;
                currentIndex += groupedCommands[cat].length;
              }

              return (
                <div key={category} className="mb-4">
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {cmds.map((cmd, idx) => {
                      const globalIndex = currentIndex + idx;
                      const Icon = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => executeCommand(cmd)}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            globalIndex === selectedIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-medium truncate">{cmd.name}</p>
                              {cmd.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {cmd.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {cmd.shortcut && (
                            <div className="flex gap-1 flex-shrink-0">
                              {cmd.shortcut.map((key, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs font-mono px-1.5 py-0"
                                >
                                  {key}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              <Badge variant="outline" className="mr-1">↑↓</Badge>
              Navigate
            </span>
            <span>
              <Badge variant="outline" className="mr-1">↵</Badge>
              Select
            </span>
            <span>
              <Badge variant="outline" className="mr-1">Esc</Badge>
              Close
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useCommandPalette(commands: KeyboardCommand[]) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    open,
    setOpen,
  };
}

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
  action: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      pressedKeys.current.add(e.key.toLowerCase());

      for (const shortcut of shortcuts) {
        const allPressed = shortcut.keys.every((key) =>
          pressedKeys.current.has(key.toLowerCase())
        );

        if (allPressed) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.action();
          pressedKeys.current.clear();
          break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key.toLowerCase());
    };

    const handleBlur = () => {
      pressedKeys.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [shortcuts]);
}

export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      keys: ["g", "h"],
      description: "Go to Home",
      category: "Navigation",
      action: () => navigate("/"),
    },
    {
      keys: ["g", "p"],
      description: "Go to Projects",
      category: "Navigation",
      action: () => navigate("/projects"),
    },
    {
      keys: ["g", "f"],
      description: "Go to Findings",
      category: "Navigation",
      action: () => navigate("/findings"),
    },
    {
      keys: ["g", "c"],
      description: "Go to CVE Tracking",
      category: "Navigation",
      action: () => navigate("/cve-tracking"),
    },
    {
      keys: ["g", "r"],
      description: "Go to Reports",
      category: "Navigation",
      action: () => navigate("/reports"),
    },
    {
      keys: ["g", "s"],
      description: "Go to Settings",
      category: "Navigation",
      action: () => navigate("/settings"),
    },
    {
      keys: ["?"],
      description: "Show keyboard shortcuts",
      category: "Help",
      action: () => {
        // This will be handled by KeyboardShortcutsHelp component
        window.dispatchEvent(new Event("show-keyboard-shortcuts"));
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setOpen(true);
    window.addEventListener("show-keyboard-shortcuts", handleShow);
    return () => window.removeEventListener("show-keyboard-shortcuts", handleShow);
  }, []);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3">{category}</h3>
              <div className="space-y-2">
                {items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="font-mono text-xs px-2"
                        >
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Press <Badge variant="outline" className="mx-1">?</Badge> to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function createDefaultCommands(navigate: ReturnType<typeof useNavigate>) {
  const commands: KeyboardCommand[] = [
    {
      id: "go-home",
      name: "Go to Dashboard",
      description: "Navigate to the dashboard",
      keywords: ["home", "dashboard", "main"],
      icon: Home,
      shortcut: ["G", "H"],
      category: "Navigation",
      action: () => navigate("/"),
    },
    {
      id: "go-projects",
      name: "Go to Projects",
      description: "View all projects",
      keywords: ["projects", "list"],
      icon: FolderKanban,
      shortcut: ["G", "P"],
      category: "Navigation",
      action: () => navigate("/projects"),
    },
    {
      id: "go-cve",
      name: "Go to CVE Tracking",
      description: "View CVE vulnerabilities",
      keywords: ["cve", "vulnerabilities", "tracking"],
      icon: Shield,
      shortcut: ["G", "C"],
      category: "Navigation",
      action: () => navigate("/cve-tracking"),
    },
    {
      id: "go-reports",
      name: "Go to Reports",
      description: "View and generate reports",
      keywords: ["reports", "documents"],
      icon: FileText,
      shortcut: ["G", "R"],
      category: "Navigation",
      action: () => navigate("/reports"),
    },
    {
      id: "go-settings",
      name: "Go to Settings",
      description: "Manage application settings",
      keywords: ["settings", "preferences", "config"],
      icon: Settings,
      shortcut: ["G", "S"],
      category: "Navigation",
      action: () => navigate("/settings"),
    },
    {
      id: "search",
      name: "Global Search",
      description: "Search across all entities",
      keywords: ["search", "find", "query"],
      icon: Search,
      shortcut: ["⌘", "K"],
      category: "Actions",
      action: () => {
        // Trigger global search
        window.dispatchEvent(new Event("open-global-search"));
      },
    },
  ];

  return commands;
}
