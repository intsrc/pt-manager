"use client"

import { nanoid } from "nanoid"
import { storage } from "./storage"
import type { UserRole, Settings, Client, Trainer } from "./types"
import { useState, useEffect } from "react"

export interface AuthUser {
  id: string
  name: string
  email?: string
  phone?: string
  role: UserRole
  avatarUrl?: string
}

export class AuthService {
  static getCurrentUser(): AuthUser | null {
    const settings = storage.getSettings()
    if (!settings.userId) return null

    switch (settings.role) {
      case "client": {
        const clients = storage.getClients()
        const client = clients.find((c) => c.id === settings.userId)
        return client
          ? {
              id: client.id,
              name: client.name,
              email: client.email,
              phone: client.phone,
              role: "client",
            }
          : null
      }
      case "trainer": {
        const trainers = storage.getTrainers()
        const trainer = trainers.find((t) => t.id === settings.userId)
        return trainer
          ? {
              id: trainer.id,
              name: trainer.name,
              role: "trainer",
              avatarUrl: trainer.avatarUrl,
            }
          : null
      }
      case "desk":
        return {
          id: "desk_user",
          name: "Desk Staff",
          role: "desk",
        }
      default:
        return null
    }
  }

  static switchRole(role: UserRole, userId?: string): void {
    const settings = storage.getSettings()
    const newSettings: Settings = {
      ...settings,
      role,
      userId,
    }
    storage.setSettings(newSettings)
  }

  static createClient(name: string, email: string, phone: string): Client {
    const clients = storage.getClients()
    const newClient: Client = {
      id: nanoid(),
      name,
      email,
      phone,
    }

    clients.push(newClient)
    storage.setClients(clients)

    // Auto-login as this client
    this.switchRole("client", newClient.id)

    return newClient
  }

  static updateClientProfile(updates: Partial<Pick<Client, "name" | "email" | "phone">>): void {
    const currentUser = this.getCurrentUser()
    if (!currentUser || currentUser.role !== "client") return

    const clients = storage.getClients()
    const clientIndex = clients.findIndex((c) => c.id === currentUser.id)

    if (clientIndex !== -1) {
      clients[clientIndex] = { ...clients[clientIndex], ...updates }
      storage.setClients(clients)
    }
  }

  static logout(): void {
    const settings = storage.getSettings()
    storage.setSettings({
      ...settings,
      userId: undefined,
    })
  }

  static getAvailableClients(): Client[] {
    return storage.getClients()
  }

  static getAvailableTrainers(): Trainer[] {
    return storage.getTrainers()
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const switchRole = (role: UserRole, userId?: string) => {
    AuthService.switchRole(role, userId)
    const newUser = AuthService.getCurrentUser()
    setUser(newUser)
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  const createClient = (name: string, email: string, phone: string) => {
    const client = AuthService.createClient(name, email, phone)
    const newUser = AuthService.getCurrentUser()
    setUser(newUser)
    return client
  }

  const updateProfile = (updates: Partial<Pick<Client, "name" | "email" | "phone">>) => {
    AuthService.updateClientProfile(updates)
    const updatedUser = AuthService.getCurrentUser()
    setUser(updatedUser)
  }

  return {
    user,
    loading,
    switchRole,
    logout,
    createClient,
    updateProfile,
    getAvailableClients: AuthService.getAvailableClients,
    getAvailableTrainers: AuthService.getAvailableTrainers,
  }
}
