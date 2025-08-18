import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle" | "premium"
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl premium-hover",
    elevated: "bg-card/95 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-3xl premium-hover pulse-glow",
    subtle: "bg-card/80 backdrop-blur-lg border border-border/30 rounded-xl shadow-xl premium-hover",
    premium:
      "premium-gradient backdrop-blur-2xl border border-white/20 rounded-3xl shadow-3xl premium-hover text-white",
  }

  return <div ref={ref} className={cn(variants[variant], className)} {...props} />
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
