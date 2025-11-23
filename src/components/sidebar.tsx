import { Link, useLocation } from "react-router-dom"
import {
  Home,
  FolderKanban,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  FileText,
  Workflow,
  Webhook,
  Plug,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

// Types for navigation items
interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  permission?: string
}

interface NavGroup {
  name: string
  icon: LucideIcon
  items: NavItem[]
  defaultOpen?: boolean
  permission?: string
}

// Standalone items (always visible at top)
const standaloneItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
]

// Grouped navigation structure
const navigationGroups: NavGroup[] = [
  {
    name: "Work",
    icon: FolderKanban,
    defaultOpen: true,
    items: [
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "CVE Tracking", href: "/cve-tracking", icon: Shield },
      { name: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    name: "Automation",
    icon: Workflow,
    defaultOpen: false,
    items: [
      { name: "Workflows", href: "/workflows", icon: Workflow },
      { name: "Webhooks", href: "/webhooks", icon: Webhook },
      { name: "Integrations", href: "/integrations", icon: Plug },
    ],
  },
]

// Storage key for persisting collapsed sections
const STORAGE_KEY = "securion-nav-sections"

function getStoredSections(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function storeSections(sections: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections))
  } catch {
    // Ignore storage errors
  }
}

// NavLink component for individual items
function NavLink({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem
  collapsed: boolean
  pathname: string
}) {
  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

  return (
    <Link
      to={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:h-full before:w-1 before:rounded-r-full before:bg-primary"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="flex-1">{item.name}</span>}
    </Link>
  )
}

// NavSection component for collapsible groups
function NavSection({
  group,
  collapsed,
  pathname,
  isOpen,
  onToggle,
  hasPermission,
}: {
  group: NavGroup
  collapsed: boolean
  pathname: string
  isOpen: boolean
  onToggle: () => void
  hasPermission: (permission: string) => boolean
}) {
  // Filter items based on permissions
  const visibleItems = group.items.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  // Don't render section if no visible items
  if (visibleItems.length === 0) return null

  // Check if any item in this group is active
  const hasActiveItem = visibleItems.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  )

  // In collapsed mode, just show icon that expands on hover or links to first item
  if (collapsed) {
    return (
      <div className="relative group">
        <div
          className={cn(
            "flex items-center justify-center rounded-lg px-3 py-2 cursor-pointer",
            hasActiveItem
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
          title={group.name}
        >
          <group.icon className="h-4 w-4" />
        </div>
        {/* Tooltip menu on hover */}
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
              {group.name}
            </div>
            {visibleItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm transition-colors",
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            hasActiveItem
              ? "text-sidebar-foreground"
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
          )}
        >
          <group.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{group.name}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-0.5 mt-0.5">
        {visibleItems.map((item) => (
          <NavLink key={item.name} item={item} collapsed={false} pathname={pathname} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, hasPermission } = useAuth()

  // Track which sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const stored = getStoredSections()
    // Initialize with defaults if not stored
    const initial: Record<string, boolean> = {}
    navigationGroups.forEach((group) => {
      initial[group.name] = stored[group.name] ?? group.defaultOpen ?? false
    })
    return initial
  })

  // Persist section state
  useEffect(() => {
    storeSections(openSections)
  }, [openSections])

  // Auto-expand section containing active item
  useEffect(() => {
    navigationGroups.forEach((group) => {
      const hasActiveItem = group.items.some(
        (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
      )
      if (hasActiveItem && !openSections[group.name]) {
        setOpenSections((prev) => ({ ...prev, [group.name]: true }))
      }
    })
  }, [pathname])

  const toggleSection = (name: string) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  // Filter groups based on permissions
  const visibleGroups = navigationGroups.filter(
    (group) => !group.permission || hasPermission(group.permission)
  )

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
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-60",
          "lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                  SECURION
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft
                className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
              />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* Standalone items (Dashboard) */}
            {standaloneItems.map((item) => (
              <NavLink key={item.name} item={item} collapsed={collapsed} pathname={pathname} />
            ))}

            {/* Divider */}
            <div className="my-2 border-t border-sidebar-border" />

            {/* Grouped navigation */}
            <div className="space-y-1">
              {visibleGroups.map((group) => (
                <NavSection
                  key={group.name}
                  group={group}
                  collapsed={collapsed}
                  pathname={pathname}
                  isOpen={openSections[group.name] ?? false}
                  onToggle={() => toggleSection(group.name)}
                  hasPermission={hasPermission}
                />
              ))}
            </div>
          </nav>

          {/* Settings */}
          <div className="border-t border-sidebar-border p-3">
            <NavLink
              item={{ name: "Settings", href: "/settings", icon: Settings }}
              collapsed={collapsed}
              pathname={pathname}
            />
          </div>

          {/* User profile */}
          <div className="border-t border-sidebar-border p-3">
            <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username || "User"} />
                <AvatarFallback className="text-xs">
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
                <>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {user?.username || "User"}
                    </p>
                    <p className="truncate text-xs text-sidebar-foreground/60">
                      {user?.roles[0]?.name || "No role"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={logout}
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
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
