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
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        <Header breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}
