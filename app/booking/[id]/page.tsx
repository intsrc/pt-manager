"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, Clock, MapPin, QrCode, Share, Download } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Booking, Trainer, Product } from "@/lib/types"
import Link from "next/link"

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    const bookings = storage.getBookings()
    const trainers = storage.getTrainers()
    const products = storage.getProducts()

    const foundBooking = bookings.find((b) => b.id === bookingId)
    setBooking(foundBooking || null)

    if (foundBooking) {
      setTrainer(trainers.find((t) => t.id === foundBooking.trainerId) || null)
      setProduct(products.find((p) => p.id === foundBooking.productId) || null)
    }
  }, [bookingId])

  const getStatusColor = (state: string) => {
    switch (state) {
      case "held":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "checked_in":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!booking || !trainer || !product) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
          <Button onClick={() => router.push("/me")} className="glass-button">
            Back to bookings
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <GlassCard className="p-6 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your session has been successfully booked</p>
          <Badge className={`mt-4 ${getStatusColor(booking.state)}`}>
            {booking.state.replace("_", " ").toUpperCase()}
          </Badge>
        </GlassCard>

        {/* Booking Details */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Booking Details</h3>
            <span className="text-sm text-muted-foreground">#{booking.code}</span>
          </div>

          <div className="space-y-4">
            {/* Trainer Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={trainer.avatarUrl || "/placeholder.svg"} alt={trainer.name} />
                <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{trainer.name}</h4>
                <p className="text-sm text-muted-foreground">{product.name}</p>
              </div>
            </div>

            <Separator />

            {/* Session Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Date</span>
                </div>
                <span className="font-medium">{formatDate(booking.date)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Time</span>
                </div>
                <span className="font-medium">
                  {booking.start} - {booking.end} ({product.durationMin} min)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Location</span>
                </div>
                <span className="font-medium">Kolizey Fitness Center</span>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="flex items-center justify-between font-semibold">
              <span>Total Paid</span>
              <span>
                {booking.price} {booking.currency}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* QR Code for Check-in */}
        {["confirmed", "checked_in"].includes(booking.state) && (
          <GlassCard className="p-6 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Check-in QR Code</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Show this QR code to your trainer or at the front desk for check-in
            </p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="glass-button bg-transparent">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="glass-button bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Add to Calendar
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/me" className="flex-1">
            <Button variant="outline" className="w-full glass-button bg-transparent">
              View All Bookings
            </Button>
          </Link>
          <Link href="/find" className="flex-1">
            <Button className="w-full glass-button">Book Another Session</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
