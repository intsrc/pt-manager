import { GlassCard } from "@/components/ui/glass-card"

export default function CheckInLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
          <div>
            <div className="h-6 bg-white/10 rounded w-32 mb-2 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-48 animate-pulse" />
          </div>
        </div>

        <GlassCard className="p-6">
          <div className="text-center space-y-4">
            <div className="h-6 bg-white/10 rounded w-40 mx-auto animate-pulse" />
            <div className="aspect-square max-w-sm mx-auto bg-white/10 rounded-lg animate-pulse" />
            <div className="h-12 bg-white/10 rounded animate-pulse" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="h-5 bg-white/10 rounded w-24 mb-2 animate-pulse" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded animate-pulse" />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
