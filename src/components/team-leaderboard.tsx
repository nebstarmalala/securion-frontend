"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Award, Medal, TrendingUp, AlertTriangle, FolderKanban } from "lucide-react"
import { useTeamStats } from "@/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const rankIcons = [
  { icon: Trophy, className: "text-yellow-500" },
  { icon: Award, className: "text-gray-400" },
  { icon: Medal, className: "text-amber-600" },
]

export function TeamLeaderboard() {
  const { data, isLoading, error } = useTeamStats()

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Contributors
          </CardTitle>
          <CardDescription>Team members making the biggest impact</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load team statistics"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Contributors
          </CardTitle>
          <CardDescription>Team members making the biggest impact</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px]" />
        </CardContent>
      </Card>
    )
  }

  const findingsLeaderboard = data?.findings_leaderboard || []
  const projectsLeaderboard = data?.projects_leaderboard || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Contributors
        </CardTitle>
        <CardDescription>Team members making the biggest impact</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="findings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="findings" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Findings
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="findings" className="space-y-4 mt-6">
            {findingsLeaderboard.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No findings data available
              </div>
            ) : (
              <>
                {findingsLeaderboard.map((member, index) => {
                  const RankIcon = rankIcons[index]?.icon || TrendingUp
                  const rankClass = rankIcons[index]?.className || "text-muted-foreground"
                  const initials = member.username.substring(0, 2).toUpperCase()

                  return (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`flex-shrink-0 ${rankClass}`}>
                        <RankIcon className="h-5 w-5" />
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Rank #{index + 1}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {member.findings_count}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:inline">findings</span>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-6">
            {projectsLeaderboard.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No projects data available
              </div>
            ) : (
              <>
                {projectsLeaderboard.map((member, index) => {
                  const RankIcon = rankIcons[index]?.icon || TrendingUp
                  const rankClass = rankIcons[index]?.className || "text-muted-foreground"
                  const initials = member.username.substring(0, 2).toUpperCase()

                  return (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`flex-shrink-0 ${rankClass}`}>
                        <RankIcon className="h-5 w-5" />
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Rank #{index + 1}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {member.projects_count}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:inline">projects</span>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
