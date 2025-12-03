"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  variant: "victory" | "defeat" | "warning" | "info" | "neutral" | "grudge"
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
}

const variants = {
  victory: "bg-green-500/20 text-green-500 border-green-500/30",
  defeat: "bg-red-500/20 text-red-500 border-red-500/30",
  warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  info: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  neutral: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
  grudge: "bg-orange-500/20 text-orange-500 border-orange-500/30",
}

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-2 text-base",
}

export function StatusBadge({ variant, children, size = "sm" }: StatusBadgeProps) {
  return (
    <span className={cn("font-display font-bold uppercase tracking-wider border", variants[variant], sizes[size])}>
      {children}
    </span>
  )
}
