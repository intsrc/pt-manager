"use client"

import type React from "react"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  bookingId: string
  trainerName: string
  onSubmit: (rating: number, text: string) => void
  onCancel: () => void
}

export function ReviewForm({ bookingId, trainerName, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating > 0) {
      onSubmit(rating, reviewText)
    }
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Review Your Session with {trainerName}</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rating</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground hover:text-yellow-400",
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label htmlFor="review" className="text-sm font-medium">
            Review (Optional)
          </label>
          <Textarea
            id="review"
            placeholder="Share your experience with this trainer..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="bg-transparent min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{reviewText.length}/500</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <GlassButton type="submit" glassVariant="primary" disabled={rating === 0}>
            Submit Review
          </GlassButton>
          <Button type="button" variant="outline" onClick={onCancel} className="glass-button bg-transparent">
            Cancel
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}
