"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/auth/auth-guard"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Globe, Palette, Shield, Trash2, Download } from "lucide-react"
import { storage } from "@/lib/storage"
import { AuthService } from "@/lib/auth"
import type { Settings, Client } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ClientSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Settings>({
    locale: "en",
    theme: "dark",
    role: "client",
  })
  const [profile, setProfile] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const currentSettings = storage.getSettings()
    const currentUser = AuthService.getCurrentUser()

    setSettings(currentSettings)

    if (currentUser && currentUser.role === "client") {
      const clients = storage.getClients()
      const clientProfile = clients.find((c) => c.id === currentUser.id)
      setProfile(clientProfile || null)
    }
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsLoading(true)

    try {
      AuthService.updateClientProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsUpdate = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    storage.setSettings(newSettings)

    toast({
      title: "Settings updated",
      description: `${key} has been updated successfully.`,
    })
  }

  const handleDataExport = () => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return

    const bookings = storage.getBookings().filter((b) => b.clientId === currentUser.id)
    const reviews = storage.getReviews().filter((r) => bookings.some((b) => b.id === r.bookingId))

    const exportData = {
      profile,
      bookings,
      reviews,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kolizey-pt-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Your data has been downloaded successfully.",
    })
  }

  const handleDataReset = () => {
    if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
      storage.reset()
      window.location.reload()
    }
  }

  if (!profile) {
    return (
      <AppShell>
        <AuthGuard requiredRole="client">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
            <Button onClick={() => (window.location.href = "/auth")} className="glass-button">
              Sign In Again
            </Button>
          </div>
        </AuthGuard>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <AuthGuard requiredRole="client">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <User className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="bg-transparent"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="bg-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="bg-transparent"
                      required
                    />
                  </div>

                  <GlassButton type="submit" glassVariant="primary" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </GlassButton>
                </form>
              </GlassCard>
            </TabsContent>

            <TabsContent value="preferences">
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Globe className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Language & Region</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Language</Label>
                        <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                      </div>
                      <Select value={settings.locale} onValueChange={(value) => handleSettingsUpdate("locale", value)}>
                        <SelectTrigger className="w-32 bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="uk">Українська</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Palette className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Appearance</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Theme</Label>
                        <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                      </div>
                      <Select value={settings.theme} onValueChange={(value) => handleSettingsUpdate("theme", value)}>
                        <SelectTrigger className="w-32 bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>

            <TabsContent value="privacy">
              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Privacy & Security</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Allow trainers to see your profile</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications about upcoming sessions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about new features and offers</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="data">
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Download className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Data Management</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Export Data</Label>
                        <p className="text-sm text-muted-foreground">Download all your data in JSON format</p>
                      </div>
                      <Button onClick={handleDataExport} variant="outline" className="glass-button bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 border-red-500/20">
                  <div className="flex items-center space-x-2 mb-6">
                    <Trash2 className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-red-400">Reset All Data</Label>
                        <p className="text-sm text-muted-foreground">
                          This will permanently delete all your data and cannot be undone
                        </p>
                      </div>
                      <Button onClick={handleDataReset} variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset Data
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AuthGuard>
    </AppShell>
  )
}
