"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar"
import { storage } from "@/lib/storage"
import { AuthService } from "@/lib/auth"
import type { AvailabilityRule, ExceptionWindow, Trainer } from "@/lib/types"
import { nanoid } from "nanoid"
import { useToast } from "@/hooks/use-toast"

export default function TrainerCalendarPage() {
  const { toast } = useToast()
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [rules, setRules] = useState<AvailabilityRule[]>([])
  const [exceptions, setExceptions] = useState<ExceptionWindow[]>([])

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "trainer") return

    const trainers = storage.getTrainers()
    const currentTrainer = trainers.find((t) => t.id === currentUser.id)
    setTrainer(currentTrainer || null)

    if (currentTrainer) {
      setRules(currentTrainer.availabilityRules)
    }

    setExceptions(storage.getAvailabilityExceptions())
  }, [])

  const handleRuleAdd = (newRule: Omit<AvailabilityRule, "id">) => {
    if (!trainer) return

    const rule: AvailabilityRule = {
      ...newRule,
      id: nanoid(),
    }

    const updatedRules = [...rules, rule]
    setRules(updatedRules)

    // Update trainer in storage
    const trainers = storage.getTrainers()
    const updatedTrainers = trainers.map((t) => (t.id === trainer.id ? { ...t, availabilityRules: updatedRules } : t))
    storage.setTrainers(updatedTrainers)

    toast({
      title: "Rule added",
      description: "Availability rule has been added successfully.",
    })
  }

  const handleRuleUpdate = (id: string, updates: Partial<AvailabilityRule>) => {
    if (!trainer) return

    const updatedRules = rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    setRules(updatedRules)

    // Update trainer in storage
    const trainers = storage.getTrainers()
    const updatedTrainers = trainers.map((t) => (t.id === trainer.id ? { ...t, availabilityRules: updatedRules } : t))
    storage.setTrainers(updatedTrainers)

    toast({
      title: "Rule updated",
      description: "Availability rule has been updated successfully.",
    })
  }

  const handleRuleDelete = (id: string) => {
    if (!trainer) return

    const updatedRules = rules.filter((rule) => rule.id !== id)
    setRules(updatedRules)

    // Update trainer in storage
    const trainers = storage.getTrainers()
    const updatedTrainers = trainers.map((t) => (t.id === trainer.id ? { ...t, availabilityRules: updatedRules } : t))
    storage.setTrainers(updatedTrainers)

    toast({
      title: "Rule deleted",
      description: "Availability rule has been deleted successfully.",
    })
  }

  const handleExceptionAdd = (newException: Omit<ExceptionWindow, "id">) => {
    if (!trainer) return

    const exception: ExceptionWindow = {
      ...newException,
      id: nanoid(),
      trainerId: trainer.id,
    }

    const updatedExceptions = [...exceptions, exception]
    setExceptions(updatedExceptions)
    storage.setAvailabilityExceptions(updatedExceptions)

    toast({
      title: "Exception added",
      description: "Availability exception has been added successfully.",
    })
  }

  const handleExceptionDelete = (id: string) => {
    const updatedExceptions = exceptions.filter((exception) => exception.id !== id)
    setExceptions(updatedExceptions)
    storage.setAvailabilityExceptions(updatedExceptions)

    toast({
      title: "Exception deleted",
      description: "Availability exception has been deleted successfully.",
    })
  }

  if (!trainer) {
    return (
      <AppShell>
        <AuthGuard requiredRole="trainer">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Trainer profile not found</h1>
          </div>
        </AuthGuard>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <AuthGuard requiredRole="trainer">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Calendar Management</h1>
            <p className="text-muted-foreground">Manage your availability and schedule</p>
          </div>

          <AvailabilityCalendar
            rules={rules}
            exceptions={exceptions.filter((e) => e.trainerId === trainer.id)}
            onRuleAdd={handleRuleAdd}
            onRuleUpdate={handleRuleUpdate}
            onRuleDelete={handleRuleDelete}
            onExceptionAdd={handleExceptionAdd}
            onExceptionDelete={handleExceptionDelete}
          />
        </div>
      </AuthGuard>
    </AppShell>
  )
}
