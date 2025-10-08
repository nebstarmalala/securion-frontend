"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockActivities, getUserById } from "@/lib/mock-data"
import { FolderKanban, AlertTriangle, Target, Shield } from "lucide-react"
import Link from "next/link"

const iconMap = {
  project: FolderKanban,
  finding: AlertTriangle,
  scope: Target,
  cve: Shield,
}

export function ActivityTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.slice(0, 8).map((activity) => {
            const user = getUserById(activity.userId)
            const Icon = iconMap[activity.resourceType]

            return (
              <div key={activity.id} className="flex gap-4 group">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">
                      <span className="font-medium">{user?.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                  </div>
                  <Link href="#" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                    <Icon className="h-3.5 w-3.5" />
                    {activity.resourceName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            )
          })}
        </div>
        <Link href="#" className="mt-4 block text-center text-sm text-primary hover:underline">
          View All Activity
        </Link>
      </CardContent>
    </Card>
  )
}
