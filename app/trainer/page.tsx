"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/auth/auth-guard"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Users, TrendingUp, CheckCircle, X, QrCode } from "lucide-react"
import { storage } from "@/lib/storage"
import { AuthService } from "@/lib/auth"
import type { Booking, Trainer, Product, Client } from "@/lib/types"
import Link from "next/link"

export default function TrainerDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "trainer") return

    const trainers = storage.getTrainers()
    const currentTrainer = trainers.find((t) => t.id === currentUser.id)
    setTrainer(currentTrainer || null)

    if (currentTrainer) {
      const allBookings = storage.getBookings()
      const trainerBookings = allBookings.filter((booking) => booking.trainerId === currentTrainer.id)
      setBookings(trainerBookings)
    }

    setProducts(storage.getProducts())
    setClients(storage.getClients())
  }, [])

  const today = new Date().toISOString().split("T")[0]
  const todayBookings = bookings
    .filter((booking) => booking.date === today && ["confirmed", "checked_in"].includes(booking.state))
    .sort((a, b) => a.start.localeCompare(b.start))

  const upcomingBookings = bookings
    .filter((booking) => {
      const bookingDate = new Date(booking.date)
      const now = new Date()
      return bookingDate > now && ["confirmed", "checked_in"].includes(booking.state)
    })
    .sort((a, b) => new Date(a.date + "T" + a.start).getTime() - new Date(b.date + "T" + b.start).getTime())
    .slice(0, 5)

  const stats = [
    {
      label: "Today's Sessions",
      value: todayBookings.length,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      label: "This Week",
      value: bookings.filter((b) => {
        const bookingDate = new Date(b.date)
        const now = new Date()
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return bookingDate >= weekStart && bookingDate <= weekEnd && b.state === "completed"
      }).length,
      icon: Clock,
      color: "text-green-400",
    },
    {
      label: "Total Clients",
      value: new Set(bookings.map((b) => b.clientId)).size,
      icon: Users,
      color: "text-purple-400",
    },
    {
      label: "Completion Rate",
      value:
        bookings.length > 0
          ? Math.round((bookings.filter((b) => b.state === "completed").length / bookings.length) * 100)
          : 0,
      icon: TrendingUp,
      color: "text-yellow-400",
      suffix: "%",
    },
  ]

  const handleCheckIn = (bookingId: string) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? { ...booking, state: "checked_in" as const, updatedAt: new Date().toISOString() }
        : booking,
    )
    setBookings(updatedBookings)

    // Update storage
    const allBookings = storage.getBookings()
    const newAllBookings = allBookings.map((b) =>
      b.id === bookingId ? updatedBookings.find((ub) => ub.id === bookingId)! : b,
    )
    storage.setBookings(newAllBookings)
  }

  const handleCancelSession = (bookingId: string) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? { ...booking, state: "canceled_trainer" as const, updatedAt: new Date().toISOString() }
        : booking,
    )
    setBookings(updatedBookings)

    // Update storage
    const allBookings = storage.getBookings()
    const newAllBookings = allBookings.map((b) =>
      b.id === bookingId ? updatedBookings.find((ub) => ub.id === bookingId)! : b,
    )
    storage.setBookings(newAllBookings)
  }

  const getClientForBooking = (booking: Booking) => clients.find((c) => c.id === booking.clientId)
  const getProductForBooking = (booking: Booking) => products.find((p) => p.id === booking.productId)

  const getStatusColor = (state: string) => {
    switch (state) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "checked_in":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (!trainer) {
    return (
      <AppShell>
        <AuthGuard requiredRole="trainer">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Trainer profile not found</h1>
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
      <AuthGuard requiredRole="trainer">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {trainer.name}</h1>
              <p className="text-muted-foreground">Here's what's happening today</p>
            </div>
            <Link href="/trainer/checkin">
              <Button className="glass-button">
                <QrCode className="h-4 w-4 mr-2" />
                Check-in
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <GlassCard key={index} className="p-4 text-center">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-xl font-bold">
                    {stat.value}
                    {stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </GlassCard>
              )
            })}
          </div>

          {/* Today's Sessions */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Today's Sessions</h3>
              <Badge variant="secondary">{todayBookings.length} sessions</Badge>
            </div>

            {todayBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No sessions scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayBookings.map((booking) => {
                  const client = getClientForBooking(booking)
                  const product = getProductForBooking(booking)

                  if (!client || !product) return null

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{client.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>
                              {booking.start} - {booking.end}
                            </span>
                            <Badge className={getStatusColor(booking.state)}>
                              {booking.state.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {booking.state === "confirmed" && (
                          <Button size="sm" onClick={() => handleCheckIn(booking.id)} className="glass-button">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Check In
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelSession(booking.id)}
                          className="glass-button bg-transparent text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassCard>

          {/* Upcoming Sessions */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
              <Link href="/trainer/bookings">
                <Button variant="outline" size="sm" className="glass-button bg-transparent">
                  View All
                </Button>
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => {
                  const client = getClientForBooking(booking)
                  const product = getProductForBooking(booking)

                  if (!client || !product) return null

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/40"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h5 className="font-medium text-sm">{client.name}</h5>
                          <p className="text-xs text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at {booking.start}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {product.name}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </AuthGuard>
    </AppShell>
  )
}
