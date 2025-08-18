"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { QRScanner } from "@/components/desk/qr-scanner"
import { ArrowLeft, CheckCircle, XCircle, User, Clock, MapPin } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getBookings, updateBooking } from "@/lib/storage"
import type { Booking } from "@/lib/types"
import Link from "next/link"

export default function DeskCheckIn() {
  const { user } = useAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleScan = (data: string) => {
    console.log("[v0] QR scan result:", data)

    // Find booking by ID (in real app, would decode QR data)
    const bookings = getBookings()
    const booking = bookings.find(
      (b) =>
        data.includes(b.id) ||
        data.includes(b.clientName.toLowerCase()) ||
        // Mock: find any confirmed booking for demo
        b.status === "confirmed",
    )

    if (booking) {
      setScannedBooking(booking)
      setIsScanning(false)
      setMessage(null)
    } else {
      setMessage({ type: "error", text: "Booking not found or already processed" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleCheckIn = () => {
    if (scannedBooking) {
      updateBooking(scannedBooking.id, { status: "checked-in" })
      setMessage({ type: "success", text: "Successfully checked in!" })
      setScannedBooking(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleCancel = () => {
    setScannedBooking(null)
    setMessage(null)
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/desk">
            <GlassButton variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </GlassButton>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">QR Check-in</h1>
            <p className="text-white/70">Scan client QR codes for quick check-in</p>
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

        {/* Scanner or Booking Details */}
        {!scannedBooking ? (
          <div className="space-y-6">
            <QRScanner onScan={handleScan} isActive={isScanning} />

            <div className="text-center">
              <GlassButton onClick={() => setIsScanning(!isScanning)} className="w-full">
                {isScanning ? "Stop Scanner" : "Start Scanner"}
              </GlassButton>
            </div>
          </div>
        ) : (
          <GlassCard className="p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h2 className="text-xl font-semibold text-white mb-2">Booking Found</h2>
              <p className="text-white/70">Confirm check-in details below</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-white">{scannedBooking.clientName}</div>
                  <div className="text-sm text-white/70">Client</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-white">
                    {new Date(scannedBooking.date).toLocaleDateString()} at {scannedBooking.time}
                  </div>
                  <div className="text-sm text-white/70">Session Time</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-white">{scannedBooking.trainerName}</div>
                  <div className="text-sm text-white/70">{scannedBooking.productName}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <GlassButton onClick={handleCheckIn} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In
              </GlassButton>
              <GlassButton variant="secondary" onClick={handleCancel} className="flex-1">
                Cancel
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* Instructions */}
        <GlassCard className="p-4">
          <h3 className="font-medium text-white mb-2">Instructions</h3>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Ask clients to show their booking QR code</li>
            <li>• Point the camera at the QR code to scan</li>
            <li>• Verify client details before confirming check-in</li>
            <li>• Use manual search if QR code is not working</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  )
}
