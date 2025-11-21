/**
 * Saved Searches Component
 * Comprehensive saved search management with beautiful UI
 *
 * Features:
 * - List all saved searches with tabs (My Searches, Public, Most Used)
 * - Create new saved searches with form dialog
 * - Edit existing searches
 * - Delete searches with confirmation
 * - Execute searches and view results
 * - Public/private toggle
 * - Entity type filtering
 * - Usage statistics
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Plus,
  Star,
  TrendingUp,
  Globe,
  Lock,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Copy,
  Loader2,
  Folder,
  AlertCircle,
  FileText,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useSavedSearches,
  useMySavedSearches,
  usePublicSavedSearches,
  useMostUsedSavedSearches,
  useCreateSavedSearch,
  useUpdateSavedSearch,
  useDeleteSavedSearch,
  useExecuteSavedSearch,
} from "@/lib/hooks/useSavedSearches"
import type { SavedSearch, CreateSavedSearchInput } from "@/lib/types/api"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

/**
 * Saved Search Form Dialog
 */
interface SavedSearchFormDialogProps {
  mode: "create" | "edit"
  initialData?: Partial<SavedSearch>
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

function SavedSearchFormDialog({
  mode,
  initialData,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: SavedSearchFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [entityType, setEntityType] = useState(initialData?.entity_type || "findings")
  const [isPublic, setIsPublic] = useState(initialData?.is_public || false)
  const [queryParams, setQueryParams] = useState(
    JSON.stringify(initialData?.query_params || {}, null, 2)
  )

  const createMutation = useCreateSavedSearch()
  const updateMutation = useUpdateSavedSearch()

  const isLoading = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Parse query params
      const parsedParams = JSON.parse(queryParams)

      const data: CreateSavedSearchInput = {
        name,
        description,
        entity_type: entityType,
        query_params: parsedParams,
        is_public: isPublic,
      }

      if (mode === "create") {
        await createMutation.mutateAsync(data)
      } else if (initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data,
        })
      }

      setOpen(false)
      onSuccess?.()

      // Reset form
      setName("")
      setDescription("")
      setEntityType("findings")
      setIsPublic(false)
      setQueryParams("{}")
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON in query parameters")
      } else {
        toast.error("Failed to save search")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Save New Search" : "Edit Saved Search"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Save your search query for quick access later"
              : "Update your saved search settings"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Search Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Critical Findings - Last 30 Days"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this search finds..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type *</Label>
              <Select value={entityType} onValueChange={setEntityType} required>
                <SelectTrigger id="entityType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="findings">Findings</SelectItem>
                  <SelectItem value="scopes">Scopes</SelectItem>
                  <SelectItem value="cves">CVEs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2 pt-8">
              <Label htmlFor="isPublic" className="cursor-pointer">
                {isPublic ? "Public Search" : "Private Search"}
              </Label>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="queryParams">Query Parameters (JSON) *</Label>
            <Textarea
              id="queryParams"
              placeholder={'{\n  "severity": "critical",\n  "status": "open"\n}'}
              value={queryParams}
              onChange={(e) => setQueryParams(e.target.value)}
              rows={8}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter search parameters as valid JSON
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Save Search" : "Update Search"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Saved Search Card
 */
interface SavedSearchCardProps {
  search: SavedSearch
  onExecute?: (search: SavedSearch) => void
  onEdit?: (search: SavedSearch) => void
  onDelete?: (search: SavedSearch) => void
}

function SavedSearchCard({ search, onExecute, onEdit, onDelete }: SavedSearchCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "projects":
        return Folder
      case "findings":
        return AlertCircle
      case "cves":
        return Shield
      case "scopes":
        return FileText
      default:
        return Search
    }
  }

  const EntityIcon = getEntityIcon(search.entity_type)

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="rounded-lg bg-primary/10 p-2.5 mt-0.5">
                <EntityIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <CardTitle className="text-lg truncate">{search.name}</CardTitle>
                  {search.is_public ? (
                    <Badge variant="secondary" className="gap-1 shrink-0">
                      <Globe className="h-3 w-3" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 shrink-0">
                      <Lock className="h-3 w-3" />
                      Private
                    </Badge>
                  )}
                </div>
                {search.description && (
                  <CardDescription className="line-clamp-2">
                    {search.description}
                  </CardDescription>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExecute?.(search)}>
                  <Play className="mr-2 h-4 w-4" />
                  Execute Search
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(search)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(search.query_params, null, 2))}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Parameters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>{search.entity_type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{search.use_count || 0} uses</span>
            </div>
            {search.created_at && (
              <div className="flex items-center gap-1.5">
                <span>Created {formatDistanceToNow(new Date(search.created_at))} ago</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            variant="default"
            size="sm"
            className="w-full gap-2"
            onClick={() => onExecute?.(search)}
          >
            <Play className="h-3.5 w-3.5" />
            Run Search
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Search?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{search.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(search)
                setDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * Main Saved Searches Component
 */
export function SavedSearches() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null)
  const navigate = useNavigate()

  const deleteMutation = useDeleteSavedSearch()
  const executeMutation = useExecuteSavedSearch()

  // Get different views of saved searches
  const { data: mySearches, isLoading: loadingMy } = useMySavedSearches()
  const { data: publicSearches, isLoading: loadingPublic } = usePublicSavedSearches()
  const { data: mostUsed, isLoading: loadingMostUsed } = useMostUsedSavedSearches(10)

  const handleExecute = async (search: SavedSearch) => {
    try {
      const results = await executeMutation.mutateAsync({ id: search.id })

      // Navigate to appropriate page with results
      // This is a simplified version - you may want to handle this differently
      toast.success(`Found ${results.meta.total} results`)
    } catch (error) {
      toast.error("Failed to execute search")
    }
  }

  const handleEdit = (search: SavedSearch) => {
    setEditingSearch(search)
  }

  const handleDelete = async (search: SavedSearch) => {
    try {
      await deleteMutation.mutateAsync(search.id)
    } catch (error) {
      toast.error("Failed to delete search")
    }
  }

  const isLoading = loadingMy || loadingPublic || loadingMostUsed

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Saved Searches</h2>
          <p className="text-muted-foreground mt-1">
            Manage and execute your saved search queries
          </p>
        </div>
        <SavedSearchFormDialog
          mode="create"
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Search
            </Button>
          }
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my" className="gap-2">
            <Lock className="h-4 w-4" />
            My Searches
            {mySearches?.data && (
              <Badge variant="secondary" className="ml-1.5">
                {mySearches.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="public" className="gap-2">
            <Globe className="h-4 w-4" />
            Public
            {publicSearches?.data && (
              <Badge variant="secondary" className="ml-1.5">
                {publicSearches.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="popular" className="gap-2">
            <Star className="h-4 w-4" />
            Most Used
            {mostUsed && (
              <Badge variant="secondary" className="ml-1.5">
                {mostUsed.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* My Searches Tab */}
        <TabsContent value="my" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mySearches?.data && mySearches.data.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mySearches.data.map((search) => (
                <SavedSearchCard
                  key={search.id}
                  search={search}
                  onExecute={handleExecute}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved searches yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Save your frequently used searches for quick access
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Search
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Public Searches Tab */}
        <TabsContent value="public" className="space-y-4">
          {publicSearches?.data && publicSearches.data.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publicSearches.data.map((search) => (
                <SavedSearchCard
                  key={search.id}
                  search={search}
                  onExecute={handleExecute}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No public searches available</h3>
                <p className="text-sm text-muted-foreground">
                  Public searches shared by your team will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Most Used Tab */}
        <TabsContent value="popular" className="space-y-4">
          {mostUsed && mostUsed.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mostUsed.map((search) => (
                <SavedSearchCard
                  key={search.id}
                  search={search}
                  onExecute={handleExecute}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No usage data yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start using saved searches to see popular ones here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingSearch && (
        <SavedSearchFormDialog
          mode="edit"
          initialData={editingSearch}
          open={!!editingSearch}
          onOpenChange={(open) => !open && setEditingSearch(null)}
          onSuccess={() => setEditingSearch(null)}
        />
      )}
    </div>
  )
}
