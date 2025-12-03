import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  subtext?: string
}

export function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-[10px] text-zinc-500 uppercase">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
      {subtext && <p className="text-[10px] text-zinc-500">{subtext}</p>}
    </div>
  )
}
