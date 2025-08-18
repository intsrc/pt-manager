import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { Button, type ButtonProps } from "./button"

export interface GlassButtonProps extends ButtonProps {
  glassVariant?: "default" | "primary" | "secondary" | "premium"
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, glassVariant = "default", ...props }, ref) => {
    const glassVariants = {
      default:
        "bg-card/80 backdrop-blur-xl border border-border/40 rounded-xl transition-all duration-300 hover:bg-card/90 hover:shadow-2xl hover:-translate-y-0.5 text-card-foreground font-medium",
      primary:
        "bg-primary/90 backdrop-blur-xl border border-primary/20 rounded-xl transition-all duration-300 hover:bg-primary hover:shadow-2xl hover:-translate-y-0.5 text-primary-foreground font-semibold",
      secondary:
        "bg-secondary/90 backdrop-blur-xl border border-secondary/20 rounded-xl transition-all duration-300 hover:bg-secondary hover:shadow-2xl hover:-translate-y-0.5 text-secondary-foreground font-semibold",
      premium:
        "premium-gradient backdrop-blur-xl border border-white/20 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 text-white font-semibold pulse-glow",
    }

    return <Button ref={ref} className={cn(glassVariants[glassVariant], className)} {...props} />
  },
)
GlassButton.displayName = "GlassButton"

export { GlassButton }
