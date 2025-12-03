"use client"

import { motion } from "framer-motion"
import { CITIES, getMockCityStats, getSceneSizeLabel, getCityBackdrop } from "@/lib/cities"
import { ChevronLeft, MapPin, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { staggerContainer, staggerItem } from "@/lib/animations"

export default function RegionsPage() {
  const [filter, setFilter] = useState<string>("all")

  const filteredCities = filter === "all" ? CITIES : CITIES.filter((c) => c.sceneSize === filter)

  const sceneSizeStyles: Record<string, string> = {
    major: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
    large: "border-zinc-400 bg-zinc-400/10 text-zinc-400",
    medium: "border-orange-500 bg-orange-500/10 text-orange-500",
    small: "border-zinc-600 bg-zinc-800 text-zinc-400",
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-zinc-950 text-white"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-zinc-800 bg-zinc-900/50"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-orange-500 mb-4">
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
              <MapPin className="w-8 h-8 text-orange-500" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black">BATTLE RAP REGIONS</h1>
              <p className="text-sm text-zinc-400">Explore the global battle rap scene</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b border-zinc-800 bg-zinc-900/30"
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {["all", "major", "large", "medium", "small"].map((size, i) => (
              <motion.button
                key={size}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(size)}
                className={`px-4 py-2 text-sm font-bold rounded whitespace-nowrap transition-colors ${
                  filter === size ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {size === "all" ? "All Cities" : getSceneSizeLabel(size as any)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cities grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2"
        >
          {filteredCities.map((city) => {
            const stats = getMockCityStats(city.slug)
            const backdrop = getCityBackdrop(city.slug)

            return (
              <motion.div
                key={city.id}
                variants={staggerItem}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/regions/${city.slug}`}
                  className="block bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-orange-500/50 transition-colors group"
                >
                  <div className="aspect-square sm:aspect-video relative">
                    {backdrop ? (
                      <Image
                        src={backdrop || "/placeholder.svg"}
                        alt={`${city.name} skyline`}
                        fill
                        className="object-cover object-center"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(/placeholder.svg?height=400&width=400&query=${city.name} city skyline pixel art)`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-xl font-black text-white group-hover:text-orange-500 transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {city.state ? `${city.state}, ${city.country}` : city.country}
                      </p>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-bold border rounded ${sceneSizeStyles[city.sceneSize]}`}>
                        {city.sceneSize.toUpperCase()}
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs font-bold bg-zinc-900/80 backdrop-blur text-zinc-300 rounded">
                        {city.region}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>{stats.totalBattlers} battlers</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>Avg: {stats.avgRating}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.div>
  )
}
