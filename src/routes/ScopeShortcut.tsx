/**
 * Scope Shortcut Route
 * Allows direct access to scopes via /scopes/:scopeId
 * Redirects to the full nested route after looking up the scope's project context
 */

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { scopesService } from "@/lib/api"
import { Link } from "react-router-dom"

export default function ScopeShortcut() {
  const { scopeId } = useParams<{ scopeId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function lookupScope() {
      if (!scopeId) {
        setError("Scope ID is required")
        setLoading(false)
        return
      }

      try {
        // Fetch the scope to get its project context
        const scope = await scopesService.getScope(scopeId)

        if (scope && scope.project_id) {
          // Redirect to the full nested route
          navigate(`/projects/${scope.project_id}/scopes/${scopeId}`, { replace: true })
          return
        } else {
          setError("Scope not found or missing project information")
          setLoading(false)
        }
      } catch (err) {
        console.error("Error looking up scope:", err)
        setError("Failed to load scope. It may not exist or you may not have permission to view it.")
        setLoading(false)
      }
    }

    lookupScope()
  }, [scopeId, navigate])

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Scope", href: "#" }, { label: "Loading..." }]}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Looking up scope context...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Scope", href: "#" }, { label: "Error" }]}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link to="/projects">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Projects
          </Button>
        </Link>
      </DashboardLayout>
    )
  }

  return null
}
