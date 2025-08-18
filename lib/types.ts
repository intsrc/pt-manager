export type Id = string
export type Currency = "UAH"
export type Locale = "en" | "uk"
export type UserRole = "client" | "trainer" | "desk"

export interface Venue {
  id: Id
  name: string
  address: string
  tz: string
}

export interface Trainer {
  id: Id
  name: string
  avatarUrl: string
  bio: string
  specialties: string[]
  rating: number
  reviewCount: number
  products: Id[]
  availabilityRules: AvailabilityRule[]
  blackoutDates: string[]
  languages: Locale[]
}

export interface Product {
  id: Id
  trainerId: Id
  name: string
  durationMin: 30 | 45 | 60 | 90
  price: number
  currency: Currency
  introOffer?: boolean
  description?: string
}

export interface AvailabilityRule {
  id: Id
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7
  start: string
  end: string
  slotSizeMin: 30 | 60
  bufferBeforeMin: number
  bufferAfterMin: number
}

export interface ExceptionWindow {
  id: Id
  trainerId: Id
  date: string
  start: string
  end: string
  type: "closed" | "extended"
}

export interface Client {
  id: Id
  name: string
  phone: string
  email: string
}

export type BookingState =
  | "draft"
  | "held"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "canceled_client"
  | "canceled_trainer"
  | "no_show"

export interface Booking {
  id: Id
  trainerId: Id
  clientId: Id
  venueId: Id
  productId: Id
  date: string
  start: string
  end: string
  price: number
  currency: Currency
  state: BookingState
  waiverAcceptedAt?: string
  code: string
  qrPayload: string
  createdAt: string
  updatedAt: string
}

export type PaymentState = "none" | "preauth_hold" | "captured" | "voided" | "refunded"

export interface PaymentIntent {
  id: Id
  bookingId: Id
  state: PaymentState
  amount: number
  currency: Currency
  events: Array<{
    at: string
    type: string
    note?: string
  }>
}

export interface CheckIn {
  id: Id
  bookingId: Id
  at: string
  method: "client_qr" | "desk_code" | "trainer_manual"
  photoUrl?: string
}

export interface Review {
  id: Id
  bookingId: Id
  rating: 1 | 2 | 3 | 4 | 5
  text?: string
  createdAt: string
}

export interface Settings {
  locale: Locale
  theme: "system" | "light" | "dark"
  role: UserRole
  userId?: Id
}
