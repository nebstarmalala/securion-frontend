import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mockProjects } from "@/lib/mock-data"
import { Upload, Check, Eye, EyeOff, Plus, MoreVertical, Shield, UserCheck, UserX, Briefcase, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts/theme-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/contexts/auth-context"
import { usersService } from "@/lib/api/users"
import type { ApiUser, UpdateUserInput, UpdatePasswordInput } from "@/lib/types/api"
import { toast } from "sonner"

const availablePermissions = [
  { id: "admin", label: "Admin Access", description: "Full project access and team management" },
  { id: "projects", label: "Projects", description: "View and edit project details" },
  { id: "findings", label: "Findings", description: "Add and edit security findings" },
  { id: "cves", label: "CVE Tracking", description: "Monitor and manage CVEs" },
  { id: "reports", label: "Reports", description: "Generate and export reports" },
  { id: "settings", label: "Settings", description: "Modify project settings" },
]

export default function SettingsPage() {
  const { user: currentUser, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [teamMembers, setTeamMembers] = useState<ApiUser[]>([])
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)

  // Form states for profile
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")

  // Form states for password
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Load user profile data
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoadingTeam(true)
        const response = await usersService.getUsers()
        setTeamMembers(response.data)
      } catch (error: any) {
        console.error("Failed to load team members:", error)
        toast.error("Failed to load team members", {
          description: error.message || "An error occurred while loading team members",
        })
      } finally {
        setIsLoadingTeam(false)
      }
    }

    loadTeamMembers()
  }, [])

  const handlePasswordChange = (value: string) => {
    // Simple password strength calculation
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
      const updateData: UpdateUserInput = {
        username,
      }

      await usersService.updateUser(currentUser.id, updateData)
      await refreshUser()

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully",
      })
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile", {
        description: error.message || "An error occurred while updating your profile",
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSavePassword = async () => {
    if (!currentUser) return

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Validation error", {
        description: "Please fill in all password fields",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Validation error", {
        description: "New passwords do not match",
      })
      return
    }

    if (passwordStrength < 3) {
      toast.error("Validation error", {
        description: "Please use a stronger password",
      })
      return
    }

    try {
      setIsSavingPassword(true)
      const passwordData: UpdatePasswordInput = {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      }

      await usersService.updatePassword(currentUser.id, passwordData)

      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordStrength(0)

      toast.success("Password updated", {
        description: "Your password has been updated successfully",
      })
    } catch (error: any) {
      console.error("Failed to update password:", error)
      toast.error("Failed to update password", {
        description: error.message || "An error occurred while updating your password",
      })
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setIsLoading(true)
      await usersService.toggleUserStatus(userId)

      // Refresh team members list
      const response = await usersService.getUsers()
      setTeamMembers(response.data)

      toast.success("User status updated", {
        description: "User status has been toggled successfully",
      })
    } catch (error: any) {
      console.error("Failed to toggle user status:", error)
      toast.error("Failed to update user status", {
        description: error.message || "An error occurred while updating user status",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoading(true)
      await usersService.deleteUser(userId)

      // Refresh team members list
      const response = await usersService.getUsers()
      setTeamMembers(response.data)

      toast.success("User removed", {
        description: "User has been removed successfully",
      })
    } catch (error: any) {
      console.error("Failed to delete user:", error)
      toast.error("Failed to remove user", {
        description: error.message || "An error occurred while removing user",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManagePermissions = (memberId: string) => {
    // TODO: Implement permission management when backend API is ready
    toast.info("Coming soon", {
      description: "Permission management will be available soon",
    })
  }

  const handleManageProjects = (memberId: string) => {
    // TODO: Implement project assignment when backend API is ready
    toast.info("Coming soon", {
      description: "Project assignment will be available soon",
    })
  }

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: "Settings" }]}>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="team">Team Management</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">
                        {currentUser?.username?.substring(0, 2).toUpperCase() || "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" className="gap-2 bg-transparent" disabled>
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
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
                      <Input id="email" type="email" value={email} disabled />
                      <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
                        <Check className="h-4 w-4 mr-2" />
                        Verified
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Your email address is verified and cannot be changed.</p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="gap-2">
                      {isSavingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
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
                        disabled={isSavingPassword}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      disabled={isSavingPassword}
                    />
                    {/* Password Strength Meter */}
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength
                                ? passwordStrength === 1
                                  ? "bg-red-500"
                                  : passwordStrength === 2
                                    ? "bg-orange-500"
                                    : passwordStrength === 3
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {passwordStrength === 0 && "Enter a password"}
                        {passwordStrength === 1 && "Weak password"}
                        {passwordStrength === 2 && "Fair password"}
                        {passwordStrength === 3 && "Good password"}
                        {passwordStrength === 4 && "Strong password"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSavingPassword}
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <p className="text-sm font-medium">Password requirements:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                        At least 8 characters long
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                        Contains uppercase letter
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                        Contains number
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                        Contains special character
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSavePassword} disabled={isSavingPassword} className="gap-2">
                      {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isSavingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Enable 2FA</p>
                      <p className="text-xs text-muted-foreground">
                        Require a verification code in addition to your password
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage your active sessions across devices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium">MacBook Pro - Chrome</p>
                        <p className="text-xs text-muted-foreground">San Francisco, CA • Current session</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Current
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium">iPhone 15 - Safari</p>
                        <p className="text-xs text-muted-foreground">San Francisco, CA • 2 hours ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how Securion looks for you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <RadioGroup value={theme} onValueChange={setTheme}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="font-normal cursor-pointer">
                          Light
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark" className="font-normal cursor-pointer">
                          Dark
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system" className="font-normal cursor-pointer">
                          System
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="pst">
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                        <SelectItem value="cst">Central Time (CT)</SelectItem>
                        <SelectItem value="est">Eastern Time (ET)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Date Format</Label>
                    <RadioGroup defaultValue="mdy">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mdy" id="mdy" />
                        <Label htmlFor="mdy" className="font-normal cursor-pointer">
                          MM/DD/YYYY
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dmy" id="dmy" />
                        <Label htmlFor="dmy" className="font-normal cursor-pointer">
                          DD/MM/YYYY
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ymd" id="ymd" />
                        <Label htmlFor="ymd" className="font-normal cursor-pointer">
                          YYYY-MM-DD
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Options</CardTitle>
                  <CardDescription>Control what information is displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Show CVSS scores</p>
                      <p className="text-xs text-muted-foreground">Display CVSS scores on finding cards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Compact view</p>
                      <p className="text-xs text-muted-foreground">Show more items in lists and tables</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Show team avatars</p>
                      <p className="text-xs text-muted-foreground">Display team member avatars on project cards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Choose what updates you want to receive via email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">New findings</p>
                      <p className="text-xs text-muted-foreground">Get notified when new findings are created</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Critical CVE alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts for critical CVEs affecting your projects
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Project updates</p>
                      <p className="text-xs text-muted-foreground">Get notified about project status changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Team mentions</p>
                      <p className="text-xs text-muted-foreground">Receive notifications when someone mentions you</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Weekly summary</p>
                      <p className="text-xs text-muted-foreground">Get a weekly summary of your activity</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>In-App Notifications</CardTitle>
                  <CardDescription>Manage notifications within the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Desktop notifications</p>
                      <p className="text-xs text-muted-foreground">Show desktop notifications for important updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Sound alerts</p>
                      <p className="text-xs text-muted-foreground">Play sound for critical notifications</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Management Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Manage team members and their project-specific permissions</CardDescription>
                    </div>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTeam ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ) : teamMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No team members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        teamMembers.map((member) => {
                          const roleNames = member.roles.map((r) => r.name).join(", ")
                          return (
                            <TableRow key={member.id} className="group">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                      {member.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{member.username}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{roleNames || "No role"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    member.is_active
                                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900"
                                      : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-900"
                                  }
                                >
                                  {member.is_active ? "active" : "inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  0 projects
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(member.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleManageProjects(member.id)}>
                                      <Briefcase className="h-4 w-4 mr-2" />
                                      Manage Projects
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleManagePermissions(member.id)}>
                                      <Shield className="h-4 w-4 mr-2" />
                                      Manage Permissions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleToggleUserStatus(member.id)}
                                      disabled={member.id === currentUser?.id}
                                    >
                                      {member.is_active ? (
                                        <>
                                          <UserX className="h-4 w-4 mr-2" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteUser(member.id)}
                                      disabled={member.id === currentUser?.id}
                                    >
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Add New Member Form - Coming Soon */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Team Member</CardTitle>
                  <CardDescription>Invite a new member to join your team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      User creation functionality will be available soon. Please contact your administrator to add new team members.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
