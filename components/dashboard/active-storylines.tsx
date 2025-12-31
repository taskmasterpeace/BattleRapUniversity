"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BookOpen,
  Clock,
  AlertTriangle,
  ChevronRight,
  Home,
  Scale,
  DollarSign,
  Swords,
  Heart,
  Briefcase,
  Users,
  Flame,
  HeartPulse
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ActiveStoryline {
  id: string
  template_code: string
  current_chapter_id: string
  status: string
  started_at: string
  next_chapter_deadline?: string
  total_prep_days_lost: number
  storyline_templates: {
    name: string
    description: string
    category: string
    chapters: any[]
  }
}

interface ActiveStorylinesProps {
  battlerId: string
}

const categoryIcons: Record<string, any> = {
  family: Home,
  legal: Scale,
  financial: DollarSign,
  rivalry: Swords,
  health: HeartPulse,
  career: Briefcase,
  street: Flame,
  crew: Users,
  romance: Heart
}

const categoryColors: Record<string, string> = {
  family: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  legal: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  financial: "bg-green-500/20 text-green-400 border-green-500/30",
  rivalry: "bg-red-500/20 text-red-400 border-red-500/30",
  health: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  career: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  street: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  crew: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  romance: "bg-rose-500/20 text-rose-400 border-rose-500/30"
}

export function ActiveStorylines({ battlerId }: ActiveStorylinesProps) {
  const [storylines, setStorylines] = useState<ActiveStoryline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStorylines() {
      try {
        const response = await fetch(`/api/storylines/active?battlerId=${battlerId}`)
        if (response.ok) {
          const data = await response.json()
          setStorylines(data.storylines || [])
        }
      } catch (error) {
        console.error('Error fetching storylines:', error)
      } finally {
        setLoading(false)
      }
    }

    if (battlerId) {
      fetchStorylines()
    }
  }, [battlerId])

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Active Storylines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-zinc-800 rounded" />
            <div className="h-16 bg-zinc-800 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (storylines.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Active Storylines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-4">
            No active storylines. Life events may trigger storyline chains as you battle.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Active Storylines
          <Badge variant="secondary" className="ml-auto bg-zinc-800 text-zinc-300">
            {storylines.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {storylines.map((storyline, index) => {
          const template = storyline.storyline_templates
          const category = template.category
          const Icon = categoryIcons[category] || BookOpen
          const colorClass = categoryColors[category] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"

          // Find current chapter
          const currentChapter = template.chapters?.find(
            (ch: any) => ch.id === storyline.current_chapter_id
          )

          // Check if deadline is approaching
          const hasDeadline = storyline.next_chapter_deadline
          const deadlineDate = hasDeadline ? new Date(storyline.next_chapter_deadline!) : null
          const isUrgent = deadlineDate && (deadlineDate.getTime() - Date.now()) < 24 * 60 * 60 * 1000

          return (
            <motion.div
              key={storyline.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/life-events?storyline=${storyline.id}`}>
                <div className={`
                  p-4 border rounded-lg transition-all cursor-pointer
                  hover:bg-zinc-800/50 hover:border-zinc-700
                  ${isUrgent ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 bg-zinc-800/30'}
                `}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-zinc-100 truncate">
                          {template.name}
                        </h4>
                        {isUrgent && (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>

                      {currentChapter && (
                        <p className="text-xs text-zinc-400 mb-2 truncate">
                          Chapter {currentChapter.chapter_number}: {currentChapter.title}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs">
                        {hasDeadline && (
                          <div className={`flex items-center gap-1 ${isUrgent ? 'text-red-400' : 'text-zinc-500'}`}>
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatTimeRemaining(deadlineDate!)}
                            </span>
                          </div>
                        )}

                        {storyline.total_prep_days_lost > 0 && (
                          <div className="flex items-center gap-1 text-orange-400">
                            <span>-{storyline.total_prep_days_lost} prep days</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-zinc-400 hover:text-zinc-200"
          asChild
        >
          <Link href="/life-events">
            View All Life Events
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function formatTimeRemaining(deadline: Date): string {
  const now = Date.now()
  const remaining = deadline.getTime() - now

  if (remaining <= 0) return 'Expired'

  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h left`
  }

  if (hours > 0) {
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m left`
  }

  const minutes = Math.floor(remaining / (1000 * 60))
  return `${minutes}m left`
}
