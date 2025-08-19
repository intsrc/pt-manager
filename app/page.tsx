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
      <div className="space-y-16">
        <section className="text-center space-y-8 py-16">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-full">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Premium Fitness Platform</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Transform Your
              <br />
              <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                Fitness Journey
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience world-class personal training with certified elite trainers at Kolizey's premium fitness center
            </p>
          </div>

          <GlassCard className="max-w-lg mx-auto p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search trainers, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-transparent border-0 text-base focus:ring-0"
              />
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/find">
              <GlassButton size="lg" className="btn-prisma px-8 py-3">
                Discover Trainers
              </GlassButton>
            </Link>
            <Link href="/auth">
              <GlassButton size="lg" className="btn-prisma-outline px-8 py-3">
                Get Started
              </GlassButton>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <GlassCard key={index} className="p-6 text-center prisma-hover">
                <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </GlassCard>
            )
          })}
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Meet Our Trainers</h2>
            <p className="text-lg text-muted-foreground">Certified fitness professionals ready to help you succeed</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {trainers.slice(0, 2).map((trainer) => (
              <GlassCard key={trainer.id} className="p-6 prisma-hover">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={trainer.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg font-semibold">{trainer.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-foreground">{trainer.name}</h3>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{trainer.rating}</span>
                        <span className="text-muted-foreground">({trainer.reviewCount})</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed">{trainer.bio}</p>

                    <div className="flex flex-wrap gap-2">
                      {trainer.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-foreground">From 350 UAH</span>
                      <Link href={`/trainer/${trainer.id}`}>
                        <GlassButton size="sm" className="btn-prisma-secondary">
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
