"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import type { TimeSlot } from "@/lib/booking"
import { cn } from "@/lib/utils"

interface TimeGridProps {
  slots: TimeSlot[]
  selectedSlot?: string
  onSlotSelect: (start: string) => void
  date: string
}

export function TimeGrid({ slots, selectedSlot, onSlotSelect, date }: TimeGridProps) {
  if (slots.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No availability</h3>
        <p className="text-muted-foreground">No time slots available for this date</p>
      </GlassCard>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
        <p className="text-sm text-muted-foreground">{slots.filter((s) => s.available).length} slots available</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {slots.map((slot) => (
          <Button
            key={slot.start}
            variant={selectedSlot === slot.start ? "default" : "outline"}
            disabled={!slot.available}
            onClick={() => slot.available && onSlotSelect(slot.start)}
            className={cn(
              "h-auto py-3 px-4 flex flex-col items-center space-y-1 glass-button",
              selectedSlot === slot.start && "bg-primary/20 text-primary border-primary/30",
              !slot.available && "opacity-50 cursor-not-allowed",
            )}
          >
            <span className="font-medium">{slot.start}</span>
            <span className="text-xs text-muted-foreground">{slot.end}</span>
            {!slot.available && slot.reason && (
              <Badge variant="secondary" className="text-xs">
                {slot.reason}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
