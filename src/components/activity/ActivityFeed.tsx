import { useState } from "react"
import { useActivityFeed } from "@/hooks"
import { ActivityItem } from "./ActivityItem"
import { ActivityFilters } from "./ActivityFilters"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { ActivityQueryParams } from "@/lib/types/api"

interface ActivityFeedProps {
  filters?: ActivityQueryParams
  showFilters?: boolean
}

export function ActivityFeed({ filters: initialFilters, showFilters = true }: ActivityFeedProps) {
  const [filters, setFilters] = useState<ActivityQueryParams>(initialFilters || {})
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useActivityFeed({
    ...filters,
    page,
    per_page: 20,
  })

  const handleLoadMore = () => {
    if (data?.meta && data.meta.current_page < data.meta.last_page) {
      setPage((prev) => prev + 1)
    }
  }

  const handleFilterChange = (newFilters: ActivityQueryParams) => {
    setFilters(newFilters)
    setPage(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <ActivityFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="space-y-2">
        {data && data.data.length > 0 ? (
          <>
            {data.data.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}

            {data.meta.current_page < data.meta.last_page && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No activity to display
          </div>
        )}
      </div>
    </div>
  )
}