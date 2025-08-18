"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, UserCheck, Shield, Plus } from "lucide-react"
import { AuthService } from "@/lib/auth"
import type { UserRole, Client, Trainer } from "@/lib/types"

export default function AuthPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>("client")
  const [clients, setClients] = useState<Client[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    setClients(AuthService.getAvailableClients())
    setTrainers(AuthService.getAvailableTrainers())
  }, [])

  const handleRoleSelect = (role: UserRole, userId?: string) => {
    AuthService.switchRole(role, userId)

    // Redirect based on role
    switch (role) {
      case "client":
        router.push("/")
        break
      case "trainer":
        router.push("/trainer")
        break
      case "desk":
        router.push("/desk")
        break
    }
  }

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientData.name || !newClientData.email || !newClientData.phone) return

    AuthService.createClient(newClientData.name, newClientData.email, newClientData.phone)
    router.push("/")
  }

  const roleOptions = [
    {
      role: "client" as UserRole,
      title: "Client",
      description: "Book training sessions",
      icon: User,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      role: "trainer" as UserRole,
      title: "Trainer",
      description: "Manage sessions and clients",
      icon: UserCheck,
      color: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    {
      role: "desk" as UserRole,
      title: "Desk Staff",
      description: "Check-in and support",
      icon: Shield,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
  ]

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome to Kolizey PT</h1>
          <p className="text-muted-foreground">Choose your role to get started</p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-4">
          {roleOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedRole === option.role

            return (
              <GlassCard
                key={option.role}
                className={`p-6 cursor-pointer transition-all duration-200 ${
                  isSelected ? option.color : "hover:bg-white/5"
                }`}
                onClick={() => setSelectedRole(option.role)}
              >
                <div className="text-center space-y-4">
                  <Icon className="h-12 w-12 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* User Selection */}
        <GlassCard className="p-6">
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="trainer">Trainer</TabsTrigger>
              <TabsTrigger value="desk">Desk</TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Client Profile</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className="glass-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </div>

              {showNewClientForm && (
                <GlassCard className="p-4">
                  <form onSubmit={handleCreateClient} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newClientData.name}
                          onChange={(e) => setNewClientData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your name"
                          className="bg-transparent"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newClientData.email}
                          onChange={(e) => setNewClientData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="bg-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+380XXXXXXXXX"
                        className="bg-transparent"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <GlassButton type="submit" glassVariant="primary">
                        Create & Sign In
                      </GlassButton>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewClientForm(false)}
                        className="glass-button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </GlassCard>
              )}

              <div className="grid gap-3">
                {clients.map((client) => (
                  <GlassCard
                    key={client.id}
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => handleRoleSelect("client", client.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{client.name}</h4>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      <Badge variant="secondary">Client</Badge>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trainer" className="space-y-4">
              <h3 className="text-lg font-semibold">Select Trainer Profile</h3>
              <div className="grid gap-3">
                {trainers.map((trainer) => (
                  <GlassCard
                    key={trainer.id}
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => handleRoleSelect("trainer", trainer.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={trainer.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{trainer.name}</h4>
                        <p className="text-sm text-muted-foreground">{trainer.bio}</p>
                        <div className="flex gap-1 mt-1">
                          {trainer.specialties.slice(0, 2).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="secondary">Trainer</Badge>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="desk" className="space-y-4">
              <h3 className="text-lg font-semibold">Desk Staff Access</h3>
              <GlassCard
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => handleRoleSelect("desk")}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      <Shield className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">Desk Staff</h4>
                    <p className="text-sm text-muted-foreground">Access check-in and support tools</p>
                  </div>
                  <Badge variant="secondary">Staff</Badge>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </GlassCard>
      </div>
    </AppShell>
  )
}
