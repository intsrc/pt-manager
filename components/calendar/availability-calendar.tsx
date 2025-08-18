"use client"

import type React from "react"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react"
import type { AvailabilityRule, ExceptionWindow } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AvailabilityCalendarProps {
  rules: AvailabilityRule[]
  exceptions: ExceptionWindow[]
  onRuleAdd: (rule: Omit<AvailabilityRule, "id">) => void
  onRuleUpdate: (id: string, rule: Partial<AvailabilityRule>) => void
  onRuleDelete: (id: string) => void
  onExceptionAdd: (exception: Omit<ExceptionWindow, "id">) => void
  onExceptionDelete: (id: string) => void
}

export function AvailabilityCalendar({
  rules,
  exceptions,
  onRuleAdd,
  onRuleUpdate,
  onRuleDelete,
  onExceptionAdd,
  onExceptionDelete,
}: AvailabilityCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editingRule, setEditingRule] = useState<AvailabilityRule | null>(null)
  const [newRule, setNewRule] = useState({
    weekday: 1 as 1 | 2 | 3 | 4 | 5 | 6 | 7,
    start: "09:00",
    end: "17:00",
    slotSizeMin: 60 as 30 | 60,
    bufferBeforeMin: 10,
    bufferAfterMin: 10,
  })

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const getWeekDates = (startDate: Date) => {
    const dates = []
    const start = new Date(startDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates(currentWeek)

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const getRulesForDay = (weekday: number) => {
    return rules.filter((rule) => rule.weekday === weekday)
  }

  const getExceptionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return exceptions.filter((exception) => exception.date === dateStr)
  }

  const handleRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRule) {
      onRuleUpdate(editingRule.id, newRule)
      setEditingRule(null)
    } else {
      onRuleAdd(newRule)
    }
    setShowRuleForm(false)
    setNewRule({
      weekday: 1,
      start: "09:00",
      end: "17:00",
      slotSizeMin: 60,
      bufferBeforeMin: 10,
      bufferAfterMin: 10,
    })
  }

  const startEdit = (rule: AvailabilityRule) => {
    setEditingRule(rule)
    setNewRule({
      weekday: rule.weekday,
      start: rule.start,
      end: rule.end,
      slotSizeMin: rule.slotSizeMin,
      bufferBeforeMin: rule.bufferBeforeMin,
      bufferAfterMin: rule.bufferAfterMin,
    })
    setShowRuleForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")} className="glass-button">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">
            {weekDates[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")} className="glass-button">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </GlassCard>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const weekday = index + 1
          const dayRules = getRulesForDay(weekday)
          const dayExceptions = getExceptionsForDate(date)
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <GlassCard
              key={date.toISOString()}
              className={cn("p-4 min-h-[200px]", isToday && "ring-2 ring-primary/50")}
            >
              <div className="space-y-3">
                <div className="text-center">
                  <h4 className="font-semibold text-sm">{weekdays[index]}</h4>
                  <p className="text-xs text-muted-foreground">{date.getDate()}</p>
                </div>

                {/* Rules */}
                <div className="space-y-2">
                  {dayRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="bg-primary/20 border border-primary/30 rounded-lg p-2 text-xs group hover:bg-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {rule.start} - {rule.end}
                          </div>
                          <div className="text-muted-foreground">{rule.slotSizeMin}min slots</div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(rule)} className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRuleDelete(rule.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exceptions */}
                {dayExceptions.map((exception) => (
                  <div key={exception.id} className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="destructive" className="text-xs">
                          {exception.type}
                        </Badge>
                        <div className="text-muted-foreground mt-1">
                          {exception.start} - {exception.end}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onExceptionDelete(exception.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Add Rule Button */}
      <div className="text-center">
        <Button onClick={() => setShowRuleForm(true)} className="glass-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Availability Rule
        </Button>
      </div>

      {/* Rule Form */}
      {showRuleForm && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editingRule ? "Edit" : "Add"} Availability Rule</h3>

          <form onSubmit={handleRuleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={newRule.weekday.toString()}
                  onValueChange={(value) =>
                    setNewRule({ ...newRule, weekday: Number(value) as 1 | 2 | 3 | 4 | 5 | 6 | 7 })
                  }
                >
                  <SelectTrigger className="bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdays.map((day, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Slot Size</Label>
                <Select
                  value={newRule.slotSizeMin.toString()}
                  onValueChange={(value) => setNewRule({ ...newRule, slotSizeMin: Number(value) as 30 | 60 })}
                >
                  <SelectTrigger className="bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newRule.start}
                  onChange={(e) => setNewRule({ ...newRule, start: e.target.value })}
                  className="bg-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newRule.end}
                  onChange={(e) => setNewRule({ ...newRule, end: e.target.value })}
                  className="bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buffer Before (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={newRule.bufferBeforeMin}
                  onChange={(e) => setNewRule({ ...newRule, bufferBeforeMin: Number(e.target.value) })}
                  className="bg-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Buffer After (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={newRule.bufferAfterMin}
                  onChange={(e) => setNewRule({ ...newRule, bufferAfterMin: Number(e.target.value) })}
                  className="bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="glass-button">
                {editingRule ? "Update" : "Add"} Rule
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRuleForm(false)
                  setEditingRule(null)
                }}
                className="glass-button bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  )
}
