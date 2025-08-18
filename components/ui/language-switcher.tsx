"use client"

import { useState, useEffect } from "react"
import { GlassButton } from "@/components/ui/glass-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { getLanguageFromStorage, setLanguageInStorage, type Language } from "@/lib/i18n"

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    setLanguage(getLanguageFromStorage())
  }, [])

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setLanguageInStorage(newLanguage)
    // In a real app, you would trigger a re-render of the entire app
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GlassButton variant="secondary" size="sm">
          <Languages className="w-4 h-4 mr-2" />
          {language.toUpperCase()}
        </GlassButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        <DropdownMenuItem onClick={() => handleLanguageChange("en")}>🇺🇸 English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("uk")}>🇺🇦 Українська</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
