"use client"

import { Check } from "lucide-react"

interface SaveButtonProps {
  isComplete: boolean
  onSave: () => void
}

export function SaveButton({ isComplete, onSave }: SaveButtonProps) {
  return (
    <button
      onClick={onSave}
      disabled={!isComplete}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-display font-bold tracking-wide transition-colors ${
        isComplete
          ? "bg-green-600 hover:bg-green-500 text-white border-2 border-green-500"
          : "bg-zinc-800 text-zinc-500 border-2 border-zinc-700 cursor-not-allowed"
      }`}
    >
      <Check className="w-4 h-4" />
      SAVE & RETURN
    </button>
  )
}
