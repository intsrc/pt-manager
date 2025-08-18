"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/auth/auth-guard"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingCard } from "@/components/bookings/booking-card"
import { ReviewForm } from "@/components/reviews/review-form"
import { Calendar, Clock, TrendingUp, Star, Wallet, Plus } from "lucide-react"
import { storage } from "@/lib/storage"
import { AuthService } from "@/lib/auth"
import type { Booking, Trainer, Product, Review } from "@/lib/types"
import { nanoid } from "nanoid"
import Link from "next/link"

export default function ClientDashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return

    const allBookings = storage.getBookings()
    const userBookings = allBookings.filter((booking) => booking.clientId === currentUser.id)

    setBookings(userBookings)
    setTrainers(storage.getTrainers())
    setProducts(storage.getProducts())
    setReviews(storage.getReviews())
  }, [])

  const upcomingBookings = bookings
    .filter((booking) => ["held", "confirmed", "checked_in"].includes(booking.state))
    .sort((a, b) => new Date(a.date + "T" + a.start).getTime() - new Date(b.date + "T" + b.start).getTime())

  const pastBookings = bookings
    .filter((booking) => ["completed", "canceled_client", "canceled_trainer", "no_show"].includes(booking.state))
    .sort((a, b) => new Date(b.date + "T" + b.start).getTime() - new Date(a.date + "T" + a.start).getTime())

  const stats = [
    {
      label: "Total Sessions",
      value: bookings.filter((b) => b.state === "completed").length,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      label: "Hours Trained",
      value:
        bookings
          .filter((b) => b.state === "completed")
          .reduce((total, booking) => {
            const product = products.find((p) => p.id === booking.productId)
            return total + (product?.durationMin || 0)
          }, 0) / 60,
      icon: Clock,
      color: "text-green-400",
      suffix: "h",
    },
    {
      label: "Avg Rating Given",
      value: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0",
      icon: Star,
      color: "text-yellow-400",
    },
    {
      label: "Wallet Balance",
      value: "1,250",
      icon: Wallet,
      color: "text-purple-400",
      suffix: " UAH",
    },
  ]

  const handleCancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? { ...booking, state: "canceled_client" as const, updatedAt: new Date().toISOString() }
        : booking,
    )
    setBookings(updatedBookings)
    storage.setBookings(
      storage.getBookings().map((b) => (b.id === bookingId ? updatedBookings.find((ub) => ub.id === bookingId)! : b)),
    )
  }

  const handleRescheduleBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      router.push(`/trainer/${booking.trainerId}`)
    }
  }

  const handleSubmitReview = (rating: number, text: string) => {
    if (!reviewingBookingId) return

    const newReview: Review = {
      id: nanoid(),
      bookingId: reviewingBookingId,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      text: text || undefined,
      createdAt: new Date().toISOString(),
    }

    const updatedReviews = [...reviews, newReview]
    setReviews(updatedReviews)
    storage.setReviews(updatedReviews)
    setReviewingBookingId(null)
  }

  const getTrainerForBooking = (booking: Booking) => trainers.find((t) => t.id === booking.trainerId)
  const getProductForBooking = (booking: Booking) => products.find((p) => p.id === booking.productId)

  if (reviewingBookingId) {
    const booking = bookings.find((b) => b.id === reviewingBookingId)
    const trainer = booking ? getTrainerForBooking(booking) : null

    return (
      <AppShell>
        <AuthGuard requiredRole="client">
          <div className="max-w-2xl mx-auto">
            <ReviewForm
              bookingId={reviewingBookingId}
              trainerName={trainer?.name || "Trainer"}
              onSubmit={handleSubmitReview}
              onCancel={() => setReviewingBookingId(null)}
            />
          </div>
        </AuthGuard>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <AuthGuard requiredRole="client">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground">Manage your training sessions and progress</p>
            </div>
            <Link href="/find">
              <Button className="glass-button">
                <Plus className="h-4 w-4 mr-2" />
                Book Session
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

          {/* Bookings */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="history">History ({pastBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                  <p className="text-muted-foreground mb-4">Book your next training session to get started</p>
                  <Link href="/find">
                    <Button className="glass-button">Find a Trainer</Button>
                  </Link>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const trainer = getTrainerForBooking(booking)
                    const product = getProductForBooking(booking)

                    if (!trainer || !product) return null

                    return (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        trainer={trainer}
                        product={product}
                        onCancel={handleCancelBooking}
                        onReschedule={handleRescheduleBooking}
                      />
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {pastBookings.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No session history</h3>
                  <p className="text-muted-foreground">Your completed sessions will appear here</p>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => {
                    const trainer = getTrainerForBooking(booking)
                    const product = getProductForBooking(booking)
                    const hasReview = reviews.some((r) => r.bookingId === booking.id)

                    if (!trainer || !product) return null

                    return (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        trainer={trainer}
                        product={product}
                        onReview={!hasReview ? setReviewingBookingId : undefined}
                        showActions={booking.state === "completed"}
                      />
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </AuthGuard>
    </AppShell>
  )
}
