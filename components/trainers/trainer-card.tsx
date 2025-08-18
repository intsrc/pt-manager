import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Star, Clock, DollarSign } from "lucide-react"
import type { Trainer, Product } from "@/lib/types"

interface TrainerCardProps {
  trainer: Trainer
  products: Product[]
  nextSlots?: Array<{ date: string; time: string }>
}

export function TrainerCard({ trainer, products, nextSlots = [] }: TrainerCardProps) {
  const trainerProducts = products.filter((p) => trainer.products.includes(p.id))
  const minPrice = Math.min(...trainerProducts.map((p) => p.price))

  return (
    <GlassCard className="p-6 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-start space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={trainer.avatarUrl || "/placeholder.svg"} alt={trainer.name} />
          <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{trainer.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{trainer.rating}</span>
                  <span className="text-xs text-muted-foreground">({trainer.reviewCount})</span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-sm">from {minPrice} UAH</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{trainer.bio}</p>

          <div className="flex flex-wrap gap-2">
            {trainer.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {trainer.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trainer.specialties.length - 3} more
              </Badge>
            )}
          </div>

          {nextSlots.length > 0 && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-2">
                {nextSlots.slice(0, 3).map((slot, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {slot.time}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-1">
              {trainer.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang.toUpperCase()}
                </Badge>
              ))}
            </div>
            <Link href={`/trainer/${trainer.id}`}>
              <Button size="sm" className="glass-button">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
