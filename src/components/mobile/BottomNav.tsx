import { Link, useLocation } from "react-router-dom"
import { Home, FolderKanban, Shield, FileText, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string
  href: string
  icon: typeof Home
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "CVE", href: "/cve-tracking", icon: Shield },
  { label: "Reports", href: "/reports", icon: FileText },
]

export function BottomNav() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== "/" && location.pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </Link>
          )
        })}

        {/* More Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[50vh]">
            <div className="space-y-2 mt-4">
              <Link
                to="/workflows"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <span className="font-medium">Workflows</span>
              </Link>
              <Link
                to="/webhooks"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <span className="font-medium">Webhooks</span>
              </Link>
              <Link
                to="/integrations"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <span className="font-medium">Integrations</span>
              </Link>
              <Link
                to="/templates"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <span className="font-medium">Templates</span>
              </Link>
              <div className="border-t my-2" />
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <span className="font-medium">Settings</span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
