"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero Section with Stage Background */}
      <section className="relative min-h-[400px] md:min-h-[500px] overflow-hidden">
        {/* Stage background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e1b2e] via-zinc-950 to-zinc-950" />

        {/* Stage lights effect */}
        <div className="absolute top-0 left-1/4 w-32 h-48 bg-gradient-to-b from-amber-400/20 to-transparent blur-3xl" />
        <div className="absolute top-0 right-1/4 w-32 h-48 bg-gradient-to-b from-purple-500/20 to-transparent blur-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-56 bg-gradient-to-b from-amber-300/25 to-transparent blur-3xl" />

        {/* Navigation */}
        <nav className="relative z-20 flex items-center justify-end px-4 md:px-6 py-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-zinc-100 hover:text-amber-400 hover:bg-transparent font-display font-bold tracking-wider text-base md:text-lg"
            >
              LOG IN
            </Button>
          </Link>
        </nav>

        {/* Logo - responsive sizing */}
        <div className="relative z-10 flex flex-col items-center pt-2 pb-2 md:pb-8 px-4">
          <Image
            src="/images/replicate-prediction-9c1aw3f1r1rma0ctwa9bamn4bg.png"
            alt="Battle Rap University"
            width={500}
            height={250}
            className="pixelated w-full max-w-[320px] md:max-w-[500px] h-auto"
            priority
          />
        </div>
      </section>

      {/* Tagline Section - responsive text */}
      <section className="bg-zinc-950 py-4 md:py-6 px-4 md:px-6 text-center">
        <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-amber-100 mb-2 uppercase tracking-wide">
          Finally, a battle rap game that actually gets it.
        </h2>
        <p className="font-display text-lg md:text-xl lg:text-2xl text-amber-200/80 mb-4 uppercase tracking-wide">
          Made BY battle rap fans FOR battle rap fans.
        </p>

        <div className="w-24 h-0.5 bg-amber-600 mx-auto mb-4" />

        <p className="font-display text-zinc-300 max-w-2xl mx-auto text-base md:text-lg tracking-wide">
          Manage your battler's prep, strategy, and career.
          <br className="hidden md:block" />
          <span className="md:hidden"> </span>
          No writing bars required - pure chess. Every decision matters.
        </p>
      </section>

      {/* Waitlist Section with Screenshots */}
      <section className="bg-zinc-950 py-8 md:py-10 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Left - Battler Sprite (hidden on mobile, shown on lg) */}
            <div className="flex-1 hidden lg:flex flex-col items-center justify-center gap-2">
              <Image src="/images/sprite-536.png" alt="Battler" width={200} height={200} className="pixelated" />
              <p className="font-display text-zinc-400 text-sm uppercase tracking-wider">Build Unique Battlers*</p>
            </div>

            {/* Waitlist Form - full width on mobile */}
            <div className="flex-1 max-w-md w-full">
              <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg p-6 md:p-8">
                <h3 className="font-display text-lg md:text-xl font-bold text-center mb-6 uppercase tracking-wider text-amber-100">
                  Join the Waiting List for Early Access
                </h3>

                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white text-zinc-900 border-0 h-12 text-base md:text-lg placeholder:text-zinc-500 font-display"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 md:h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-display font-black text-lg md:text-xl uppercase tracking-wider"
                    >
                      Sign Up Now
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-amber-400 font-display font-bold text-lg">You're on the list!</p>
                    <p className="text-zinc-400 mt-2 font-display">We'll notify you when early access opens.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right - Badge with label */}
            <div className="flex-1 hidden lg:flex flex-col items-center justify-center gap-2">
              <Image
                src="/images/badge-046.png"
                alt="Rebuttal King Badge"
                width={220}
                height={220}
                className="pixelated"
              />
              <p className="font-display text-zinc-400 text-sm uppercase tracking-wider">60+ Badges to Unlock</p>
            </div>
          </div>

          {/* Mobile-only: Show battler and badge below form */}
          <div className="flex lg:hidden justify-center gap-8 mt-6">
            <div className="flex flex-col items-center gap-1">
              <Image src="/images/sprite-536.png" alt="Battler" width={100} height={100} className="pixelated" />
              <p className="font-display text-zinc-400 text-xs uppercase tracking-wider">Build Battlers*</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Image src="/images/badge-046.png" alt="Badge" width={120} height={120} className="pixelated" />
              <p className="font-display text-zinc-400 text-xs uppercase tracking-wider">60+ Badges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkered Divider */}
      <div className="h-3 md:h-4 bg-[repeating-linear-gradient(90deg,#f59e0b_0px,#f59e0b_12px,transparent_12px,transparent_24px)] md:bg-[repeating-linear-gradient(90deg,#f59e0b_0px,#f59e0b_16px,transparent_16px,transparent_32px)]" />

      {/* Features Section - responsive grid */}
      <section className="bg-zinc-950 py-10 md:py-12 px-4 md:px-6">
        <h2 className="font-display text-2xl md:text-4xl font-black text-center mb-8 md:mb-10 uppercase tracking-wider text-amber-100">
          Features
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Authentic Battle Rap */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 md:p-6 text-center">
            <div className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-3 md:mb-4 relative">
              <Image src="/images/hype-017.png" alt="Authentic Battle Rap" fill className="object-contain pixelated" />
            </div>
            <h3 className="font-display text-amber-400 font-bold uppercase tracking-wider mb-2 text-xs md:text-sm">
              Authentic Battle Rap
            </h3>
            <p className="font-display text-zinc-400 text-xs md:text-sm">
              3 Rounds, No Beat
              <br className="hidden md:block" />
              <span className="md:hidden">, </span>
              Real Terminology
            </p>
          </div>

          {/* Deep Strategy */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 md:p-6 text-center">
            <div className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-3 md:mb-4 relative">
              <Image src="/images/badge-048.png" alt="Deep Strategy" fill className="object-contain pixelated" />
            </div>
            <h3 className="font-display text-amber-400 font-bold uppercase tracking-wider mb-2 text-xs md:text-sm">
              Deep Strategy
            </h3>
            <p className="font-display text-zinc-400 text-xs md:text-sm">
              Prep Management
              <br />
              Badge Synergies
            </p>
          </div>

          {/* Unpredictable Battles */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 md:p-6 text-center">
            <div className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-3 md:mb-4 relative">
              <Image src="/images/boo-002.png" alt="Unpredictable Battles" fill className="object-contain pixelated" />
            </div>
            <h3 className="font-display text-amber-400 font-bold uppercase tracking-wider mb-2 text-xs md:text-sm">
              Unpredictable Battles
            </h3>
            <p className="font-display text-zinc-400 text-xs md:text-sm">
              Chokes Happen
              <br />
              Debatable Decisions
            </p>
          </div>

          {/* Build Your Legacy */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 md:p-6 text-center">
            <div className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-3 md:mb-4 relative">
              <Image src="/images/sprite-536.png" alt="Build Your Legacy" fill className="object-contain pixelated" />
            </div>
            <h3 className="font-display text-amber-400 font-bold uppercase tracking-wider mb-2 text-xs md:text-sm">
              Build Your Legacy
            </h3>
            <p className="font-display text-zinc-400 text-xs md:text-sm">
              Rookie to Legend
              <br />
              Small Room to Main Stage
            </p>
          </div>
        </div>
      </section>

      {/* Dominate Your City Section */}
      <section className="bg-zinc-950 py-10 px-4 md:px-6">
        <h2 className="font-display text-xl md:text-2xl font-bold text-center mb-2 uppercase tracking-wider text-amber-100">
          Dominate Your City
        </h2>
        <p className="font-display text-zinc-400 text-center mb-6 text-sm md:text-base max-w-xl mx-auto">
          Become the best in New York, Philadelphia, Atlanta, or wherever you rep. Rise through your local scene before
          conquering the national stage.
        </p>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 justify-center items-center">
          <div className="relative aspect-[4/3] w-full max-w-[300px] mx-auto">
            <Image
              src="/images/philadelphia-day.png"
              alt="Philadelphia Day"
              fill
              className="rounded-lg border border-zinc-700 pixelated object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] w-full max-w-[300px] mx-auto">
            <Image
              src="/images/houston-day.png"
              alt="Houston Day"
              fill
              className="rounded-lg border border-zinc-700 pixelated object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] w-full max-w-[300px] mx-auto">
            <Image
              src="/images/orlando-night.png"
              alt="Orlando Night"
              fill
              className="rounded-lg border border-zinc-700 pixelated object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-10 px-4 md:px-6">
        <h2 className="font-display text-xl md:text-2xl font-bold text-center mb-2 uppercase tracking-wider text-amber-100">
          16+ Unique Venues
        </h2>
        <p className="font-display text-zinc-400 text-center mb-6 text-sm md:text-base max-w-xl mx-auto">
          Adapt your performance to each venue. Small rooms demand intimacy, main stages require presence. Master them
          all.
        </p>
        <div className="max-w-5xl mx-auto">
          <Image
            src="/images/image-1764378969538.jpeg"
            alt="Battle Venues - Warehouses, Clubs, Arenas, Outdoor Stages"
            width={1200}
            height={400}
            className="w-full rounded-lg border border-zinc-700 pixelated"
          />
        </div>
      </section>

      <section className="bg-zinc-950 py-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold mb-4 uppercase tracking-wider text-amber-100">
            Multiplayer Coming Soon
          </h2>
          <p className="font-display text-zinc-300 text-sm md:text-base max-w-2xl mx-auto">
            Battle against other players online. Build your battler, climb the leaderboards, and prove you're the best
            strategist in battle rap.
          </p>
        </div>
      </section>

      {/* Badge System Showcase */}
      <section className="bg-zinc-950 py-10 px-4 md:px-6">
        <h2 className="font-display text-xl md:text-2xl font-bold text-center mb-6 uppercase tracking-wider text-amber-100">
          Master the Badge System
        </h2>
        <div className="max-w-4xl mx-auto">
          <Image
            src="/images/3cj4mgrgmnrma0ctq61809qd7w.webp"
            alt="Badge System - Define Your Style, Master the Game"
            width={1080}
            height={1080}
            className="w-full rounded-lg border border-zinc-700"
          />
        </div>
      </section>

      {/* Social Links - responsive sizing */}
      <section className="bg-zinc-950 py-8 md:py-10 px-4 md:px-6">
        <div className="flex justify-center gap-4 md:gap-6">
          <a
            href="https://x.com/BattleRapAI"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 md:w-14 md:h-14 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7 text-zinc-100" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@AlgorithmInstituteofBR"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 md:w-14 md:h-14 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7 text-zinc-100" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93-.502 5.814a3.016 3.016 0 0 0 2.122 2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-6 md:py-8 px-4 md:px-6 border-t border-zinc-800">
        <p className="font-display text-center text-zinc-500 text-xs md:text-sm uppercase tracking-wider">
          Algorithm Institute of Battle Rap © 2025
        </p>
      </footer>
    </div>
  )
}
