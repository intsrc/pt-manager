import { GlassCard } from "@/components/ui/glass-card"

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
          <div>
            <div className="h-6 bg-white/10 rounded w-32 mb-2 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-48 animate-pulse" />
          </div>
        </div>

        <GlassCard className="p-6">
          <div className="h-12 bg-white/10 rounded-lg mb-2 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-64 animate-pulse" />
        </GlassCard>

        <GlassCard className="p-6">
          <div className="h-6 bg-white/10 rounded w-40 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
