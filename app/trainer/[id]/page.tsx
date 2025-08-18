"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimeGrid } from "@/components/booking/time-grid"
import { Star, MapPin, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import { storage } from "@/lib/storage"
import { BookingService } from "@/lib/booking"
import { AuthService } from "@/lib/auth"
import type { Trainer, Product, Review } from "@/lib/types"
import type { TimeSlot } from "@/lib/booking"

export default function TrainerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const trainerId = params.id as string

  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())

  useEffect(() => {
    const trainers = storage.getTrainers()
    const foundTrainer = trainers.find((t) => t.id === trainerId)
    setTrainer(foundTrainer || null)

    if (foundTrainer) {
      const trainerProducts = storage.getProducts().filter((p) => foundTrainer.products.includes(p.id))
      setProducts(trainerProducts)
      if (trainerProducts.length > 0) {
        setSelectedProduct(trainerProducts[0])
      }

      // Set default date to today
      const today = new Date().toISOString().split("T")[0]
      setSelectedDate(today)
    }

    setReviews(storage.getReviews())
  }, [trainerId])

  useEffect(() => {
    if (trainer && selectedProduct && selectedDate) {
      const slots = BookingService.generateTimeSlots(trainer, selectedProduct, selectedDate)
      setTimeSlots(slots)
      setSelectedSlot("") // Reset selected slot when date/product changes
    }
  }, [trainer, selectedProduct, selectedDate])

  const handleBooking = () => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "client") {
      router.push("/auth")
      return
    }

    if (!trainer || !selectedProduct || !selectedDate || !selectedSlot) return

    router.push(`/book/${trainerId}?productId=${selectedProduct.id}&date=${selectedDate}&start=${selectedSlot}`)
  }

  const getWeekDates = (startDate: Date) => {
    const dates = []
    const start = new Date(startDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates(currentWeek)

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  if (!trainer) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Trainer not found</h1>
          <Button onClick={() => router.push("/find")} className="glass-button">
            Back to search
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={trainer.avatarUrl || "/placeholder.svg"} alt={trainer.name} />
              <AvatarFallback className="text-2xl">{trainer.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{trainer.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{trainer.rating}</span>
                    <span className="text-muted-foreground">({trainer.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Kolizey Fitness Center</span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground">{trainer.bio}</p>

              <div className="flex flex-wrap gap-2">
                {trainer.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex space-x-1">
                  {trainer.languages.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Main Content */}
        <Tabs defaultValue="availability" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-6">
            {/* Product Selection */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Select Service</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <GlassCard
                    key={product.id}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      selectedProduct?.id === product.id
                        ? "bg-primary/20 border-primary/30 text-primary"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{product.durationMin} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">{product.price} UAH</span>
                          </div>
                        </div>
                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                        )}
                      </div>
                      {product.introOffer && <Badge variant="secondary">Intro</Badge>}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </GlassCard>

            {/* Week Navigation */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")} className="glass-button">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">
                  {weekDates[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigateWeek("next")} className="glass-button">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const dateStr = date.toISOString().split("T")[0]
                  const isSelected = selectedDate === dateStr
                  const isToday = dateStr === new Date().toISOString().split("T")[0]

                  return (
                    <Button
                      key={dateStr}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-auto py-2 px-1 flex flex-col items-center glass-button ${
                        isSelected ? "bg-primary/20 text-primary border-primary/30" : ""
                      } ${isToday ? "ring-2 ring-primary/50" : ""}`}
                    >
                      <span className="text-xs">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                      <span className="text-sm font-semibold">{date.getDate()}</span>
                    </Button>
                  )
                })}
              </div>
            </GlassCard>

            {/* Time Slots */}
            {selectedProduct && selectedDate && (
              <GlassCard className="p-6">
                <TimeGrid
                  slots={timeSlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                  date={selectedDate}
                />

                {selectedSlot && (
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Selected Session</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedProduct.name} on{" "}
                          {new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at {selectedSlot}
                        </p>
                      </div>
                      <GlassButton glassVariant="primary" onClick={handleBooking}>
                        Book Session - {selectedProduct.price} UAH
                      </GlassButton>
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="about">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">About {trainer.name}</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground">{trainer.bio}</p>

                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {trainer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Languages</h4>
                  <div className="flex space-x-2">
                    {trainer.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="reviews">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reviews</h3>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Reviews will be displayed here</p>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
