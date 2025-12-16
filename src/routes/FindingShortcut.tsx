/**
 * Finding Shortcut Route
 * Allows direct access to findings via /findings/:findingId
 * Redirects to the full nested route after looking up the finding's context
 */

import { useEffect, useState } from "react"
import { useParams, useNavigate, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { findingsService } from "@/lib/api"
import { Link } from "react-router-dom"

export default function FindingShortcut() {
  const { findingId } = useParams<{ findingId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function lookupFinding() {
      if (!findingId) {
        setError("Finding ID is required")
        setLoading(false)
        return
      }

      try {
        // Fetch the finding to get its context (project and scope)
        const finding = await findingsService.getFinding(findingId)

        if (finding && finding.scope_id) {
          // We need to also look up the scope to get the project ID
          // The finding should have a reference to its scope, and the scope to its project
          // For now, we'll assume the API returns this context or we need to fetch it

          // If the finding has project_id and scope_id directly:
          if (finding.project_id && finding.scope_id) {
            navigate(`/projects/${finding.project_id}/scopes/${finding.scope_id}/findings/${findingId}`, { replace: true })
            return
          }

          // Otherwise, we need to fetch the scope to get the project ID
          // This would require an additional API call - for now, redirect to projects
          setError("Unable to determine finding context. Please navigate through Projects.")
          setLoading(false)
        } else {
          setError("Finding not found or missing scope information")
          setLoading(false)
        }
      } catch (err) {
        console.error("Error looking up finding:", err)
        setError("Failed to load finding. It may not exist or you may not have permission to view it.")
        setLoading(false)
      }
    }

    lookupFinding()
  }, [findingId, navigate])

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Finding", href: "#" }, { label: "Loading..." }]}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Looking up finding context...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Finding", href: "#" }, { label: "Error" }]}>
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
