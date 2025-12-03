"use client"

import Image from "next/image"
import Link from "next/link"
import { Newspaper, Users, ExternalLink } from "lucide-react"
import type { LeagueBlogger } from "@/lib/leagues"

interface LeagueBloggerCardProps {
  blogger: LeagueBlogger
}

export function LeagueBloggerCard({ blogger }: LeagueBloggerCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-orange-400" />
        <h3 className="font-bold">LEAGUE MEDIA</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden border-2 border-zinc-700">
            <Image
              src={blogger.avatarUrl || "/placeholder.svg"}
              alt={blogger.name}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-bold text-lg">{blogger.name}</h4>
          <p className="text-orange-400 text-sm mb-1">{blogger.blogName}</p>
          <p className="text-zinc-500 text-xs mb-3">{blogger.handle}</p>

          <p className="text-sm text-zinc-400 mb-3">
            <span className="text-zinc-500">Coverage Style:</span> {blogger.coverageStyle}
          </p>

          {/* Notable Takes */}
          <div className="mb-3">
            <p className="text-xs text-zinc-500 mb-2">Notable Takes:</p>
            <ul className="space-y-1">
              {blogger.notableTakes.map((take, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>"{take}"</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1">
              <Newspaper className="w-3 h-3 text-zinc-500" />
              <span>{blogger.articlesCount} Articles</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-zinc-500" />
              <span>{(blogger.followers / 1000).toFixed(1)}K Followers</span>
            </div>
            <Link
              href={`/blogger/${blogger.id}`}
              className="ml-auto text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              View Profile <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
