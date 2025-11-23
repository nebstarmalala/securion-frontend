/**
 * Keyboard Shortcuts Help Dialog
 * Shows available keyboard shortcuts for navigation
 */

import { useEffect, useState } from "react"
import { Keyboard, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getNavigationShortcuts } from "@/lib/hooks/useNavigation"
import { cn } from "@/lib/utils"

interface KeyboardShortcutsHelpProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const shortcuts = getNavigationShortcuts()
  const [isOpen, setIsOpen] = useState(open ?? false)

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  // Sync with external open state
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  // Listen for ? key to open shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      if (event.key === "?" && event.shiftKey) {
        event.preventDefault()
        handleOpenChange(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Keyboard className="h-4 w-4" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Press these key combinations to navigate quickly. Press <Kbd>?</Kbd> to show this dialog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Navigation shortcuts */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h4>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <Kbd>{key}</Kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground text-xs">then</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global shortcuts */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Global</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm">Open search</span>
                <div className="flex items-center gap-1">
                  <Kbd><Command className="h-3 w-3" /></Kbd>
                  <Kbd>k</Kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm">Show shortcuts</span>
                <Kbd>?</Kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm">Go back</span>
                <Kbd>Backspace</Kbd>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Tip: Shortcuts won't work when focused on input fields
        </p>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Keyboard key indicator component
 */
function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  )
}

/**
 * Simple keyboard shortcut hint that appears next to buttons
 */
interface ShortcutHintProps {
  keys: string[]
  className?: string
}

export function ShortcutHint({ keys, className }: ShortcutHintProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {keys.map((key, index) => (
        <Kbd key={index}>{key}</Kbd>
      ))}
    </div>
  )
}
