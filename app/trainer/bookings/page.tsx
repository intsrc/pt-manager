"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/auth/auth-guard"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Calendar, Clock, MapPin } from "lucide-react"
import { storage } from "@/lib/storage"
import { AuthService } from "@/lib/auth"
import type { Booking, Trainer, Product, Client, BookingState } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function TrainerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<BookingState | "all">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")

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

  const filteredBookings = bookings.filter((booking) => {
    // Search filter
    if (searchQuery) {
      const client = clients.find((c) => c.id === booking.clientId)
      const product = products.find((p) => p.id === booking.productId)
      const searchLower = searchQuery.toLowerCase()

      const matchesClient = client?.name.toLowerCase().includes(searchLower)
      const matchesProduct = product?.name.toLowerCase().includes(searchLower)
      const matchesCode = booking.code.toLowerCase().includes(searchLower)

      if (!matchesClient && !matchesProduct && !matchesCode) return false
    }

    // Status filter
    if (statusFilter !== "all" && booking.state !== statusFilter) return false

    // Date filter
    if (dateFilter !== "all") {
      const bookingDate = new Date(booking.date)
      const now = new Date()

      switch (dateFilter) {
        case "today":
          if (bookingDate.toDateString() !== now.toDateString()) return false
          break
        case "week":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          if (bookingDate < weekStart || bookingDate > weekEnd) return false
          break
        case "month":
          if (bookingDate.getMonth() !== now.getMonth() || bookingDate.getFullYear() !== now.getFullYear()) return false
          break
      }
    }

    return true
  })

  const sortedBookings = filteredBookings.sort((a, b) => {
    const dateA = new Date(a.date + "T" + a.start)
    const dateB = new Date(b.date + "T" + b.start)
    return dateB.getTime() - dateA.getTime()
  })

  const getStatusColor = (state: BookingState) => {
    switch (state) {
      case "held":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "checked_in":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "canceled_client":
      case "canceled_trainer":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "no_show":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getClientForBooking = (booking: Booking) => clients.find((c) => c.id === booking.clientId)
  const getProductForBooking = (booking: Booking) => products.find((p) => p.id === booking.productId)

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
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground">Manage your training sessions</p>
          </div>

          {/* Filters */}
          <GlassCard className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by client, service, or booking code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingState | "all")}>
                <SelectTrigger className="w-40 bg-transparent">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="held">Held</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled_client">Canceled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
                <SelectTrigger className="w-32 bg-transparent">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </GlassCard>

          {/* Results */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {sortedBookings.length} booking{sortedBookings.length !== 1 ? "s" : ""} found
            </h2>
          </div>

          {/* Bookings List */}
          {sortedBookings.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {sortedBookings.map((booking) => {
                const client = getClientForBooking(booking)
                const product = getProductForBooking(booking)

                if (!client || !product) return null

                return (
                  <GlassCard key={booking.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{client.name}</h4>
                              <p className="text-sm text-muted-foreground">{product.name}</p>
                            </div>
                            <Badge className={cn("text-xs", getStatusColor(booking.state))}>
                              {booking.state.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {booking.start} - {booking.end}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>Kolizey</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {booking.price} {booking.currency}
                            </span>
                            <span className="text-xs text-muted-foreground">#{booking.code}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>
      </AuthGuard>
    </AppShell>
  )
}
