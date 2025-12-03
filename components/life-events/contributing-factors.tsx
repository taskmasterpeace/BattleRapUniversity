"use client"

import type { StressState } from "@/lib/life-events"

interface ContributingFactorsProps {
  factors: StressState["contributing_factors"]
}

export function ContributingFactors({ factors }: ContributingFactorsProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-display font-bold text-zinc-500 uppercase tracking-wide">Contributing Factors</h4>
      <div className="space-y-1">
        {factors.map((factor, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>{factor.icon}</span>
              <span className="text-zinc-300">{factor.label}</span>
            </div>
            <span className="text-red-500 font-mono">+{factor.stress_amount} stress</span>
          </div>
        ))}
      </div>
    </div>
  )
}
