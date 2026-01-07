import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryClient } from "@/lib/query-client"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { ThemeProvider } from "@/lib/contexts/theme-context"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { NetworkStatus } from "@/components/feedback/NetworkStatus"
import { BottomNav } from "@/components/mobile/BottomNav"
import { Suspense, lazy } from "react"

// Lazy load routes
const Dashboard = lazy(() => import("@/routes/Dashboard"))
const DashboardV2 = lazy(() => import("@/routes/DashboardV2"))
const Login = lazy(() => import("@/routes/Login"))
const Projects = lazy(() => import("@/routes/Projects"))
const ProjectDetails = lazy(() => import("@/routes/ProjectDetails"))
const ScopeDetails = lazy(() => import("@/routes/ScopeDetails"))
const FindingDetails = lazy(() => import("@/routes/FindingDetails"))
const CVETracking = lazy(() => import("@/routes/CVETracking"))
const CVEDetails = lazy(() => import("@/routes/CVEDetails"))
const Reports = lazy(() => import("@/routes/Reports"))
const ReportDetails = lazy(() => import("@/routes/ReportDetails"))
const Settings = lazy(() => import("@/routes/Settings"))
const Workflows = lazy(() => import("@/routes/Workflows"))
const Webhooks = lazy(() => import("@/routes/Webhooks"))
const Integrations = lazy(() => import("@/routes/Integrations"))
const Templates = lazy(() => import("@/routes/Templates"))

// Phase 3: URL Shortcut routes for direct access
const FindingShortcut = lazy(() => import("@/routes/FindingShortcut"))
const ScopeShortcut = lazy(() => import("@/routes/ScopeShortcut"))

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes - All wrapped with ProtectedRoute */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/v2" element={<ProtectedRoute><DashboardV2 /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute requiredPermission="project-view"><ProjectDetails /></ProtectedRoute>} />
                <Route path="/projects/:id/scopes/:scopeId" element={<ProtectedRoute requiredPermission="scope-view"><ScopeDetails /></ProtectedRoute>} />
                <Route path="/projects/:id/scopes/:scopeId/findings/:findingId" element={<ProtectedRoute requiredPermission="finding-view"><FindingDetails /></ProtectedRoute>} />

                {/* Phase 3: URL Shortcuts - Direct access to nested resources */}
                <Route path="/findings/:findingId" element={<ProtectedRoute requiredPermission="finding-view"><FindingShortcut /></ProtectedRoute>} />
                <Route path="/scopes/:scopeId" element={<ProtectedRoute requiredPermission="scope-view"><ScopeShortcut /></ProtectedRoute>} />

                <Route path="/cve-tracking" element={<ProtectedRoute requiredPermission="cve-tracking-view"><CVETracking /></ProtectedRoute>} />
                <Route path="/cve-tracking/:cveId" element={<ProtectedRoute requiredPermission="cve-tracking-view"><CVEDetails /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/reports/:id" element={<ProtectedRoute><ReportDetails /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
                <Route path="/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
                <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />

                {/* Legacy redirects - Routes now consolidated into Settings */}
                <Route path="/users" element={<Navigate to="/settings" replace />} />
                <Route path="/system/cache" element={<Navigate to="/settings" replace />} />
                <Route path="/system/queue" element={<Navigate to="/settings" replace />} />
                <Route path="/system/error-logs" element={<Navigate to="/settings" replace />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Toaster />
            <NetworkStatus />
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
