"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Calendar, Clock, Users, CheckCircle, AlertCircle, QrCode } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getBookings, updateBooking } from "@/lib/storage"
import type { Booking } from "@/lib/types"
import Link from "next/link"

export default function DeskDashboard() {
  const { user } = useAuth()
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
    completed: 0,
  })

  useEffect(() => {
    loadTodayBookings()
  }, [])

  const loadTodayBookings = () => {
    const bookings = getBookings()
    const today = new Date().toDateString()

    const todayBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date).toDateString()
      return bookingDate === today
    })

    setTodayBookings(todayBookings)

    // Calculate stats
    const stats = {
      total: todayBookings.length,
      checkedIn: todayBookings.filter((b) => b.status === "checked-in").length,
      pending: todayBookings.filter((b) => b.status === "confirmed").length,
      completed: todayBookings.filter((b) => b.status === "completed").length,
    }
    setStats(stats)
  }

  const handleQuickCheckIn = (bookingId: string) => {
    updateBooking(bookingId, { status: "checked-in" })
    loadTodayBookings()
  }

  const handleCompleteSession = (bookingId: string) => {
    updateBooking(bookingId, { status: "completed" })
    loadTodayBookings()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-yellow-400"
      case "checked-in":
        return "text-blue-400"
      case "completed":
        return "text-green-400"
      case "cancelled":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Clock className="w-4 h-4" />
      case "checked-in":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (!user || user.role !== "desk") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-white/70">This page is only accessible to desk staff.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Desk Dashboard</h1>
          <p className="text-white/70">Manage check-ins and session tracking</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/desk/checkin">
            <GlassButton className="w-full h-20 text-lg">
              <QrCode className="w-6 h-6 mr-2" />
              QR Code Check-in
            </GlassButton>
          </Link>
          <Link href="/desk/search">
            <GlassButton variant="secondary" className="w-full h-20 text-lg">
              <Users className="w-6 h-6 mr-2" />
              Manual Search
            </GlassButton>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-sm text-white/70">Total Today</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.pending}</div>
            <div className="text-sm text-white/70">Pending</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.checkedIn}</div>
            <div className="text-sm text-white/70">Checked In</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.completed}</div>
            <div className="text-sm text-white/70">Completed</div>
          </GlassCard>
        </div>

        {/* Today's Sessions */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Sessions
          </h2>

          {todayBookings.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sessions scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="glass-effect rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="font-medium capitalize">{booking.status.replace("-", " ")}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{booking.clientName}</div>
                      <div className="text-sm text-white/70">
                        {booking.time} • {booking.trainerName} • {booking.productName}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === "confirmed" && (
                      <GlassButton size="sm" onClick={() => handleQuickCheckIn(booking.id)}>
                        Check In
                      </GlassButton>
                    )}
                    {booking.status === "checked-in" && (
                      <GlassButton size="sm" variant="secondary" onClick={() => handleCompleteSession(booking.id)}>
                        Complete
                      </GlassButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
