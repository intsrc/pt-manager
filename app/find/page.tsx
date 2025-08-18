"use client"

import { useState, useEffect, useMemo } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { TrainerCard } from "@/components/trainers/trainer-card"
import { Search, Filter, X } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Trainer, Product } from "@/lib/types"

interface Filters {
  search: string
  specialties: string[]
  priceRange: [number, number]
  rating: number
  languages: string[]
}

export default function FindTrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<Filters>({
    search: "",
    specialties: [],
    priceRange: [200, 1500],
    rating: 0,
    languages: [],
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setTrainers(storage.getTrainers())
    setProducts(storage.getProducts())
  }, [])

  const allSpecialties = useMemo(() => {
    const specialties = new Set<string>()
    trainers.forEach((trainer) => {
      trainer.specialties.forEach((specialty) => specialties.add(specialty))
    })
    return Array.from(specialties).sort()
  }, [trainers])

  const allLanguages = useMemo(() => {
    const languages = new Set<string>()
    trainers.forEach((trainer) => {
      trainer.languages.forEach((lang) => languages.add(lang))
    })
    return Array.from(languages).sort()
  }, [trainers])

  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = trainer.name.toLowerCase().includes(searchLower)
        const matchesBio = trainer.bio.toLowerCase().includes(searchLower)
        const matchesSpecialties = trainer.specialties.some((s) => s.toLowerCase().includes(searchLower))
        if (!matchesName && !matchesBio && !matchesSpecialties) return false
      }

      // Specialties filter
      if (filters.specialties.length > 0) {
        const hasSpecialty = filters.specialties.some((specialty) => trainer.specialties.includes(specialty))
        if (!hasSpecialty) return false
      }

      // Rating filter
      if (filters.rating > 0 && trainer.rating < filters.rating) return false

      // Languages filter
      if (filters.languages.length > 0) {
        const hasLanguage = filters.languages.some((lang) => trainer.languages.includes(lang))
        if (!hasLanguage) return false
      }

      // Price range filter
      const trainerProducts = products.filter((p) => trainer.products.includes(p.id))
      if (trainerProducts.length > 0) {
        const minPrice = Math.min(...trainerProducts.map((p) => p.price))
        const maxPrice = Math.max(...trainerProducts.map((p) => p.price))
        if (maxPrice < filters.priceRange[0] || minPrice > filters.priceRange[1]) return false
      }

      return true
    })
  }, [trainers, products, filters])

  const toggleSpecialty = (specialty: string) => {
    setFilters((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const toggleLanguage = (language: string) => {
    setFilters((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      specialties: [],
      priceRange: [200, 1500],
      rating: 0,
      languages: [],
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.specialties.length > 0 ||
    filters.rating > 0 ||
    filters.languages.length > 0 ||
    filters.priceRange[0] !== 200 ||
    filters.priceRange[1] !== 1500

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Find Your Perfect Trainer</h1>
          <p className="text-muted-foreground">Discover certified personal trainers at Kolizey</p>
        </div>

        {/* Search and Filter Bar */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search trainers, specialties..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-10 bg-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="glass-button flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs rounded-full" />}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-border/40 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X className="h-4 w-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Specialties */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {allSpecialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant={filters.specialties.includes(specialty) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => toggleSpecialty(specialty)}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Price Range (UAH)</h4>
                  <div className="px-2">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
                      }
                      max={1500}
                      min={200}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{filters.priceRange[0]} UAH</span>
                      <span>{filters.priceRange[1]} UAH</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Minimum Rating</h4>
                  <Select
                    value={filters.rating.toString()}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, rating: Number(value) }))}
                  >
                    <SelectTrigger className="bg-transparent">
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4.8">4.8+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Languages */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {allLanguages.map((language) => (
                      <Badge
                        key={language}
                        variant={filters.languages.includes(language) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => toggleLanguage(language)}
                      >
                        {language.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? "s" : ""} found
            </h2>
            <Select defaultValue="recommended">
              <SelectTrigger className="w-48 bg-transparent glass-button">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredTrainers.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
              <Button onClick={clearFilters} variant="outline" className="glass-button bg-transparent">
                Clear filters
              </Button>
            </GlassCard>
          ) : (
            <div className="grid gap-6">
              {filteredTrainers.map((trainer) => (
                <TrainerCard key={trainer.id} trainer={trainer} products={products} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
