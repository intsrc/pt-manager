"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/auth/auth-guard"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react"
import { storage } from "@/lib/storage"
import { AuthService } from "@/lib/auth"
import type { Product, Trainer } from "@/lib/types"
import { nanoid } from "nanoid"
import { useToast } from "@/hooks/use-toast"

export default function TrainerProductsPage() {
  const { toast } = useToast()
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    durationMin: 60 as 30 | 45 | 60 | 90,
    price: 500,
    description: "",
    introOffer: false,
  })

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "trainer") return

    const trainers = storage.getTrainers()
    const currentTrainer = trainers.find((t) => t.id === currentUser.id)
    setTrainer(currentTrainer || null)

    if (currentTrainer) {
      const allProducts = storage.getProducts()
      const trainerProducts = allProducts.filter((product) => product.trainerId === currentTrainer.id)
      setProducts(trainerProducts)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trainer) return

    if (editingProduct) {
      // Update existing product
      const updatedProduct: Product = {
        ...editingProduct,
        ...formData,
        currency: "UAH",
      }

      const allProducts = storage.getProducts()
      const updatedAllProducts = allProducts.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      storage.setProducts(updatedAllProducts)

      setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))

      toast({
        title: "Product updated",
        description: "Your service has been updated successfully.",
      })
    } else {
      // Create new product
      const newProduct: Product = {
        id: nanoid(),
        trainerId: trainer.id,
        ...formData,
        currency: "UAH",
      }

      const allProducts = storage.getProducts()
      const updatedAllProducts = [...allProducts, newProduct]
      storage.setProducts(updatedAllProducts)

      // Update trainer's product list
      const trainers = storage.getTrainers()
      const updatedTrainers = trainers.map((t) =>
        t.id === trainer.id ? { ...t, products: [...t.products, newProduct.id] } : t,
      )
      storage.setTrainers(updatedTrainers)

      setProducts([...products, newProduct])

      toast({
        title: "Product created",
        description: "Your new service has been created successfully.",
      })
    }

    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      durationMin: product.durationMin,
      price: product.price,
      description: product.description || "",
      introOffer: product.introOffer || false,
    })
    setShowForm(true)
  }

  const handleDelete = (productId: string) => {
    if (!trainer) return

    if (confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      // Remove from all products
      const allProducts = storage.getProducts()
      const updatedAllProducts = allProducts.filter((p) => p.id !== productId)
      storage.setProducts(updatedAllProducts)

      // Remove from trainer's product list
      const trainers = storage.getTrainers()
      const updatedTrainers = trainers.map((t) =>
        t.id === trainer.id ? { ...t, products: t.products.filter((pid) => pid !== productId) } : t,
      )
      storage.setTrainers(updatedTrainers)

      setProducts(products.filter((p) => p.id !== productId))

      toast({
        title: "Product deleted",
        description: "Your service has been deleted successfully.",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      durationMin: 60,
      price: 500,
      description: "",
      introOffer: false,
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  if (!trainer) {
    return (
      <AppShell>
        <AuthGuard requiredRole="trainer">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Trainer profile not found</h1>
          </div>
        </AuthGuard>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <AuthGuard requiredRole="trainer">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Services & Pricing</h1>
              <p className="text-muted-foreground">Manage your training services and pricing</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="glass-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Products List */}
          {products.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first training service to start accepting bookings
              </p>
              <Button onClick={() => setShowForm(true)} className="glass-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </GlassCard>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product) => (
                <GlassCard key={product.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      {product.introOffer && (
                        <Badge variant="secondary" className="mt-1">
                          Intro Offer
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(product)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(product.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{product.durationMin} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {product.price} {product.currency}
                        </span>
                      </div>
                    </div>

                    {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Product Form */}
          {showForm && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">{editingProduct ? "Edit Service" : "Add New Service"}</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Personal Training 60"
                      className="bg-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select
                      value={formData.durationMin.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, durationMin: Number(value) as 30 | 45 | 60 | 90 })
                      }
                    >
                      <SelectTrigger className="bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (UAH)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="200"
                    max="5000"
                    step="50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="bg-transparent"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Minimum price is 200 UAH</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what's included in this service..."
                    className="bg-transparent min-h-[80px]"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.description.length}/200</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="introOffer"
                    checked={formData.introOffer}
                    onCheckedChange={(checked) => setFormData({ ...formData, introOffer: checked })}
                  />
                  <Label htmlFor="introOffer">Mark as intro offer</Label>
                </div>

                <div className="flex gap-3">
                  <GlassButton type="submit" glassVariant="primary">
                    {editingProduct ? "Update Service" : "Create Service"}
                  </GlassButton>
                  <Button type="button" variant="outline" onClick={resetForm} className="glass-button bg-transparent">
                    Cancel
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}
        </div>
      </AuthGuard>
    </AppShell>
  )
}
