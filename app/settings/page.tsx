"use client"

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
import { mockUsers, mockProjects } from "@/lib/mock-data"
import { Upload, Check, Eye, EyeOff, Plus, MoreVertical, Shield, UserCheck, UserX, Briefcase } from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"

const mockTeamMembers = mockUsers

const availablePermissions = [
  { id: "admin", label: "Admin Access", description: "Full project access and team management" },
  { id: "projects", label: "Projects", description: "View and edit project details" },
  { id: "findings", label: "Findings", description: "Add and edit security findings" },
  { id: "cves", label: "CVE Tracking", description: "Monitor and manage CVEs" },
  { id: "reports", label: "Reports", description: "Generate and export reports" },
  { id: "settings", label: "Settings", description: "Modify project settings" },
]

export default function SettingsPage() {
  const currentUser = mockUsers[0]
  const { theme, setTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [saved, setSaved] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [memberPermissions, setMemberPermissions] = useState<string[]>([])
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [selectedMemberForProjects, setSelectedMemberForProjects] = useState<string | null>(null)
  const [memberProjects, setMemberProjects] = useState<string[]>([])

  const handlePasswordChange = (value: string) => {
    // Simple password strength calculation
    let strength = 0
    if (value.length >= 8) strength++
    if (/[A-Z]/.test(value)) strength++
    if (/[0-9]/.test(value)) strength++
    if (/[^A-Za-z0-9]/.test(value)) strength++
    setPasswordStrength(strength)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleManagePermissions = (memberId: string) => {
    const member = mockTeamMembers.find((m) => m.id === memberId)
    if (member && member.assignedProjects.length > 0) {
      setSelectedMember(memberId)
      // Default to first assigned project
      const firstProject = member.assignedProjects[0]
      setSelectedProject(firstProject)
      const projectPerms = member.projectPermissions.find((p) => p.projectId === firstProject)
      setMemberPermissions(projectPerms?.permissions || [])
    }
  }

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId)
    const member = mockTeamMembers.find((m) => m.id === selectedMember)
    if (member) {
      const projectPerms = member.projectPermissions.find((p) => p.projectId === projectId)
      setMemberPermissions(projectPerms?.permissions || [])
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    if (memberPermissions.includes(permissionId)) {
      setMemberPermissions(memberPermissions.filter((p) => p !== permissionId))
    } else {
      setMemberPermissions([...memberPermissions, permissionId])
    }
  }

  const handleManageProjects = (memberId: string) => {
    const member = mockTeamMembers.find((m) => m.id === memberId)
    if (member) {
      setSelectedMemberForProjects(memberId)
      setMemberProjects(member.assignedProjects || [])
      setProjectDialogOpen(true)
    }
  }

  const handleProjectToggle = (projectId: string) => {
    if (memberProjects.includes(projectId)) {
      setMemberProjects(memberProjects.filter((p) => p !== projectId))
    } else {
      setMemberProjects([...memberProjects, projectId])
    }
  }

  const getTotalPermissions = (member: (typeof mockTeamMembers)[0]) => {
    const allPerms = new Set<string>()
    member.projectPermissions.forEach((pp) => {
      pp.permissions.forEach((p) => allPerms.add(p))
    })
    return Array.from(allPerms)
  }

  return (
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
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    <AvatarFallback className="text-2xl">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Rivera" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input id="email" type="email" defaultValue={currentUser.email} disabled />
                    <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
                      <Check className="h-4 w-4 mr-2" />
                      Verified
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Your email address is verified and cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" defaultValue={currentUser.role} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Tell us a little about yourself..."
                    defaultValue="Lead penetration tester with 8+ years of experience in application security."
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className="gap-2">
                    {saved && <Check className="h-4 w-4" />}
                    {saved ? "Saved!" : "Save Changes"}
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
                    <Input id="currentPassword" type={showPassword ? "text" : "password"} />
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

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => handlePasswordChange(e.target.value)}
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
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} />
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
                  <Button>Update Password</Button>
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
                    {mockTeamMembers.map((member) => {
                      const totalPerms = getTotalPermissions(member)
                      return (
                        <TableRow key={member.id} className="group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{member.role}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                member.status === "active"
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900"
                                  : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-900"
                              }
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {member.assignedProjects?.length || 0} projects
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(member.joinedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleManageProjects(member.id)}>
                                  <Briefcase className="h-4 w-4 mr-2" />
                                  Manage Projects
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleManagePermissions(member.id)}
                                  disabled={member.assignedProjects.length === 0}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Manage Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                {member.status === "active" ? (
                                  <DropdownMenuItem>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Permission Management Panel */}
            {selectedMember && selectedProject && (
              <Card className="animate-in slide-in-from-bottom-4 duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manage Project Permissions</CardTitle>
                      <CardDescription>
                        Configure permissions for {mockTeamMembers.find((m) => m.id === selectedMember)?.name}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMember(null)
                        setSelectedProject(null)
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="project-select">Select Project</Label>
                    <Select value={selectedProject} onValueChange={handleProjectChange}>
                      <SelectTrigger id="project-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTeamMembers
                          .find((m) => m.id === selectedMember)
                          ?.assignedProjects.map((projectId) => {
                            const project = mockProjects.find((p) => p.id === projectId)
                            return (
                              <SelectItem key={projectId} value={projectId}>
                                {project?.name || projectId}
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Permissions are specific to each project. Select a project to manage its permissions.
                    </p>
                  </div>

                  <Separator />

                  {/* Permissions toggles */}
                  <div className="space-y-4">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{permission.label}</p>
                              {permission.id === "admin" && (
                                <Badge variant="outline" className="text-xs">
                                  High Risk
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                          <Switch
                            checked={memberPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                        </div>
                        {permission.id !== availablePermissions[availablePermissions.length - 1].id && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedMember(null)
                        setSelectedProject(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Permissions</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add New Member Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Team Member</CardTitle>
                <CardDescription>Invite a new member to join your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newMemberName">Full Name</Label>
                    <Input id="newMemberName" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newMemberEmail">Email Address</Label>
                    <Input id="newMemberEmail" type="email" placeholder="john.doe@securion.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newMemberRole">Role</Label>
                  <Select>
                    <SelectTrigger id="newMemberRole">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead Pentester</SelectItem>
                      <SelectItem value="senior">Senior Security Analyst</SelectItem>
                      <SelectItem value="analyst">Security Analyst</SelectItem>
                      <SelectItem value="researcher">Security Researcher</SelectItem>
                      <SelectItem value="junior">Junior Pentester</SelectItem>
                      <SelectItem value="consultant">Security Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    After adding a member, assign them to projects and configure project-specific permissions from the
                    team management table.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Send Invitation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Project Assignment Dialog */}
        <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Project Assignments</DialogTitle>
              <DialogDescription>
                Assign or remove projects for {mockTeamMembers.find((m) => m.id === selectedMemberForProjects)?.name}.
                After assigning projects, configure permissions for each project separately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                {mockProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-start justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{project.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{project.client}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Switch
                      checked={memberProjects.includes(project.id)}
                      onCheckedChange={() => handleProjectToggle(project.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSave()
                  setProjectDialogOpen(false)
                }}
              >
                Save Assignments
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
