import type {
  Venue,
  Trainer,
  Product,
  Client,
  Booking,
  PaymentIntent,
  CheckIn,
  Review,
  Settings,
  ExceptionWindow,
} from "./types"

const SEED_VERSION = "1.0.0"

export class LocalStorage {
  private static getKey(key: string): string {
    return `pt::${key}`
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key))
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(this.getKey(key))
  }

  static clear(): void {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("pt::"))
    keys.forEach((key) => localStorage.removeItem(key))
  }
}

export const seedData = {
  venue: {
    id: "v_kolizey",
    name: "Kolizey",
    address: "Kyiv, Ukraine",
    tz: "Europe/Kyiv",
  } as Venue,

  trainers: [
    {
      id: "t_oksana",
      name: "Oksana K.",
      avatarUrl: "/professional-female-fitness-trainer.png",
      bio: "Certified strength and mobility specialist with 8+ years experience",
      specialties: ["Strength", "Mobility", "Functional Training"],
      rating: 4.9,
      reviewCount: 122,
      products: ["p_ok_60", "p_ok_intro"],
      availabilityRules: [
        {
          id: "ar1",
          weekday: 1,
          start: "08:00",
          end: "14:00",
          slotSizeMin: 60,
          bufferBeforeMin: 10,
          bufferAfterMin: 10,
        },
        {
          id: "ar2",
          weekday: 3,
          start: "16:00",
          end: "20:00",
          slotSizeMin: 60,
          bufferBeforeMin: 10,
          bufferAfterMin: 10,
        },
      ],
      blackoutDates: ["2025-09-01"],
      languages: ["uk", "en"],
    },
    {
      id: "t_dmitro",
      name: "Dmitro S.",
      avatarUrl: "/professional-male-fitness-trainer.png",
      bio: "Olympic weightlifting coach and nutrition specialist",
      specialties: ["Olympic Lifting", "Powerlifting", "Nutrition"],
      rating: 4.8,
      reviewCount: 89,
      products: ["p_dm_90", "p_dm_60"],
      availabilityRules: [
        {
          id: "ar3",
          weekday: 2,
          start: "09:00",
          end: "17:00",
          slotSizeMin: 60,
          bufferBeforeMin: 15,
          bufferAfterMin: 15,
        },
      ],
      blackoutDates: [],
      languages: ["uk", "en", "ru"],
    },
  ] as Trainer[],

  products: [
    {
      id: "p_ok_60",
      trainerId: "t_oksana",
      name: "Personal Training 60",
      durationMin: 60,
      price: 700,
      currency: "UAH",
      description: "Full strength and mobility session",
    },
    {
      id: "p_ok_intro",
      trainerId: "t_oksana",
      name: "Intro Session",
      durationMin: 30,
      price: 350,
      currency: "UAH",
      introOffer: true,
      description: "First-time client introduction session",
    },
    {
      id: "p_dm_90",
      trainerId: "t_dmitro",
      name: "Olympic Lifting 90",
      durationMin: 90,
      price: 1000,
      currency: "UAH",
      description: "Advanced Olympic lifting technique session",
    },
    {
      id: "p_dm_60",
      trainerId: "t_dmitro",
      name: "Strength Training 60",
      durationMin: 60,
      price: 800,
      currency: "UAH",
      description: "Powerlifting and strength development",
    },
  ] as Product[],

  clients: [
    {
      id: "c_demo",
      name: "Demo Client",
      phone: "+380000000000",
      email: "demo@example.com",
    },
  ] as Client[],

  bookings: [
    {
      id: "b_demo_1",
      trainerId: "t_oksana",
      clientId: "c_demo",
      venueId: "v_kolizey",
      productId: "p_ok_60",
      date: new Date().toISOString().split("T")[0],
      start: "10:00",
      end: "11:00",
      price: 700,
      currency: "UAH",
      state: "confirmed",
      code: "DEMO001",
      qrPayload: "booking:b_demo_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b_demo_2",
      trainerId: "t_dmitro",
      clientId: "c_demo",
      venueId: "v_kolizey",
      productId: "p_dm_60",
      date: new Date().toISOString().split("T")[0],
      start: "14:00",
      end: "15:00",
      price: 800,
      currency: "UAH",
      state: "checked_in",
      code: "DEMO002",
      qrPayload: "booking:b_demo_2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as Booking[],

  paymentIntents: [] as PaymentIntent[],
  checkins: [] as CheckIn[],
  reviews: [] as Review[],
  availabilityExceptions: [] as ExceptionWindow[],
}

export function initializeStorage(): void {
  const currentVersion = LocalStorage.get<string>("seedVersion")

  if (currentVersion !== SEED_VERSION) {
    // Initialize with seed data
    Object.entries(seedData).forEach(([key, value]) => {
      LocalStorage.set(key, value)
    })

    // Set default settings
    LocalStorage.set("settings", {
      locale: "en",
      theme: "dark",
      role: "client",
    } as Settings)

    LocalStorage.set("seedVersion", SEED_VERSION)
    console.log("Storage initialized with seed data")
  }
}

// Data access functions
export const storage = {
  getVenue: () => LocalStorage.get<Venue>("venue"),
  getTrainers: () => LocalStorage.get<Trainer[]>("trainers") || [],
  getProducts: () => LocalStorage.get<Product[]>("products") || [],
  getClients: () => LocalStorage.get<Client[]>("clients") || [],
  getBookings: () => LocalStorage.get<Booking[]>("bookings") || [],
  getPaymentIntents: () => LocalStorage.get<PaymentIntent[]>("paymentIntents") || [],
  getCheckIns: () => LocalStorage.get<CheckIn[]>("checkins") || [],
  getReviews: () => LocalStorage.get<Review[]>("reviews") || [],
  getSettings: () => LocalStorage.get<Settings>("settings") || { locale: "en", theme: "dark", role: "client" },
  getAvailabilityExceptions: () => LocalStorage.get<ExceptionWindow[]>("availabilityExceptions") || [],

  setTrainers: (trainers: Trainer[]) => LocalStorage.set("trainers", trainers),
  setProducts: (products: Product[]) => LocalStorage.set("products", products),
  setClients: (clients: Client[]) => LocalStorage.set("clients", clients),
  setBookings: (bookings: Booking[]) => LocalStorage.set("bookings", bookings),
  setPaymentIntents: (intents: PaymentIntent[]) => LocalStorage.set("paymentIntents", intents),
  setCheckIns: (checkins: CheckIn[]) => LocalStorage.set("checkins", checkins),
  setReviews: (reviews: Review[]) => LocalStorage.set("reviews", reviews),
  setSettings: (settings: Settings) => LocalStorage.set("settings", settings),
  setAvailabilityExceptions: (exceptions: ExceptionWindow[]) => LocalStorage.set("availabilityExceptions", exceptions),

  reset: () => LocalStorage.clear(),
}

export function getBookings(): Booking[] {
  return storage.getBookings()
}

export function updateBooking(bookingId: string, updates: Partial<Booking>): void {
  const bookings = storage.getBookings()
  const bookingIndex = bookings.findIndex((b) => b.id === bookingId)

  if (bookingIndex !== -1) {
    bookings[bookingIndex] = { ...bookings[bookingIndex], ...updates }
    storage.setBookings(bookings)
  }
}

export function addBooking(booking: Booking): void {
  const bookings = storage.getBookings()
  bookings.push(booking)
  storage.setBookings(bookings)
}

export function deleteBooking(bookingId: string): void {
  const bookings = storage.getBookings()
  const filteredBookings = bookings.filter((b) => b.id !== bookingId)
  storage.setBookings(filteredBookings)
}
