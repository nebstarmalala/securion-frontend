/**
 * Webhooks Page
 *
 * Manages webhook configurations for external integrations.
 * Allows creation, testing, and monitoring of webhook deliveries.
 */

import { useState } from "react"
import {
  Webhook,
  Plus,
  Search,
  RefreshCw,
  TestTube,
  History,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ExternalLink,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useWebhooks,
  useWebhookEvents,
  useCreateWebhook,
  useDeleteWebhook,
  useToggleWebhook,
  useTestWebhook,
  useRegenerateWebhookSecret,
  useWebhookDeliveries,
  useRetryWebhookDelivery,
} from "@/lib/hooks/useWebhooks"
import type { Webhook as WebhookType, CreateWebhookInput } from "@/lib/types"

export default function WebhooksPage() {
  const [activeTab, setActiveTab] = useState<"webhooks" | "deliveries">("webhooks")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookType | null>(null)
  const [showSecretDialog, setShowSecretDialog] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<CreateWebhookInput>>({
    name: "",
    url: "",
    description: "",
    events: [],
    is_active: true,
  })

  // Queries
  const { data: webhooksData, isLoading, refetch } = useWebhooks()
  const { data: eventsData } = useWebhookEvents()
  const { data: deliveriesData, isLoading: deliveriesLoading } = useWebhookDeliveries(
    selectedWebhook?.id
  )

  // Mutations
  const createWebhook = useCreateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const toggleWebhook = useToggleWebhook()
  const testWebhook = useTestWebhook()
  const regenerateSecret = useRegenerateWebhookSecret()
  const retryDelivery = useRetryWebhookDelivery()

  const webhooks = webhooksData?.data || []
  const events = Array.isArray(eventsData) ? eventsData : []
  const deliveries = deliveriesData?.data || []

  // Filter webhooks
  const filteredWebhooks = webhooks.filter((webhook) => {
    const matchesSearch =
      searchQuery === "" ||
      webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.url.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && webhook.is_active) ||
      (statusFilter === "inactive" && !webhook.is_active)

    return matchesSearch && matchesStatus
  })

  const handleToggle = async (webhookId: string) => {
    await toggleWebhook.mutateAsync(webhookId)
  }

  const handleDelete = async (webhookId: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      await deleteWebhook.mutateAsync(webhookId)
    }
  }

  const handleTest = async (webhookId: string) => {
    await testWebhook.mutateAsync(webhookId)
  }

  const handleRegenerateSecret = async (webhookId: string) => {
    const result = await regenerateSecret.mutateAsync(webhookId)
    setNewSecret(result.secret)
    setShowSecretDialog(true)
  }

  const handleRetryDelivery = async (deliveryId: string) => {
    await retryDelivery.mutateAsync(deliveryId)
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.url || !formData.events?.length) return

    await createWebhook.mutateAsync(formData as CreateWebhookInput)
    setShowCreateDialog(false)
    setFormData({
      name: "",
      url: "",
      description: "",
      events: [],
      is_active: true,
    })
  }

  const toggleEvent = (eventName: string) => {
    const currentEvents = formData.events || []
    if (currentEvents.includes(eventName)) {
      setFormData({
        ...formData,
        events: currentEvents.filter((e) => e !== eventName),
      })
    } else {
      setFormData({
        ...formData,
        events: [...currentEvents, eventName],
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all"

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: "Webhooks" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
              <p className="text-muted-foreground mt-1">
                Configure webhooks to send events to external services
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{webhooks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {webhooks.filter((w) => w.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webhooks.reduce((sum, w) => sum + w.delivery_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Events</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">Event types</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="webhooks" className="flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                Webhooks
                <Badge variant="secondary">{webhooks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="deliveries"
                className="flex items-center gap-2"
                disabled={!selectedWebhook}
              >
                <History className="h-4 w-4" />
                Deliveries
                {selectedWebhook && (
                  <Badge variant="secondary">{selectedWebhook.delivery_count}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Webhooks Tab */}
            <TabsContent value="webhooks" className="space-y-4 mt-4">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search webhooks..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Webhooks List */}
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[120px]" />
                  ))}
                </div>
              ) : filteredWebhooks.length === 0 ? (
                <EmptyState
                  icon={Webhook}
                  title={hasActiveFilters ? "No webhooks match your filters" : "No webhooks yet"}
                  description={
                    hasActiveFilters
                      ? "Try adjusting your search criteria"
                      : "Create your first webhook to send events to external services"
                  }
                  action={
                    hasActiveFilters ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Webhook
                      </Button>
                    )
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredWebhooks.map((webhook) => (
                    <Card key={webhook.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{webhook.name}</h3>
                              <Badge variant={webhook.is_active ? "default" : "secondary"}>
                                {webhook.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 font-mono">
                              {webhook.url}
                            </p>
                            {webhook.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {webhook.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex flex-wrap gap-1">
                                {webhook.events.slice(0, 3).map((event) => (
                                  <Badge key={event} variant="outline" className="text-xs">
                                    {event}
                                  </Badge>
                                ))}
                                {webhook.events.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{webhook.events.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {webhook.delivery_count} deliveries
                              {webhook.last_delivered_at &&
                                ` · Last: ${new Date(webhook.last_delivered_at).toLocaleString()}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={webhook.is_active}
                              onCheckedChange={() => handleToggle(webhook.id)}
                            />

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleTest(webhook.id)}>
                                  <TestTube className="mr-2 h-4 w-4" />
                                  Test Webhook
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedWebhook(webhook)
                                    setActiveTab("deliveries")
                                  }}
                                >
                                  <History className="mr-2 h-4 w-4" />
                                  View Deliveries
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRegenerateSecret(webhook.id)}
                                >
                                  <KeyRound className="mr-2 h-4 w-4" />
                                  Regenerate Secret
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(webhook.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Deliveries Tab */}
            <TabsContent value="deliveries" className="space-y-4 mt-4">
              {selectedWebhook && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deliveries for {selectedWebhook.name}</CardTitle>
                    <CardDescription>Recent webhook delivery attempts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deliveriesLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-[60px]" />
                        ))}
                      </div>
                    ) : deliveries.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No deliveries yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {deliveries.map((delivery) => (
                          <div
                            key={delivery.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(delivery.status)}
                              <div>
                                <p className="font-medium text-sm">{delivery.event}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(delivery.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {delivery.response_code && (
                                <Badge
                                  variant={
                                    delivery.response_code >= 200 && delivery.response_code < 300
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {delivery.response_code}
                                </Badge>
                              )}
                              {delivery.status === "failed" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRetryDelivery(delivery.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Create Webhook Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Webhook</DialogTitle>
                <DialogDescription>
                  Configure a webhook to send events to an external URL
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="My Webhook"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://example.com/webhook"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Describe what this webhook is for..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Events</Label>
                  <div className="grid gap-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                    {events.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Loading events...</p>
                    ) : (
                      events.map((event) => (
                        <div key={event.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={event.name}
                            checked={formData.events?.includes(event.name)}
                            onCheckedChange={() => toggleEvent(event.name)}
                          />
                          <label
                            htmlFor={event.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {event.name}
                            <span className="text-xs text-muted-foreground ml-2">
                              {event.description}
                            </span>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    createWebhook.isPending ||
                    !formData.name ||
                    !formData.url ||
                    !formData.events?.length
                  }
                >
                  {createWebhook.isPending ? "Creating..." : "Create Webhook"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Secret Dialog */}
          <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Webhook Secret</DialogTitle>
                <DialogDescription>
                  Copy this secret and update your endpoint. It won't be shown again.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {newSecret}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(newSecret || "")
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowSecretDialog(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
