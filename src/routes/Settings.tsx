/**
 * Settings Page - Comprehensive Management Hub
 *
 * Tabs:
 * - Profile: User profile management
 * - Security: Password and 2FA
 * - Preferences: Theme, language, display options
 * - Notifications: Email and in-app notifications
 * - API: API keys and integrations
 * - Team (admin): Sub-tabs for Users, Teams, Project Access
 * - System (super-admin): Sub-tabs for Cache, Queue, Logs
 */

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  Upload,
  Check,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  User,
  Lock,
  Bell,
  Palette,
  Database,
  Activity,
  AlertTriangle,
  Server,
  Key,
  Users,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings2,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  UserX,
  UserCheck,
  Search,
  Plus,
  Trash2,
  Edit,
  FolderKanban,
  UsersRound,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  HardDrive,
  BarChart3,
  Clock,
  ListChecks,
  RotateCcw,
  Download,
  Info,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts/theme-context"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/lib/contexts/auth-context"
import { usersService } from "@/lib/api/users"
import { useProjects, useProject, useAssignUsers, useRemoveUser } from "@/hooks/useProjects"
import { useCacheManagement } from "@/lib/hooks/useCache"
import { useQueueManagement } from "@/lib/hooks/useQueue"
import { getErrorLogs, clearErrorLogs, exportErrorLogs } from "@/lib/errors"
import type { ApiUser } from "@/lib/types/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

// ============================================================================
// Types
// ============================================================================

interface Team {
  id: string
  name: string
  description?: string
  members: { userId: string; role: "lead" | "member" }[]
  createdAt: string
}

interface ProjectAccess {
  id: string
  projectId: string
  projectName: string
  assigneeType: "user" | "team"
  assigneeId: string
  assigneeName: string
  permissions: string[]
  assignedAt: string
}

// ============================================================================
// Main Component
// ============================================================================

export default function SettingsPage() {
  const { user: currentUser, refreshUser, hasRole, hasPermission } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Form states for profile
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")

  // Form states for password
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Check permissions
  const isSuperAdmin = hasRole("super-admin")
  const isAdmin = hasRole("admin") || isSuperAdmin
  const canManageTeam = hasPermission("user-view") || isAdmin

  // Load user profile data
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  const handlePasswordChange = (value: string) => {
    let strength = 0
    if (value.length >= 8) strength++
    if (/[A-Z]/.test(value)) strength++
    if (/[0-9]/.test(value)) strength++
    if (/[^A-Za-z0-9]/.test(value)) strength++
    setPasswordStrength(strength)
    setNewPassword(value)
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return
    try {
      setIsSavingProfile(true)
      await usersService.updateUser(currentUser.id, { username })
      await refreshUser()
      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSavePassword = async () => {
    if (!currentUser) return
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (passwordStrength < 3) {
      toast.error("Please use a stronger password")
      return
    }

    try {
      setIsSavingPassword(true)
      await usersService.updatePassword(currentUser.id, {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordStrength(0)
      toast.success("Password updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update password")
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: "Settings" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application settings</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
              <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-background">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2 data-[state=active]:bg-background">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2 data-[state=active]:bg-background">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API</span>
              </TabsTrigger>
              {canManageTeam && (
                <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-background">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </TabsTrigger>
              )}
              {isSuperAdmin && (
                <TabsTrigger value="system" className="gap-2 data-[state=active]:bg-background">
                  <Server className="h-4 w-4" />
                  <span className="hidden sm:inline">System</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* ==================== PROFILE TAB ==================== */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-xl">
                        {currentUser?.username?.substring(0, 2).toUpperCase() || "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="gap-2" disabled>
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isSavingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex gap-2">
                        <Input id="email" type="email" value={email} disabled className="flex-1" />
                        <Badge variant="outline" className="gap-1 shrink-0 self-center">
                          <Check className="h-3 w-3" /> Verified
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                      {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role & Permissions</CardTitle>
                  <CardDescription>Your current access level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentUser?.roles?.map((role) => (
                      <Badge key={role.id} variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {role.name}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">No roles assigned</span>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ==================== SECURITY TAB ==================== */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isSavingPassword}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        disabled={isSavingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSavingPassword}
                      />
                    </div>
                  </div>

                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-colors",
                              level <= passwordStrength
                                ? passwordStrength <= 1 ? "bg-red-500"
                                  : passwordStrength === 2 ? "bg-orange-500"
                                  : passwordStrength === 3 ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {passwordStrength === 0 && "Enter a password"}
                        {passwordStrength === 1 && "Weak - Add more characters"}
                        {passwordStrength === 2 && "Fair - Add numbers or symbols"}
                        {passwordStrength === 3 && "Good - Almost there!"}
                        {passwordStrength === 4 && "Strong password"}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleSavePassword} disabled={isSavingPassword}>
                      {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable 2FA</p>
                      <p className="text-xs text-muted-foreground">Require verification code on login</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage your sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground">Active now</p>
                      </div>
                    </div>
                    <Badge variant="outline">Current</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ==================== PREFERENCES TAB ==================== */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how Securion looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", label: "Light", icon: "☀️" },
                        { value: "dark", label: "Dark", icon: "🌙" },
                        { value: "system", label: "System", icon: "💻" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value as any)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:bg-accent",
                            theme === option.value && "border-primary bg-primary/5 ring-1 ring-primary"
                          )}
                        >
                          <span className="text-xl">{option.icon}</span>
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select defaultValue="utc">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "cvss", label: "Show CVSS scores", desc: "Display on finding cards", default: true },
                    { id: "compact", label: "Compact view", desc: "Show more items in lists", default: false },
                    { id: "avatars", label: "Show avatars", desc: "Display team avatars", default: true },
                  ].map((opt, i) => (
                    <div key={opt.id}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        <Switch defaultChecked={opt.default} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ==================== NOTIFICATIONS TAB ==================== */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Choose what to receive via email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "findings", label: "New findings", desc: "When findings are created", default: true },
                    { id: "cve", label: "Critical CVE alerts", desc: "Critical CVEs affecting projects", default: true },
                    { id: "projects", label: "Project updates", desc: "Project status changes", default: true },
                    { id: "mentions", label: "Team mentions", desc: "When someone mentions you", default: true },
                  ].map((opt, i) => (
                    <div key={opt.id}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        <Switch defaultChecked={opt.default} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>In-App Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Desktop notifications</p>
                      <p className="text-xs text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Sound alerts</p>
                      <p className="text-xs text-muted-foreground">Play sound for critical alerts</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ==================== API TAB ==================== */}
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for programmatic access</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      API key management coming soon. Contact your administrator for API access.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect with other tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "Jira", desc: "Sync findings with Jira" },
                      { name: "Slack", desc: "Get Slack notifications" },
                      { name: "GitHub", desc: "Link to GitHub issues" },
                      { name: "Webhooks", desc: "Custom webhook endpoints" },
                    ].map((int) => (
                      <div key={int.name} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{int.name}</p>
                          <p className="text-xs text-muted-foreground">{int.desc}</p>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ==================== TEAM MANAGEMENT TAB ==================== */}
            {canManageTeam && (
              <TabsContent value="team" className="space-y-6">
                <TeamManagementSection currentUserId={currentUser?.id} />
              </TabsContent>
            )}

            {/* ==================== SYSTEM TAB (Super-Admin Only) ==================== */}
            {isSuperAdmin && (
              <TabsContent value="system" className="space-y-6">
                <SystemManagementSection />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// ============================================================================
// Team Management Section Component
// ============================================================================

function TeamManagementSection({ currentUserId }: { currentUserId?: string }) {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "teams">("users")

  return (
    <div className="space-y-4">
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Manage all users and assign them to project teams with specific permissions.
        </AlertDescription>
      </Alert>

      {/* Sub-tabs for Team Management */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab("users")}
            className={cn(
              "flex items-center gap-2 py-2 px-1 border-b-2 text-sm font-medium transition-colors",
              activeSubTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-4 w-4" />
            All Users
          </button>
          <button
            onClick={() => setActiveSubTab("teams")}
            className={cn(
              "flex items-center gap-2 py-2 px-1 border-b-2 text-sm font-medium transition-colors",
              activeSubTab === "teams"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <UsersRound className="h-4 w-4" />
            Teams
          </button>
        </div>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === "users" && <AllUsersSubTab currentUserId={currentUserId} />}
      {activeSubTab === "teams" && <TeamsSubTab />}
    </div>
  )
}

// All Users Sub-tab
function AllUsersSubTab({ currentUserId }: { currentUserId?: string }) {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "tester" })

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await usersService.getUsers()
      setUsers(response.data)
    } catch (error: any) {
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleStatus = async (userId: string) => {
    try {
      setIsUpdating(true)
      await usersService.toggleUserStatus(userId)
      await loadUsers()
      toast.success("User status updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      setIsUpdating(true)
      await usersService.deleteUser(userId)
      await loadUsers()
      toast.success("User removed successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to remove user")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error("Please fill in all fields")
      return
    }
    try {
      setIsUpdating(true)
      await usersService.createUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role_id: newUser.role,
      })
      await loadUsers()
      setShowAddDialog(false)
      setNewUser({ username: "", email: "", password: "", role: "tester" })
      toast.success("User created successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to create user")
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage all users in the system</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadUsers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Username</Label>
                    <Input
                      id="new-username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-role">Role</Label>
                    <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tester">Tester</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddUser} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12 opacity-50 mb-2" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <Badge key={r.id} variant="secondary" className="text-xs">
                            {r.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isUpdating}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)} disabled={user.id === currentUserId}>
                            {user.is_active ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            {user.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUserId}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Teams Sub-tab - Projects as Teams with integrated permission management
function TeamsSubTab() {
  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useProjects()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [newMember, setNewMember] = useState({
    userId: "",
    role: "member" as "member" | "lead",
  })

  const projects = projectsData?.data || []
  const selectedProject = projects.find((p) => p.id === selectedTeam)

  // Get team members from the project's team array
  const teamMembers = selectedProject?.team || []

  // Mutation hooks for API operations
  const assignUsers = useAssignUsers(selectedTeam || "")
  const removeUser = useRemoveUser(selectedTeam || "")

  // Load users for assignment
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await usersService.getUsers()
      setUsers(response.data)
    } catch (error: any) {
      toast.error("Failed to load users")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Remove this team member?")) return
    if (!selectedTeam) return

    try {
      await removeUser.mutateAsync(userId)
      await refetchProjects()
      toast.success("Member removed from team")
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member")
    }
  }

  const handleAddMember = async () => {
    if (!newMember.userId) {
      toast.error("Please select a user")
      return
    }
    if (!selectedTeam) return

    try {
      await assignUsers.mutateAsync([newMember.userId])
      await refetchProjects()
      setShowAddMemberDialog(false)
      setNewMember({ userId: "", role: "member" })
      toast.success("Member added to team")
    } catch (error: any) {
      toast.error(error.message || "Failed to add member")
    }
  }


  // Team list view
  if (!selectedTeam) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Teams</CardTitle>
              <CardDescription>Each project is a team. Click on a team to manage members and permissions.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/projects"}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Manage Projects
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : projects.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FolderKanban className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>No projects yet</p>
              <p className="text-sm">Create a project to start managing team members</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedTeam(project.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FolderKanban className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {project.client || "No client"}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Click to manage team</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Team detail view with member management
  return (
    <div className="space-y-4">
      {/* Back button and team header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(null)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Teams
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{selectedProject?.name}</CardTitle>
                <CardDescription>
                  {selectedProject?.client || "No client"} • {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
            <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Add a user to the "{selectedProject?.name}" team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select User</Label>
                    <Select
                      value={newMember.userId}
                      onValueChange={(v) => setNewMember({ ...newMember, userId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <SelectItem value="" disabled>Loading...</SelectItem>
                        ) : users.length === 0 ? (
                          <SelectItem value="" disabled>No users available</SelectItem>
                        ) : (
                          users
                            .filter((u) => !teamMembers.some((m: any) => m.id === u.id))
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-[10px]">
                                      {user.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{user.username}</span>
                                  <span className="text-muted-foreground">({user.email})</span>
                                </div>
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(v) => setNewMember({ ...newMember, role: v as "member" | "lead" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <div className="flex flex-col">
                            <span>Member</span>
                            <span className="text-xs text-muted-foreground">Standard team member access</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="lead">
                          <div className="flex flex-col">
                            <span>Lead</span>
                            <span className="text-xs text-muted-foreground">Team lead with full access</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddMember} disabled={assignUsers.isPending}>
                    {assignUsers.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Member"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground border rounded-lg">
              <Users className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>No team members yet</p>
              <p className="text-sm">Click "Add Member" to assign users to this team</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member: any) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {(member.name || member.username || "U").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{member.name || member.username}</p>
                      {member.email && (
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={member.role === "lead" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {member.role || "member"}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive shrink-0"
                    onClick={() => handleRemoveMember(member.id)}
                    title="Remove from team"
                    disabled={removeUser.isPending}
                  >
                    {removeUser.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// System Management Section Component (Super-Admin Only)
// ============================================================================

function SystemManagementSection() {
  const [activeSubTab, setActiveSubTab] = useState<"cache" | "queue" | "logs">("cache")

  return (
    <div className="space-y-4">
      <Alert>
        <Settings2 className="h-4 w-4" />
        <AlertDescription>
          System management is restricted to super administrators. Changes affect the entire application.
        </AlertDescription>
      </Alert>

      {/* Sub-tabs for System Management */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab("cache")}
            className={cn(
              "flex items-center gap-2 py-2 px-1 border-b-2 text-sm font-medium transition-colors",
              activeSubTab === "cache"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Database className="h-4 w-4" />
            Cache
          </button>
          <button
            onClick={() => setActiveSubTab("queue")}
            className={cn(
              "flex items-center gap-2 py-2 px-1 border-b-2 text-sm font-medium transition-colors",
              activeSubTab === "queue"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Activity className="h-4 w-4" />
            Queue
          </button>
          <button
            onClick={() => setActiveSubTab("logs")}
            className={cn(
              "flex items-center gap-2 py-2 px-1 border-b-2 text-sm font-medium transition-colors",
              activeSubTab === "logs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            Logs
          </button>
        </div>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === "cache" && <CacheSubTab />}
      {activeSubTab === "queue" && <QueueSubTab />}
      {activeSubTab === "logs" && <LogsSubTab />}
    </div>
  )
}

// Cache Management Sub-tab
function CacheSubTab() {
  const {
    statistics,
    health,
    isLoadingStatistics,
    isLoadingHealth,
    statisticsError,
    healthError,
    refetchStatistics,
    refetchHealth,
    clearAll,
    clearByType,
    warmDashboard,
    warmAll,
    isClearingAll,
    isWarmingDashboard,
    isWarmingAll,
  } = useCacheManagement()

  const [showClearDialog, setShowClearDialog] = useState(false)

  const getHealthIcon = (status?: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cache Management</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchStatistics()
              refetchHealth()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {(statisticsError || healthError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {statisticsError?.message || healthError?.message || "Failed to load cache data"}
          </AlertDescription>
        </Alert>
      )}

      {/* Health Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {health ? getHealthIcon(health.status) : <Activity className="h-5 w-5" />}
            Cache Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHealth ? (
            <Skeleton className="h-16 w-full" />
          ) : health ? (
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={health.status === "healthy" ? "default" : "destructive"}>
                  {health.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Connection</p>
                <Badge variant={health.connection ? "default" : "destructive"}>
                  {health.connection ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Latency</p>
                <p className="text-sm font-medium">{health.latency_ms}ms</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Memory Available</p>
                <p className="text-sm font-medium">{(health.memory_available / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No health data available</p>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              Total Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStatistics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold">{statistics?.total_keys.toLocaleString() || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStatistics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold">{((statistics?.total_size || 0) / 1024 / 1024).toFixed(2)} MB</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStatistics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-green-500">{((statistics?.hit_rate || 0) * 100).toFixed(1)}%</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Miss Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStatistics ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-red-500">{((statistics?.miss_rate || 0) * 100).toFixed(1)}%</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Memory Usage */}
      {statistics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{(statistics.memory_usage.used / 1024 / 1024).toFixed(2)} MB / {(statistics.memory_usage.total / 1024 / 1024).toFixed(2)} MB</span>
                <span className="font-bold">{statistics.memory_usage.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={statistics.memory_usage.percentage} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cache Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => warmDashboard()}
              disabled={isWarmingDashboard}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isWarmingDashboard ? "Warming..." : "Warm Dashboard"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => warmAll()}
              disabled={isWarmingAll}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isWarmingAll ? "Warming..." : "Warm All"}
            </Button>
            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Cache
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear All Cache</DialogTitle>
                  <DialogDescription>
                    This will clear all cached data. This may temporarily impact performance.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowClearDialog(false)}>Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clearAll()
                      setShowClearDialog(false)
                    }}
                    disabled={isClearingAll}
                  >
                    {isClearingAll ? "Clearing..." : "Clear All"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Queue Monitoring Sub-tab
function QueueSubTab() {
  const {
    status,
    metrics,
    failedJobs,
    isLoadingStatus,
    isLoadingMetrics,
    isLoadingFailedJobs,
    statusError,
    metricsError,
    refetchStatus,
    refetchMetrics,
    refetchFailedJobs,
    retryAllFailed,
    clearFailed,
    isRetryingAllFailed,
    isClearingFailed,
  } = useQueueManagement({ page: 1, per_page: 10 })

  const getStatusIcon = (queueStatus?: string) => {
    switch (queueStatus) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "failing":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Queue Monitoring</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchStatus()
            refetchMetrics()
            refetchFailedJobs()
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {(statusError || metricsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {statusError?.message || metricsError?.message || "Failed to load queue data"}
          </AlertDescription>
        </Alert>
      )}

      {/* Queue Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {status ? getStatusIcon(status.status) : <Activity className="h-5 w-5" />}
            Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStatus ? (
            <Skeleton className="h-16 w-full" />
          ) : status ? (
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={status.status === "operational" ? "default" : "destructive"}>
                  {status.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Queues</p>
                <p className="text-sm font-medium">{status.active_queues || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Workers</p>
                <p className="text-sm font-medium">{status.workers || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Jobs</p>
                <p className="text-sm font-medium">{status.pending_jobs || 0}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No status data available</p>
          )}
        </CardContent>
      </Card>

      {/* Metrics */}
      {metrics && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                Total Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics.total_processed?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">{metrics.successful?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">{metrics.failed?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Avg Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics.average_processing_time?.toFixed(2) || 0}s</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Failed Jobs Actions */}
      {failedJobs && failedJobs.total > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-red-500">
                Failed Jobs ({failedJobs.total})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retryAllFailed()}
                  disabled={isRetryingAllFailed}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isRetryingAllFailed ? "Retrying..." : "Retry All"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Clear all failed jobs?")) clearFailed()
                  }}
                  disabled={isClearingFailed}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isClearingFailed ? "Clearing..." : "Clear All"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

// Error Logs Sub-tab
function LogsSubTab() {
  const [logs, setLogs] = useState<ReturnType<typeof getErrorLogs>>([])
  const [selectedLog, setSelectedLog] = useState<(typeof logs)[0] | null>(null)

  const loadLogs = () => {
    setLogs(getErrorLogs())
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleClearLogs = () => {
    if (!confirm("Clear all error logs?")) return
    clearErrorLogs()
    setLogs([])
    toast.success("Logs cleared")
  }

  const getSeverityIcon = (status?: number) => {
    if (!status) return <Info className="h-4 w-4 text-blue-500" />
    if (status >= 500) return <XCircle className="h-4 w-4 text-red-500" />
    if (status >= 400) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <Info className="h-4 w-4 text-blue-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Error Logs</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportErrorLogs()} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearLogs} disabled={logs.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Error logs are stored locally in your browser. They are cleared when you clear browser data.
        </AlertDescription>
      </Alert>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>No error logs found</p>
              <p className="text-sm">Errors will appear here when they occur</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell>{getSeverityIcon(log.status)}</TableCell>
                      <TableCell className="font-medium max-w-[300px] truncate">
                        {log.message}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {log.url || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Message</p>
                  <p className="text-sm font-medium">{selectedLog.message}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={selectedLog.status && selectedLog.status >= 500 ? "destructive" : "secondary"}>
                    {selectedLog.status || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">URL</p>
                  <p className="text-sm font-mono break-all">{selectedLog.url || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timestamp</p>
                  <p className="text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
              </div>
              {selectedLog.stack && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stack Trace</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
                    {selectedLog.stack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
