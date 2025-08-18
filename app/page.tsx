"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, Clock, Users, TrendingUp, Sparkles } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Trainer } from "@/lib/types"

export default function HomePage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setTrainers(storage.getTrainers())
  }, [])

  const stats = [
    { label: "Elite Trainers", value: trainers.length, icon: Users },
    { label: "Avg Rating", value: "4.9", icon: Star },
    { label: "Sessions Today", value: "32", icon: Clock },
    { label: "Growth", value: "+18%", icon: TrendingUp },
  ]

  return (
    <AppShell>
      <div className="space-y-12">
        <section className="text-center space-y-8 py-12">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-secondary mr-2" />
              <span className="text-sm font-medium text-secondary uppercase tracking-wider">Premium Fitness</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              Transform Your
              <br />
              <span className="text-secondary">Fitness Journey</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience world-class personal training with certified elite trainers at Kolizey's premium fitness center
            </p>
          </div>

          <GlassCard variant="elevated" className="max-w-lg mx-auto p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search elite trainers, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-transparent border-border/30 text-lg rounded-xl"
              />
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/find">
              <GlassButton glassVariant="premium" size="lg" className="px-8 py-4 text-lg">
                Discover Trainers
              </GlassButton>
            </Link>
            <Link href="/auth">
              <GlassButton glassVariant="primary" size="lg" className="px-8 py-4 text-lg">
                Get Started
              </GlassButton>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <GlassCard key={index} variant="elevated" className="p-8 text-center group">
                <Icon className="h-10 w-10 mx-auto mb-4 text-secondary group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </GlassCard>
            )
          })}
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-primary">Elite Trainers</h2>
            <p className="text-lg text-muted-foreground">Meet our certified fitness professionals</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {trainers.slice(0, 2).map((trainer) => (
              <GlassCard key={trainer.id} variant="elevated" className="p-8 group">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-20 w-20 ring-4 ring-secondary/20">
                    <AvatarImage src={trainer.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback className="text-xl font-bold">{trainer.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl text-primary">{trainer.name}</h3>
                      <div className="flex items-center space-x-2 bg-secondary/10 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-secondary text-secondary" />
                        <span className="text-sm font-semibold text-secondary">{trainer.rating}</span>
                        <span className="text-xs text-muted-foreground">({trainer.reviewCount})</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>

                    <div className="flex flex-wrap gap-2">
                      {trainer.specialties.slice(0, 3).map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="secondary"
                          className="bg-secondary/10 text-secondary border-secondary/20"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-lg font-semibold text-primary">From 350 UAH</span>
                      <Link href={`/trainer/${trainer.id}`}>
                        <GlassButton glassVariant="secondary" className="group-hover:scale-105 transition-transform">
                          View Profile
                        </GlassButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
