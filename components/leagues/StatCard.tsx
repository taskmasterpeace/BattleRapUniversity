import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  subtext?: string
  highlight?: boolean
}

export function StatCard({ icon, label, value, subtext, highlight }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden bg-zinc-800/50 backdrop-blur-sm border p-3 text-center group transition-all hover:border-zinc-600 ${
      highlight ? "border-orange-500/30" : "border-zinc-700/50"
    }`}>
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-zinc-700/20 to-transparent" />

      <div className="relative">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className="p-1 bg-zinc-900/50 border border-zinc-700/50">
            {icon}
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{label}</span>
        </div>
        <p className={`text-xl font-black tracking-tight ${highlight ? "text-orange-400" : ""}`}>
          {value}
        </p>
        {subtext && (
          <p className="text-[10px] text-zinc-500 mt-1 italic">{subtext}</p>
        )}
      </div>
    </div>
  )
}
