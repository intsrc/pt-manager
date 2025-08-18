"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Calendar, MapPin, FileText, ArrowLeft } from "lucide-react"
import { storage } from "@/lib/storage"
import { BookingService } from "@/lib/booking"
import { AuthService } from "@/lib/auth"
import type { Trainer, Product } from "@/lib/types"
import Link from "next/link"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const trainerId = params.trainerId as string
  const productId = searchParams.get("productId")
  const date = searchParams.get("date")
  const start = searchParams.get("start")

  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [waiverAccepted, setWaiverAccepted] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    const trainers = storage.getTrainers()
    const products = storage.getProducts()

    const foundTrainer = trainers.find((t) => t.id === trainerId)
    const foundProduct = products.find((p) => p.id === productId)

    setTrainer(foundTrainer || null)
    setProduct(foundProduct || null)
  }, [trainerId, productId])

  const handleBooking = async () => {
    if (!trainer || !product || !date || !start || !waiverAccepted) return

    const currentUser = AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "client") {
      router.push("/auth")
      return
    }

    setIsBooking(true)

    try {
      const booking = await BookingService.createBooking({
        trainerId,
        productId: product.id,
        date,
        start,
        clientId: currentUser.id,
      })

      router.push(`/booking/${booking.id}`)
    } catch (error) {
      console.error("Booking failed:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsBooking(false)
    }
  }

  if (!trainer || !product || !date || !start) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Invalid booking request</h1>
          <Button onClick={() => router.push("/find")} className="glass-button">
            Back to search
          </Button>
        </div>
      </AppShell>
    )
  }

  const endTime = new Date(`${date}T${start}`)
  endTime.setMinutes(endTime.getMinutes() + product.durationMin)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/trainer/${trainerId}`}>
            <Button variant="outline" size="sm" className="glass-button bg-transparent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Review & Confirm</h1>
            <p className="text-muted-foreground">Please review your booking details</p>
          </div>
        </div>

        {/* Booking Summary */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

          <div className="space-y-4">
            {/* Trainer Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={trainer.avatarUrl || "/placeholder.svg"} alt={trainer.name} />
                <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{trainer.name}</h4>
                <p className="text-sm text-muted-foreground">{trainer.bio}</p>
              </div>
            </div>

            <Separator />

            {/* Session Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Service</span>
                <div className="text-right">
                  <div className="font-medium">{product.name}</div>
                  {product.introOffer && (
                    <Badge variant="secondary" className="text-xs">
                      Intro Offer
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Date</span>
                </div>
                <span className="font-medium">{formatDate(date)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Time</span>
                </div>
                <span className="font-medium">
                  {start} - {endTime.toTimeString().slice(0, 5)} ({product.durationMin} min)
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Session price</span>
                <span>{product.price} UAH</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{product.price} UAH</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Waiver Agreement */}
        <GlassCard className="p-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="waiver"
              checked={waiverAccepted}
              onCheckedChange={(checked) => setWaiverAccepted(checked as boolean)}
            />
            <div className="space-y-2">
              <label htmlFor="waiver" className="text-sm font-medium cursor-pointer">
                I agree to the waiver and terms of service
              </label>
              <p className="text-xs text-muted-foreground">
                By checking this box, you acknowledge that you have read and agree to our{" "}
                <Link href="/legal/waiver" className="text-primary hover:underline">
                  liability waiver
                </Link>{" "}
                and terms of service.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/trainer/${trainerId}`} className="flex-1">
            <Button variant="outline" className="w-full glass-button bg-transparent">
              Back to Trainer
            </Button>
          </Link>
          <GlassButton
            glassVariant="primary"
            onClick={handleBooking}
            disabled={!waiverAccepted || isBooking}
            className="flex-1"
          >
            {isBooking ? "Processing..." : `Confirm & Hold - ${product.price} UAH`}
          </GlassButton>
        </div>

        {/* Payment Info */}
        <GlassCard className="p-4">
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Payment Information</p>
              <p>
                Your payment will be held upon confirmation and charged after your session is completed. You can cancel
                up to 12 hours before your session for a full refund.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  )
}
