"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderKanban, Shield, Settings, LogOut, ChevronLeft, Menu, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { mockUsers, mockProjects, mockCVEs, mockReports } from "@/lib/mock-data"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
    badge: mockProjects.filter((p) => p.status === "active").length,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    badge: mockReports.length,
  },
  {
    name: "CVE Tracking",
    href: "/cve-tracking",
    icon: Shield,
    badge: mockCVEs.filter((c) => c.status === "affected").length,
    badgeVariant: "destructive" as const,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const currentUser = mockUsers[0] // Alex Rivera

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
            <Link href="/" className="flex items-center gap-3">
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
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:h-full before:w-1 before:rounded-r-full before:bg-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant={item.badgeVariant || "secondary"} className="h-5 min-w-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Settings - pinned to bottom */}
          <div className="border-t border-sidebar-border p-4">
            <Link
              href="/settings"
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
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">{currentUser.role}</p>
                </div>
              )}
              {!collapsed && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
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
