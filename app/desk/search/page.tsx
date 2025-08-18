"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { ArrowLeft, Search, User, Clock, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getBookings, updateBooking } from "@/lib/storage"
import type { Booking } from "@/lib/types"
import Link from "next/link"

export default function DeskSearch() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Booking[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (searchTerm.length >= 2) {
      performSearch()
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const performSearch = () => {
    const bookings = getBookings()
    const today = new Date().toDateString()

    const results = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date).toDateString()
      const isToday = bookingDate === today
      const matchesSearch =
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())

      return isToday && matchesSearch
    })

    setSearchResults(results)
  }

  const handleCheckIn = (bookingId: string) => {
    updateBooking(bookingId, { status: "checked-in" })
    setMessage({ type: "success", text: "Successfully checked in!" })
    performSearch() // Refresh results
    setTimeout(() => setMessage(null), 3000)
  }

  const handleComplete = (bookingId: string) => {
    updateBooking(bookingId, { status: "completed" })
    setMessage({ type: "success", text: "Session completed!" })
    performSearch() // Refresh results
    setTimeout(() => setMessage(null), 3000)
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

  if (!user || user.role !== "desk") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-white/70">This page is only accessible to desk staff.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/desk">
            <GlassButton variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </GlassButton>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Manual Search</h1>
            <p className="text-white/70">Search for bookings by name or ID</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <GlassCard className={`p-4 border-l-4 ${message.type === "success" ? "border-green-400" : "border-red-400"}`}>
            <div
              className={`flex items-center gap-2 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
            >
              {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {message.text}
            </div>
          </GlassCard>
        )}

        {/* Search */}
        <GlassCard className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search by client name, trainer, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-white/70 mt-2">
            Showing today's bookings only. Type at least 2 characters to search.
          </p>
        </GlassCard>

        {/* Results */}
        {searchTerm.length >= 2 && (
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Search Results ({searchResults.length})</h2>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-white/70">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bookings found matching "{searchTerm}"</p>
                <p className="text-sm mt-2">Try searching by client name, trainer, or booking ID</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((booking) => (
                  <div key={booking.id} className="glass-effect rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                          <div className="w-3 h-3 rounded-full bg-current" />
                          <span className="font-medium capitalize">{booking.status.replace("-", " ")}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {booking.clientName}
                          </div>
                          <div className="text-sm text-white/70 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {booking.time} • {booking.trainerName} • {booking.productName}
                          </div>
                          <div className="text-xs text-white/50 mt-1">ID: {booking.id}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === "confirmed" && (
                          <GlassButton size="sm" onClick={() => handleCheckIn(booking.id)}>
                            Check In
                          </GlassButton>
                        )}
                        {booking.status === "checked-in" && (
                          <GlassButton size="sm" variant="secondary" onClick={() => handleComplete(booking.id)}>
                            Complete
                          </GlassButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Instructions */}
        <GlassCard className="p-4">
          <h3 className="font-medium text-white mb-2">Search Tips</h3>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Search by client first name, last name, or full name</li>
            <li>• Search by trainer name to find all their sessions</li>
            <li>• Use booking ID for exact matches</li>
            <li>• Only today's bookings are shown in results</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  )
}
