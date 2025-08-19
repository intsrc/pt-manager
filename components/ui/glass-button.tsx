import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { Button, type ButtonProps } from "./button"

export interface GlassButtonProps extends ButtonProps {
  glassVariant?: "default" | "primary" | "secondary" | "premium"
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, glassVariant = "default", ...props }, ref) => {
    const glassVariants = {
      default: "btn-prisma-outline",
      primary: "btn-prisma",
      secondary: "btn-prisma-secondary",
      premium: "prisma-gradient text-white border-0 prisma-hover",
    }

    return <Button ref={ref} className={cn(glassVariants[glassVariant], className)} {...props} />
  },
)
GlassButton.displayName = "GlassButton"

export { GlassButton }
