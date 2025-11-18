/**
 * Global Search Component
 * Enhanced search with React Query, autocomplete, and search history
 */

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Loader2, FileText, FolderKanban, Target, Shield, Clock, X, Star, ArrowRight } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useCombinedSearch } from "@/lib/hooks/useSearch"
import { useMostUsedSavedSearches } from "@/lib/hooks/useSavedSearches"
import { cn } from "@/lib/utils"

interface GlobalSearchProps {
  trigger?: React.ReactNode
}

export function GlobalSearch({ trigger }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  // Use combined search hook with debouncing, suggestions, and history
  const {
    results,
    isLoading,
    suggestions,
    history,
    addToHistory,
    removeFromHistory,
  } = useCombinedSearch(query, { debounceMs: 300 })

  // Get popular saved searches
  const { data: popularSearches } = useMostUsedSavedSearches(3)

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback((item: any) => {
    // Add to history
    if (query.trim()) {
      addToHistory(query)
    }

    setOpen(false)
    setQuery("")

    // Navigate to the appropriate page based on type
    const itemType = item.type?.toLowerCase()

    // Handle direct URL navigation if available
    if (item.url) {
      navigate(item.url)
      return
    }

    // Fallback to type-based navigation
    switch (itemType) {
      case "project":
      case "projects":
        navigate(`/projects/${item.id}`)
        break
      case "finding":
      case "findings":
        // For findings, we need to extract project and scope IDs from metadata
        const findingMetadata = item.metadata || {}
        if (findingMetadata.project_id && findingMetadata.scope_id) {
          navigate(`/projects/${findingMetadata.project_id}/scopes/${findingMetadata.scope_id}/findings/${item.id}`)
        } else {
          toast.error("Cannot navigate to finding: missing context")
        }
        break
      case "scope":
      case "scopes":
        // For scopes, we need the project ID
        const scopeMetadata = item.metadata || {}
        if (scopeMetadata.project_id) {
          navigate(`/projects/${scopeMetadata.project_id}/scopes/${item.id}`)
        } else {
          toast.error("Cannot navigate to scope: missing project context")
        }
        break
      case "cve":
      case "cves":
        navigate(`/cve-tracking/${item.id}`)
        break
      default:
        toast.error("Unknown result type")
    }
  }, [navigate, query, addToHistory])

  // Handle history click
  const handleHistoryClick = useCallback((historyQuery: string) => {
    setQuery(historyQuery)
    addToHistory(historyQuery)
  }, [addToHistory])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: any) => {
    if (suggestion.id) {
      // If it has an ID, navigate to it
      handleSelect(suggestion)
    } else {
      // Otherwise, use it as a search query
      setQuery(suggestion.value)
      addToHistory(suggestion.value)
    }
  }, [handleSelect, addToHistory])

  const getIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderKanban className="mr-2 h-4 w-4" />
      case "finding":
        return <Shield className="mr-2 h-4 w-4" />
      case "scope":
        return <Target className="mr-2 h-4 w-4" />
      case "cve":
        return <FileText className="mr-2 h-4 w-4" />
      default:
        return <Search className="mr-2 h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "Projects"
      case "finding":
        return "Findings"
      case "scope":
        return "Scopes"
      case "cve":
        return "CVEs"
      default:
        return "Other"
    }
  }

  // Flatten all results for display
  const allResults = results
    ? [
        ...(results.data?.projects || []),
        ...(results.data?.findings || []),
        ...(results.data?.scopes || []),
        ...(results.data?.cves || []),
      ]
    : []

  const hasResults = allResults.length > 0
  const hasHistory = history && history.length > 0
  const hasSuggestions = suggestions && suggestions.length > 0
  const hasPopularSearches = popularSearches && popularSearches.length > 0

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">Search...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search projects, findings, scopes, CVEs..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {/* Loading State */}
          {isLoading && query.length >= 2 && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-3" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && hasResults && query.length >= 2 && (
            <CommandGroup heading={`Results (${allResults.length})`}>
              {allResults.slice(0, 10).map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={result.id}
                  onSelect={() => handleSelect(result)}
                  className="cursor-pointer flex items-start gap-3 p-3"
                >
                  <div className={cn(
                    "rounded-md p-1.5 mt-0.5",
                    result.type === "projects" ? "bg-blue-100 text-blue-600" :
                    result.type === "findings" ? "bg-red-100 text-red-600" :
                    result.type === "cves" ? "bg-purple-100 text-purple-600" :
                    "bg-green-100 text-green-600"
                  )}>
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getTypeLabel(result.type)}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </CommandItem>
              ))}
              {allResults.length > 10 && (
                <div className="px-3 py-2 text-center text-xs text-muted-foreground border-t">
                  {allResults.length - 10} more results available
                </div>
              )}
            </CommandGroup>
          )}

          {/* Suggestions */}
          {!isLoading && hasSuggestions && query.length >= 2 && (
            <>
              {hasResults && <CommandSeparator />}
              <CommandGroup heading="Suggestions">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <CommandItem
                    key={`suggestion-${index}`}
                    value={suggestion.value}
                    onSelect={() => handleSuggestionClick(suggestion)}
                    className="cursor-pointer flex items-center gap-3 p-3"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{suggestion.value}</span>
                    {suggestion.type && (
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(suggestion.type)}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* No Results */}
          {!isLoading && !hasResults && query.length >= 2 && (
            <CommandEmpty>
              <div className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium mb-1">No results found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* Too Short */}
          {!isLoading && query.length > 0 && query.length < 2 && (
            <CommandEmpty>
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Type at least 2 characters to search...
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* Recent Searches */}
          {!query && hasHistory && (
            <CommandGroup heading="Recent Searches">
              {history.slice(0, 5).map((item, index) => (
                <CommandItem
                  key={`history-${index}`}
                  value={item}
                  onSelect={() => handleHistoryClick(item)}
                  className="cursor-pointer flex items-center gap-3 p-3 group"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{item}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromHistory(item)
                    }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Popular Saved Searches */}
          {!query && hasPopularSearches && (
            <>
              {hasHistory && <CommandSeparator />}
              <CommandGroup heading="Popular Saved Searches">
                {popularSearches.map((savedSearch) => (
                  <CommandItem
                    key={savedSearch.id}
                    value={savedSearch.name}
                    onSelect={() => {
                      setQuery(savedSearch.name)
                      setOpen(false)
                    }}
                    className="cursor-pointer flex items-center gap-3 p-3"
                  >
                    <Star className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{savedSearch.name}</p>
                      {savedSearch.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {savedSearch.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {savedSearch.use_count || 0} uses
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Empty State */}
          {!query && !hasHistory && !hasPopularSearches && (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium mb-1">Start searching</p>
              <p className="text-xs text-muted-foreground">
                Search across projects, findings, scopes, and CVEs
              </p>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
