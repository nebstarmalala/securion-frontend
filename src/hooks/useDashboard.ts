import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { dashboardService } from "@/lib/api"

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: () => dashboardService.getOverview(),
  })
}

export function useProjectStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.projectStats(),
    queryFn: () => dashboardService.getProjectStats(),
  })
}

export function useFindingStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.findingStats(),
    queryFn: () => dashboardService.getFindingStats(),
  })
}

export function useCVEStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.cveStats(),
    queryFn: () => dashboardService.getCVEStats(),
  })
}

export function useTeamStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.teamStats(),
    queryFn: () => dashboardService.getTeamStats(),
  })
}

export function useTrends(period?: "daily" | "weekly" | "monthly") {
  return useQuery({
    queryKey: queryKeys.dashboard.trends(period),
    queryFn: () => dashboardService.getTrends(period),
  })
}

export function useClearDashboardCache() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => dashboardService.clearCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    },
  })
}
