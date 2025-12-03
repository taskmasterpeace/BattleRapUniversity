"use client"

import type React from "react"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface NavHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  rightContent?: React.ReactNode
}

export function NavHeader({
  title,
  subtitle,
  backHref = "/dashboard",
  backLabel = "BACK",
  rightContent,
}: NavHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-400 text-sm font-display font-bold tracking-wide transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">{title}</span>
          {subtitle && (
            <>
              <span className="text-zinc-600 text-xl">|</span>
              <span className="text-xl font-display font-bold text-orange-500 tracking-wide">{subtitle}</span>
            </>
          )}
        </div>
      </div>
      {rightContent}
    </header>
  )
}
