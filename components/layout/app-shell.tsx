"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { Home, Search, Calendar, User, Settings, QrCode, BarChart3, Users } from "lucide-react"
import { initializeStorage } from "@/lib/storage"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    initializeStorage()
  }, [])

  const getNavItems = () => {
    if (!user) return []

    switch (user.role) {
      case "client":
        return [
          { href: "/", icon: Home, label: "Home" },
          { href: "/find", icon: Search, label: "Find Trainers" },
          { href: "/me", icon: User, label: "My Bookings" },
          { href: "/me/settings", icon: Settings, label: "Settings" },
        ]
      case "trainer":
        return [
          { href: "/trainer", icon: BarChart3, label: "Dashboard" },
          { href: "/trainer/calendar", icon: Calendar, label: "Calendar" },
          { href: "/trainer/bookings", icon: Users, label: "Bookings" },
          { href: "/trainer/products", icon: Settings, label: "Products" },
        ]
      case "desk":
        return [
          { href: "/desk", icon: QrCode, label: "Dashboard" },
          { href: "/desk/checkin", icon: QrCode, label: "QR Check-in" },
          { href: "/desk/search", icon: Search, label: "Manual Search" },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40">
        <GlassCard className="rounded-none border-x-0 border-t-0">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-semibold text-lg">Kolizey PT</span>
            </Link>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <UserMenu />
            </div>
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className={cn("container mx-auto px-4 py-6", navItems.length > 0 && "md:ml-64")}>{children}</main>

      {/* Bottom Navigation (Mobile) */}
      {navItems.length > 0 && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <GlassCard className="rounded-none border-x-0 border-b-0">
            <div className="flex items-center justify-around py-2">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex flex-col items-center space-y-1 h-auto py-2 px-3",
                        isActive && "text-primary bg-primary/10",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </GlassCard>
        </nav>
      )}

      {/* Desktop Sidebar */}
      {navItems.length > 0 && (
        <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 z-40">
          <GlassCard className="h-full rounded-none border-y-0 border-l-0">
            <div className="p-6">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn("w-full justify-start glass-button", isActive && "bg-primary/20 text-primary")}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </GlassCard>
        </aside>
      )}
    </div>
  )
}
