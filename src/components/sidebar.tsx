import { Link, useLocation } from "react-router-dom"
import { Home, FolderKanban, Shield, Settings, LogOut, ChevronLeft, Menu, FileText, Users, Workflow, Webhook, Plug, Database, Activity, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

// Note: Badge counts will be replaced with API data later
// All navigation items are visible to all authenticated users except "Users" which requires user-view permission
const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "CVE Tracking",
    href: "/cve-tracking",
    icon: Shield,
  },
  {
    name: "Workflows",
    href: "/workflows",
    icon: Workflow,
  },
  {
    name: "Webhooks",
    href: "/webhooks",
    icon: Webhook,
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Plug,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    permission: "user-view",
  },
]

const systemNavigation = [
  {
    name: "Cache Management",
    href: "/system/cache",
    icon: Database,
    permission: "super-admin",
  },
  {
    name: "Queue Monitoring",
    href: "/system/queue",
    icon: Activity,
  },
  {
    name: "Error Logs",
    href: "/system/error-logs",
    icon: AlertTriangle,
  },
]

export function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, hasPermission } = useAuth()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-64",
          "lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">SECURION</span>
              )}
            </Link>
            <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={() => setCollapsed(!collapsed)}>
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              // Check if user has permission to view this item
              if (item.permission && !hasPermission(item.permission)) {
                return null
              }

              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:h-full before:w-1 before:rounded-r-full before:bg-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="flex-1">{item.name}</span>}
                </Link>
              )
            })}

            {/* System Management Section */}
            <div className="pt-4 mt-4 border-t border-sidebar-border">
              {!collapsed && (
                <div className="px-3 pb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  System
                </div>
              )}
              {systemNavigation.map((item) => {
                // Check if user has permission to view this item
                if (item.permission && !hasPermission(item.permission)) {
                  return null
                }

                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:h-full before:w-1 before:rounded-r-full before:bg-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="flex-1">{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Settings - pinned to bottom */}
          <div className="border-t border-sidebar-border p-4">
            <Link
              to="/settings"
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                pathname === "/settings"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
          </div>

          {/* User profile */}
          <div className="border-t border-sidebar-border p-4">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username || "User"} />
                <AvatarFallback>
                  {user?.username
                    ? user.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.username || "User"}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {user?.roles[0]?.name || "No role"}
                  </p>
                </div>
              )}
              {!collapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  )
}
