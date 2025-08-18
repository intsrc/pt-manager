import { nanoid } from "nanoid"
import { storage } from "./storage"
import type { Booking, Product, Trainer, PaymentIntent } from "./types"

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  reason?: string
}

export interface BookingRequest {
  trainerId: string
  productId: string
  date: string
  start: string
  clientId: string
}

export class BookingService {
  static generateTimeSlots(trainer: Trainer, product: Product, date: string): TimeSlot[] {
    const dayOfWeek = new Date(date).getDay()
    const weekday = dayOfWeek === 0 ? 7 : dayOfWeek // Convert Sunday (0) to 7

    // Find availability rules for this day
    const rules = trainer.availabilityRules.filter((rule) => rule.weekday === weekday)
    if (rules.length === 0) return []

    // Check if date is blacked out
    if (trainer.blackoutDates.includes(date)) return []

    const slots: TimeSlot[] = []
    const existingBookings = storage
      .getBookings()
      .filter(
        (booking) =>
          booking.trainerId === trainer.id &&
          booking.date === date &&
          ["held", "confirmed", "checked_in"].includes(booking.state),
      )

    rules.forEach((rule) => {
      const startTime = this.parseTime(rule.start)
      const endTime = this.parseTime(rule.end)
      const slotDuration = product.durationMin
      const bufferBefore = rule.bufferBeforeMin
      const bufferAfter = rule.bufferAfterMin

      let currentTime = startTime
      while (currentTime + slotDuration + bufferAfter <= endTime) {
        const slotStart = this.formatTime(currentTime)
        const slotEnd = this.formatTime(currentTime + slotDuration)

        // Check for conflicts with existing bookings
        const hasConflict = existingBookings.some((booking) => {
          const bookingStart = this.parseTime(booking.start)
          const bookingEnd = this.parseTime(booking.end)
          const slotStartWithBuffer = currentTime - bufferBefore
          const slotEndWithBuffer = currentTime + slotDuration + bufferAfter

          return !(slotEndWithBuffer <= bookingStart || slotStartWithBuffer >= bookingEnd)
        })

        // Check if slot is in the past
        const now = new Date()
        const slotDateTime = new Date(`${date}T${slotStart}`)
        const isPast = slotDateTime < now

        slots.push({
          start: slotStart,
          end: slotEnd,
          available: !hasConflict && !isPast,
          reason: hasConflict ? "Booked" : isPast ? "Past" : undefined,
        })

        currentTime += rule.slotSizeMin
      }
    })

    return slots.sort((a, b) => a.start.localeCompare(b.start))
  }

  static async createBooking(request: BookingRequest): Promise<Booking> {
    const trainers = storage.getTrainers()
    const products = storage.getProducts()
    const venue = storage.getVenue()

    const trainer = trainers.find((t) => t.id === request.trainerId)
    const product = products.find((p) => p.id === request.productId)

    if (!trainer || !product || !venue) {
      throw new Error("Invalid booking request")
    }

    // Verify slot is still available
    const slots = this.generateTimeSlots(trainer, product, request.date)
    const requestedSlot = slots.find((slot) => slot.start === request.start)

    if (!requestedSlot || !requestedSlot.available) {
      throw new Error("Selected time slot is no longer available")
    }

    const endTime = this.formatTime(this.parseTime(request.start) + product.durationMin)
    const bookingCode = `BKG-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const booking: Booking = {
      id: nanoid(),
      trainerId: request.trainerId,
      clientId: request.clientId,
      venueId: venue.id,
      productId: request.productId,
      date: request.date,
      start: request.start,
      end: endTime,
      price: product.price,
      currency: product.currency,
      state: "held",
      code: bookingCode,
      qrPayload: JSON.stringify({
        bookingId: nanoid(),
        code: bookingCode,
        checksum: Math.random().toString(36).substr(2, 8),
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Create payment intent
    const paymentIntent: PaymentIntent = {
      id: nanoid(),
      bookingId: booking.id,
      state: "preauth_hold",
      amount: product.price,
      currency: product.currency,
      events: [
        {
          at: new Date().toISOString(),
          type: "preauth_hold",
          note: "Payment held for booking confirmation",
        },
      ],
    }

    // Save to storage
    const bookings = storage.getBookings()
    const paymentIntents = storage.getPaymentIntents()

    bookings.push(booking)
    paymentIntents.push(paymentIntent)

    storage.setBookings(bookings)
    storage.setPaymentIntents(paymentIntents)

    // Auto-confirm after hold (simulate successful payment)
    setTimeout(() => {
      this.confirmBooking(booking.id)
    }, 1000)

    return booking
  }

  static confirmBooking(bookingId: string): void {
    const bookings = storage.getBookings()
    const paymentIntents = storage.getPaymentIntents()

    const bookingIndex = bookings.findIndex((b) => b.id === bookingId)
    const paymentIndex = paymentIntents.findIndex((p) => p.bookingId === bookingId)

    if (bookingIndex !== -1) {
      bookings[bookingIndex].state = "confirmed"
      bookings[bookingIndex].updatedAt = new Date().toISOString()
    }

    if (paymentIndex !== -1) {
      paymentIntents[paymentIndex].state = "preauth_hold"
      paymentIntents[paymentIndex].events.push({
        at: new Date().toISOString(),
        type: "confirmed",
        note: "Booking confirmed, payment authorized",
      })
    }

    storage.setBookings(bookings)
    storage.setPaymentIntents(paymentIntents)
  }

  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
  }
}
