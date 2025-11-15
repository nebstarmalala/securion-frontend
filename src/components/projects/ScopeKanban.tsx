"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ApiScope } from "@/lib/types/api"
import { Target, Circle } from "lucide-react"
import { Link } from "react-router-dom"

interface ScopeKanbanProps {
  scopes: ApiScope[]
  projectId: string
}

type ScopeStatus = "in-scope" | "out-of-scope" | "pending"

const statusColumns: { status: ScopeStatus; label: string; color: string }[] = [
  { status: "in-scope", label: "In Scope", color: "bg-green-100 dark:bg-green-900" },
  { status: "pending", label: "Pending Review", color: "bg-yellow-100 dark:bg-yellow-900" },
  { status: "out-of-scope", label: "Out of Scope", color: "bg-red-100 dark:bg-red-900" },
]

export function ScopeKanban({ scopes, projectId }: ScopeKanbanProps) {
  const getScopesByStatus = (status: ScopeStatus) => {
    return scopes.filter((scope) => scope.status === status)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statusColumns.map((column) => {
        const columnScopes = getScopesByStatus(column.status)

        return (
          <Card key={column.status} className={cn("border-t-4", column.color)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Circle className={cn("h-3 w-3 fill-current",
                    column.status === "in-scope" ? "text-green-600" :
                    column.status === "pending" ? "text-yellow-600" :
                    "text-red-600"
                  )} />
                  {column.label}
                </CardTitle>
                <Badge variant="secondary">{columnScopes.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {columnScopes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Target className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                    <p className="text-xs text-muted-foreground">No scopes</p>
                  </div>
                ) : (
                  columnScopes.map((scope) => (
                    <Link
                      key={scope.id}
                      to={`/projects/${projectId}/scopes/${scope.id}`}
                      className="block"
                    >
                      <div className="group p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all cursor-pointer">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                              {scope.name}
                            </p>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {scope.type}
                            </Badge>
                          </div>
                          <code className="text-xs text-muted-foreground font-mono break-all line-clamp-1">
                            {scope.target}
                          </code>
                          {scope.port && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Port: {scope.port}</span>
                              {scope.protocol && (
                                <>
                                  <span>•</span>
                                  <span>{scope.protocol}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
