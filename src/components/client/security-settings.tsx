"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, Key, Smartphone, Mail, Eye, EyeOff, CheckCircle } from "lucide-react"

// Mock security data
const mockSecurityData = {
  lastPasswordChange: "2024-01-01",
  twoFactorEnabled: true,
  loginNotifications: true,
  securityAlerts: true,
  sessions: [
    {
      id: "session-1",
      device: "Chrome on Windows",
      location: "New York, NY",
      lastActive: "2024-01-15T10:30:00Z",
      current: true,
    },
    {
      id: "session-2",
      device: "Safari on iPhone",
      location: "New York, NY",
      lastActive: "2024-01-14T15:45:00Z",
      current: false,
    },
  ],
}

export function SecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState(mockSecurityData)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      // toast({
      //   title: "Password Mismatch",
      //   description: "New password and confirmation don't match.",
      //   variant: "destructive",
      // })
      return
    }

    // Simulate API call
    setTimeout(() => {
      setIsChangingPassword(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setSecuritySettings((prev) => ({
        ...prev,
        lastPasswordChange: new Date().toISOString().split("T")[0],
      }))
      // toast({
      //   title: "Password Updated",
      //   description: "Your password has been successfully changed.",
      // })
    }, 1000)
  }

  const handleToggleSetting = (setting: string, value: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
    // toast({
    //   title: "Settings Updated",
    //   description: `${setting.replace(/([A-Z])/g, " $1").toLowerCase()} has been ${value ? "enabled" : "disabled"}.`,
    // })
  }

  const handleTerminateSession = (sessionId: string) => {
    setSecuritySettings((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((session) => session.id !== sessionId),
    }))
    // toast({
    //   title: "Session Terminated",
    //   description: "The selected session has been terminated.",
    // })
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>Monitor and manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Account Secure</p>
                <p className="text-sm text-green-700">All security checks passed</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Key className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Password</p>
                <p className="text-sm text-blue-700">
                  Changed{" "}
                  {Math.floor(
                    (new Date().getTime() - new Date(securitySettings.lastPasswordChange).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days ago
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <Smartphone className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">2FA Status</p>
                <p className="text-sm text-purple-700">{securitySettings.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password & Authentication
          </CardTitle>
          <CardDescription>Manage your login credentials and authentication methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Last changed on {new Date(securitySettings.lastPasswordChange).toLocaleDateString()}
              </p>
            </div>
            <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Enter your current password and choose a new one</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange}>Update Password</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => handleToggleSetting("twoFactorEnabled", checked)}
              />
              <Badge variant={securitySettings.twoFactorEnabled ? "default" : "secondary"}>
                {securitySettings.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Security Notifications
          </CardTitle>
          <CardDescription>Choose when to receive security-related notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Login Notifications</h4>
              <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
            </div>
            <Switch
              checked={securitySettings.loginNotifications}
              onCheckedChange={(checked) => handleToggleSetting("loginNotifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Security Alerts</h4>
              <p className="text-sm text-muted-foreground">Receive alerts about suspicious account activity</p>
            </div>
            <Switch
              checked={securitySettings.securityAlerts}
              onCheckedChange={(checked) => handleToggleSetting("securityAlerts", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage devices that are currently logged into your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securitySettings.sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-muted-foreground">{session.location}</p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {session.current ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Current Session
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
