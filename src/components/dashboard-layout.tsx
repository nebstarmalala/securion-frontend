import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

export function DashboardLayout({ children, breadcrumbs }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip Navigation - WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-60">
        <Header breadcrumbs={breadcrumbs} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-background p-4 sm:p-6"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
