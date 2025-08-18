"use client"

// Internationalization support
export type Language = "en" | "uk"

export interface Translations {
  // Navigation
  nav: {
    find: string
    bookings: string
    profile: string
    dashboard: string
    calendar: string
    products: string
    checkin: string
  }

  // Common
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    edit: string
    delete: string
    search: string
    filter: string
    back: string
    next: string
    previous: string
  }

  // Auth
  auth: {
    selectRole: string
    client: string
    trainer: string
    desk: string
    selectIdentity: string
    createNew: string
    welcome: string
  }

  // Booking
  booking: {
    findTrainer: string
    bookSession: string
    selectTime: string
    confirmBooking: string
    bookingConfirmed: string
    checkIn: string
    completed: string
    cancelled: string
    reschedule: string
    review: string
  }

  // Status
  status: {
    held: string
    confirmed: string
    checkedIn: string
    completed: string
    cancelledClient: string
    cancelledTrainer: string
    noShow: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      find: "Find Trainers",
      bookings: "My Bookings",
      profile: "Profile",
      dashboard: "Dashboard",
      calendar: "Calendar",
      products: "Products",
      checkin: "Check-in",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      search: "Search",
      filter: "Filter",
      back: "Back",
      next: "Next",
      previous: "Previous",
    },
    auth: {
      selectRole: "Select Your Role",
      client: "Client",
      trainer: "Trainer",
      desk: "Desk Staff",
      selectIdentity: "Select Identity",
      createNew: "Create New Profile",
      welcome: "Welcome",
    },
    booking: {
      findTrainer: "Find a Trainer",
      bookSession: "Book Session",
      selectTime: "Select Time",
      confirmBooking: "Confirm Booking",
      bookingConfirmed: "Booking Confirmed",
      checkIn: "Check In",
      completed: "Completed",
      cancelled: "Cancelled",
      reschedule: "Reschedule",
      review: "Write Review",
    },
    status: {
      held: "Held",
      confirmed: "Confirmed",
      checkedIn: "Checked In",
      completed: "Completed",
      cancelledClient: "Cancelled by Client",
      cancelledTrainer: "Cancelled by Trainer",
      noShow: "No Show",
    },
  },
  uk: {
    nav: {
      find: "Знайти Тренерів",
      bookings: "Мої Бронювання",
      profile: "Профіль",
      dashboard: "Панель",
      calendar: "Календар",
      products: "Послуги",
      checkin: "Реєстрація",
    },
    common: {
      loading: "Завантаження...",
      error: "Помилка",
      success: "Успішно",
      cancel: "Скасувати",
      confirm: "Підтвердити",
      save: "Зберегти",
      edit: "Редагувати",
      delete: "Видалити",
      search: "Пошук",
      filter: "Фільтр",
      back: "Назад",
      next: "Далі",
      previous: "Попередній",
    },
    auth: {
      selectRole: "Оберіть Вашу Роль",
      client: "Клієнт",
      trainer: "Тренер",
      desk: "Персонал",
      selectIdentity: "Оберіть Профіль",
      createNew: "Створити Новий",
      welcome: "Ласкаво просимо",
    },
    booking: {
      findTrainer: "Знайти Тренера",
      bookSession: "Забронювати",
      selectTime: "Оберіть Час",
      confirmBooking: "Підтвердити Бронювання",
      bookingConfirmed: "Бронювання Підтверджено",
      checkIn: "Реєстрація",
      completed: "Завершено",
      cancelled: "Скасовано",
      reschedule: "Перенести",
      review: "Залишити Відгук",
    },
    status: {
      held: "Утримується",
      confirmed: "Підтверджено",
      checkedIn: "Зареєстровано",
      completed: "Завершено",
      cancelledClient: "Скасовано Клієнтом",
      cancelledTrainer: "Скасовано Тренером",
      noShow: "Не З'явився",
    },
  },
}

export function useTranslations(language: Language = "en"): Translations {
  return translations[language]
}

export function getLanguageFromStorage(): Language {
  if (typeof window === "undefined") return "en"
  return (localStorage.getItem("language") as Language) || "en"
}

export function setLanguageInStorage(language: Language): void {
  if (typeof window === "undefined") return
  localStorage.setItem("language", language)
}
