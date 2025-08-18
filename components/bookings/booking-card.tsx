"use client"

import { useState } from "react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, MapPin, MoreVertical, QrCode, Star, Edit, X } from "lucide-react"
import type { Booking, Trainer, Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { generateQRCodeDataURL, generateBookingQRData } from "@/lib/qr-generator"

interface BookingCardProps {
  booking: Booking
  trainer: Trainer
  product: Product
  onCancel?: (bookingId: string) => void
  onReschedule?: (bookingId: string) => void
  onReview?: (bookingId: string) => void
  showActions?: boolean
}

export function BookingCard({
  booking,
  trainer,
  product,
  onCancel,
  onReschedule,
  onReview,
  showActions = true,
}: BookingCardProps) {
  const [showQR, setShowQR] = useState(false)

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
    })
  }

  const canCancel = ["held", "confirmed"].includes(booking.state)
  const canReschedule = ["held", "confirmed"].includes(booking.state)
  const canReview = booking.state === "completed"
  const canShowQR = ["confirmed", "checked_in"].includes(booking.state)

  const qrData = generateBookingQRData(booking.id)
  const qrImageUrl = generateQRCodeDataURL(qrData)

  return (
    <GlassCard className="p-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={trainer.avatarUrl || "/placeholder.svg"} alt={trainer.name} />
            <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{trainer.name}</h4>
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

        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem asChild>
                <Link href={`/booking/${booking.id}`}>View Details</Link>
              </DropdownMenuItem>

              {canShowQR && (
                <DropdownMenuItem onClick={() => setShowQR(!showQR)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  {showQR ? "Hide" : "Show"} QR Code
                </DropdownMenuItem>
              )}

              {canReschedule && onReschedule && (
                <DropdownMenuItem onClick={() => onReschedule(booking.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Reschedule
                </DropdownMenuItem>
              )}

              {canReview && onReview && (
                <DropdownMenuItem onClick={() => onReview(booking.id)}>
                  <Star className="mr-2 h-4 w-4" />
                  Write Review
                </DropdownMenuItem>
              )}

              {canCancel && onCancel && (
                <DropdownMenuItem onClick={() => onCancel(booking.id)} className="text-red-400">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {showQR && canShowQR && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
              <img src={qrImageUrl || "/placeholder.svg"} alt="Booking QR Code" className="w-32 h-32" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Show this QR code for check-in</p>
            <p className="text-xs text-muted-foreground">Booking ID: {booking.id}</p>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
