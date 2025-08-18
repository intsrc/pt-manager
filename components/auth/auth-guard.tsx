"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import type { UserRole, AuthUser } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallbackPath?: string
}

export function AuthGuard({ children, requiredRole, fallbackPath = "/auth" }: AuthGuardProps) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)

    if (!currentUser) {
      router.push(fallbackPath)
      return
    }

    if (requiredRole && currentUser.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user's role
      switch (currentUser.role) {
        case "client":
          router.push("/")
          break
        case "trainer":
          router.push("/trainer")
          break
        case "desk":
          router.push("/desk")
          break
      }
    }
  }, [router, requiredRole, fallbackPath])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
