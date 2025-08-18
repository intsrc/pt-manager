import { GlassCard } from "@/components/ui/glass-card"

export default function DeskLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="h-8 bg-white/10 rounded-lg w-48 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-64 mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <GlassCard className="h-20 animate-pulse" />
          <GlassCard className="h-20 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="p-4 animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-2" />
              <div className="h-4 bg-white/10 rounded" />
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6">
          <div className="h-6 bg-white/10 rounded w-48 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
