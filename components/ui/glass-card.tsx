import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle" | "premium"
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "glass-card",
    elevated: "glass-effect shadow-lg",
    subtle: "bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg shadow-sm",
    premium: "prisma-gradient backdrop-blur-md border border-white/10 rounded-lg shadow-xl text-white",
  }

  return <div ref={ref} className={cn(variants[variant], className)} {...props} />
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
