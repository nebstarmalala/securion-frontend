"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flag, Play, Pause, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ApiProject } from "@/lib/types/api"
import { differenceInDays, format, isAfter, isBefore } from "date-fns"

interface ProjectTimelineProps {
  project: ApiProject
}

export function ProjectTimeline({ project }: ProjectTimelineProps) {
  const startDate = new Date(project.start_date)
  const endDate = new Date(project.end_date)
  const today = new Date()

  const totalDays = differenceInDays(endDate, startDate)
  const daysElapsed = Math.max(0, differenceInDays(today, startDate))
  const daysRemaining = Math.max(0, differenceInDays(endDate, today))
  const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100)

  const isNotStarted = isBefore(today, startDate)
  const isInProgress = isAfter(today, startDate) && isBefore(today, endDate)
  const isCompleted = isAfter(today, endDate) || project.status === "completed"

  // Calculate quarter milestones
  const quarterDays = totalDays / 4
  const milestones = [
    {
      name: "Project Start",
      date: startDate,
      icon: Flag,
      status: "completed" as const,
    },
    {
      name: "25% Complete",
      date: new Date(startDate.getTime() + quarterDays * 24 * 60 * 60 * 1000),
      icon: Play,
      status: (daysElapsed >= quarterDays ? "completed" : "pending") as const,
    },
    {
      name: "50% Complete",
      date: new Date(startDate.getTime() + quarterDays * 2 * 24 * 60 * 60 * 1000),
      icon: Clock,
      status: (daysElapsed >= quarterDays * 2 ? "completed" : "pending") as const,
    },
    {
      name: "75% Complete",
      date: new Date(startDate.getTime() + quarterDays * 3 * 24 * 60 * 60 * 1000),
      icon: Pause,
      status: (daysElapsed >= quarterDays * 3 ? "completed" : "pending") as const,
    },
    {
      name: "Project End",
      date: endDate,
      icon: CheckCircle2,
      status: (isCompleted ? "completed" : "pending") as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Timeline
        </CardTitle>
        <CardDescription>Track project progress and key milestones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
          <div className="text-center">
            <p className="text-2xl font-bold">{daysElapsed}</p>
            <p className="text-xs text-muted-foreground mt-1">Days Elapsed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Progress</p>
          </div>
          <div className="text-center">
            <p className={cn(
              "text-2xl font-bold",
              daysRemaining <= 7 && !isCompleted ? "text-red-600 dark:text-red-400" : ""
            )}>
              {isCompleted ? 0 : daysRemaining}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Days Remaining</p>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-6 left-0 right-0 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isNotStarted ? "bg-gray-400" :
                isCompleted ? "bg-green-500" :
                daysRemaining <= 7 ? "bg-yellow-500" :
                "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Milestones */}
          <div className="relative flex justify-between pt-2">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon
              const position = (index / (milestones.length - 1)) * 100
              const isActive = milestone.status === "completed"

              return (
                <div key={index} className="flex flex-col items-center" style={{ width: "20%" }}>
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Label */}
                  <div className="mt-4 text-center">
                    <p className={cn(
                      "text-xs font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {milestone.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(milestone.date, "MMM d, yyyy")}
                    </p>
                    {index === 0 && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Start
                      </Badge>
                    )}
                    {index === milestones.length - 1 && (
                      <Badge
                        variant={isCompleted ? "default" : "outline"}
                        className="mt-2 text-xs"
                      >
                        {isCompleted ? "Completed" : "Target"}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center">
          {isNotStarted && (
            <Badge variant="outline" className="gap-2">
              <Clock className="h-3 w-3" />
              Not Started - Begins {format(startDate, "MMM d, yyyy")}
            </Badge>
          )}
          {isInProgress && (
            <Badge className="gap-2 bg-blue-600">
              <Play className="h-3 w-3" />
              In Progress - {daysRemaining} days remaining
            </Badge>
          )}
          {isCompleted && (
            <Badge className="gap-2 bg-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>

        {/* Date Range */}
        <div className="flex items-center justify-between text-sm pt-4 border-t">
          <div>
            <p className="text-muted-foreground">Start Date</p>
            <p className="font-medium mt-1">{format(startDate, "MMMM d, yyyy")}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium mt-1">{totalDays} days</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">End Date</p>
            <p className="font-medium mt-1">{format(endDate, "MMMM d, yyyy")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
