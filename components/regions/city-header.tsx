import { type City, type CityStats, getSceneSizeLabel, getCultureStyleIcon } from "@/lib/cities"
import { MapPin, Users, TrendingUp, Zap, Calendar, Globe, Flag } from "lucide-react"
import Link from "next/link"

interface CityHeaderProps {
  city: City
  stats: CityStats
}

export function CityHeader({ city, stats }: CityHeaderProps) {
  const sceneSizeStyles: Record<string, string> = {
    major: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
    large: "border-gray-400 bg-gray-400/10 text-gray-400",
    medium: "border-orange-500 bg-orange-500/10 text-orange-500",
    small: "border-zinc-600 bg-zinc-800 text-zinc-400",
  }

  const cultureStyles: Record<string, string> = {
    technical: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    aggressive: "bg-red-500/20 text-red-400 border-red-500/50",
    diverse: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    street: "bg-green-500/20 text-green-400 border-green-500/50",
  }

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`
    return pop.toString()
  }

  const regionSlug = city.region.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="relative overflow-hidden border-b border-zinc-800">
      {/* 21:9 Backdrop */}
      <div className="aspect-[21/9] relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(/sprites/cities/${city.slug}-day.png), url(/placeholder-city-backdrop-16x9.jpg)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="flex flex-col gap-3">
            {/* City name and location */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">{city.name.toUpperCase()}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-300 mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{city.stateCode ? `${city.state}, ${city.stateCode}` : city.state || city.country}</span>
                </div>
                <span className="text-zinc-600">|</span>
                <Link
                  href={`/regions?region=${regionSlug}`}
                  className="flex items-center gap-1 hover:text-orange-400 transition-colors underline underline-offset-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{city.region}</span>
                </Link>
                <span className="text-zinc-600">|</span>
                <div className="flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  <span>
                    {city.country} ({city.countryCode})
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-xs font-bold border rounded ${sceneSizeStyles[city.sceneSize]}`}>
                {getSceneSizeLabel(city.sceneSize)}
              </span>
              <span className={`px-3 py-1 text-xs font-bold border rounded ${cultureStyles[city.cultureStyle]}`}>
                {getCultureStyleIcon(city.cultureStyle)} {city.cultureStyle.toUpperCase()}
              </span>
              <span className="px-3 py-1 text-xs font-bold border border-zinc-600 rounded bg-zinc-800 text-zinc-300">
                <Users className="w-3 h-3 inline mr-1" />
                POP: {formatPopulation(city.population)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-zinc-900/80 backdrop-blur border-t border-zinc-800 p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-lg font-bold text-white">{stats.totalBattlers}</div>
              <div className="text-xs text-zinc-500">Total Battlers</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-lg font-bold text-white">{stats.avgRating}</div>
              <div className="text-xs text-zinc-500">Avg Rating</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-lg font-bold text-white">{stats.avgWinRate}%</div>
              <div className="text-xs text-zinc-500">Win Rate vs Others</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-lg font-bold text-white">{stats.battlesThisWeek}</div>
              <div className="text-xs text-zinc-500">Battles This Week</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-purple-500 font-bold text-center">#</div>
            <div>
              <div className="text-lg font-bold text-white">{stats.totalBattlesInCity}</div>
              <div className="text-xs text-zinc-500">All-Time Battles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
