"use client"

import Image from "next/image"

interface HeaderProps {
  showLogo?: boolean
}

export function Header({ showLogo = true }: HeaderProps) {
  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-2">
        <Image
          src="/battle-rap-university-logo.png"
          alt="Battle Rap University"
          width={200}
          height={100}
          className="object-contain h-12 w-auto"
        />
        <span className="text-zinc-600 text-2xl font-light">|</span>
        <span className="text-2xl font-display font-bold text-orange-500 tracking-wide">BATTLE PREP</span>
      </div>
    </header>
  )
}
