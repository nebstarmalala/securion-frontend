import { useQuery } from "@tanstack/react-query"
import { activitiesService } from "@/lib/api"
import type { Activity, PaginatedData, ActivityQueryParams, ActivityStats } from "@/lib/types/api"

export function useActivityFeed(params?: ActivityQueryParams) {
  return useQuery<PaginatedData<Activity>>({
    queryKey: ["activities", "feed", params],
    queryFn: () => activitiesService.getFeed(params),
  })
}

export function useMyActivities(params?: { page?: number; per_page?: number }) {
  return useQuery<PaginatedData<Activity>>({
    queryKey: ["activities", "me", params],
    queryFn: () => activitiesService.getMyActivities(params),
  })
}

export function useActivityStats(period?: "today" | "week" | "month") {
  return useQuery<ActivityStats>({
    queryKey: ["activities", "stats", period],
    queryFn: () => activitiesService.getStats(period),
  })
}

export function useRecentActivityCount(since?: string) {
  return useQuery<{ count: number; since: string }>({
    queryKey: ["activities", "recent-count", since],
    queryFn: () => activitiesService.getRecentCount(since),
  })
}

export function useUserActivities(userId: string | undefined, params?: { page?: number; per_page?: number }) {
  return useQuery<PaginatedData<Activity>>({
    queryKey: ["activities", "users", userId, params],
    queryFn: () => activitiesService.getUserActivities(userId!, params),
    enabled: !!userId,
  })
}