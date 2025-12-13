import { Link, useLocation } from "react-router-dom";
import { Home, FolderKanban, Shield, FileText, Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BottomNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const bottomNavItems: BottomNavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "CVEs", href: "/cve-tracking", icon: Shield },
  { name: "Reports", href: "/reports", icon: FileText },
];

interface BottomNavigationProps {
  className?: string;
}

export function BottomNavigation({ className }: BottomNavigationProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden",
        className
      )}
    >
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="truncate w-full text-center">{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}

        <MobileMenuSheet />
      </div>
    </nav>
  );
}

function MobileMenuSheet() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="h-5 w-5" />
          <span>Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full mt-4">
          <div className="space-y-6 pb-20">
            {/* User Profile */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={user?.avatar || "/placeholder.svg"}
                  alt={user?.username || "User"}
                />
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
              <div className="flex-1">
                <p className="font-medium">{user?.username || "User"}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "No email"}
                </p>
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="space-y-4">
              <MenuSection
                title="Automation"
                items={[
                  { name: "Workflows", href: "/workflows" },
                  { name: "Webhooks", href: "/webhooks" },
                  { name: "Integrations", href: "/integrations" },
                ]}
                pathname={location.pathname}
                onNavigate={() => setOpen(false)}
              />

              <MenuSection
                title="Settings & Account"
                items={[
                  { name: "Settings", href: "/settings" },
                  { name: "Users", href: "/users" },
                  { name: "Templates", href: "/templates" },
                ]}
                pathname={location.pathname}
                onNavigate={() => setOpen(false)}
              />

              <MenuSection
                title="System"
                items={[
                  { name: "Queue Monitoring", href: "/queue-monitoring" },
                  { name: "Error Logs", href: "/error-logs" },
                ]}
                pathname={location.pathname}
                onNavigate={() => setOpen(false)}
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  // Navigate to settings
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MenuSectionProps {
  title: string;
  items: Array<{ name: string; href: string }>;
  pathname: string;
  onNavigate: () => void;
}

function MenuSection({ title, items, pathname, onNavigate }: MenuSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface MobileHeaderProps {
  title?: string;
  action?: React.ReactNode;
  className?: string;
}

export function MobileHeader({ title, action, className }: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {title && (
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </header>
  );
}
