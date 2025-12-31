"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Heart, Repeat2, Share, MoreHorizontal, Verified, Flame } from "lucide-react"

interface FakeTweet {
  id: string
  author: {
    name: string
    handle: string
    avatar?: string
    verified?: boolean
    role?: "battler" | "blogger" | "fan" | "league"
  }
  content: string
  timestamp: string
  likes: number
  retweets: number
  replies: number
  type: "call_out" | "reaction" | "prediction" | "hype"
}

interface FakeTweetsProps {
  callerName: string
  targetName: string
  intensity: number
  callOutTemplate?: string
  showCount?: number
}

// Tweet templates for different scenarios
const TWEET_TEMPLATES = {
  call_out: [
    (caller: string, target: string) => `${caller} just called out ${target}?! This is about to be CRAZY 🔥`,
    (caller: string, target: string) => `The streets been waiting for ${caller} vs ${target}! Book it!`,
    (caller: string, target: string) => `${caller} really went at ${target} neck... this beef is REAL`,
    (caller: string, target: string) => `Finally! ${caller} stepping up. ${target} gotta respond now 👀`,
  ],
  reaction: [
    (caller: string, target: string) => `${target} can't duck this one. The pressure is on.`,
    (caller: string, target: string) => `If ${target} ignores this, they're finished in the culture`,
    (caller: string, target: string) => `${caller} been talking crazy. Time to back it up.`,
    (caller: string, target: string) => `This the battle rap we need right now. ${caller} vs ${target}. BOOK IT.`,
  ],
  prediction: [
    (caller: string, target: string) => `${caller} catching a body if this happens. 3-0 incoming 💀`,
    (caller: string, target: string) => `I got ${target} winning this 2-1. ${caller} overrated.`,
    (caller: string, target: string) => `This is a CLASSIC waiting to happen. Both of them go crazy.`,
    (caller: string, target: string) => `${caller} is focused. This is a bad time to battle them.`,
  ],
  hype: [
    (caller: string, target: string) => `THE CULTURE NEEDS THIS BATTLE 🗣️🗣️🗣️`,
    (caller: string, target: string) => `This is the one. ${caller} vs ${target}. No more talking.`,
    (caller: string, target: string) => `Every league gonna be calling trying to book this 💰`,
    (caller: string, target: string) => `If you don't care about ${caller} vs ${target}, you not a real battle rap fan`,
  ],
}

// Fake accounts that comment on battles
const FAKE_ACCOUNTS = [
  { name: "BattleRapLive", handle: "battleraplive", verified: true, role: "blogger" as const },
  { name: "NWXCONTENT", handle: "nwxcontent", verified: true, role: "blogger" as const },
  { name: "Champion", handle: "champion", verified: true, role: "league" as const },
  { name: "The Real Deal", handle: "therealdeal_br", verified: false, role: "battler" as const },
  { name: "Bars Over Everything", handle: "barsoverevery", verified: false, role: "fan" as const },
  { name: "PenGame Certified", handle: "pengamecertified", verified: false, role: "fan" as const },
  { name: "Battle Culture TV", handle: "battleculturetv", verified: true, role: "blogger" as const },
  { name: "Street Certified 🔥", handle: "streetcertified", verified: false, role: "fan" as const },
  { name: "Battle Rap Stats", handle: "battlerapstats", verified: true, role: "blogger" as const },
  { name: "Crowd Favorite", handle: "crowdfavorite", verified: false, role: "fan" as const },
]

function generateTweets(
  callerName: string,
  targetName: string,
  intensity: number,
  count: number
): FakeTweet[] {
  const tweets: FakeTweet[] = []
  const types: FakeTweet["type"][] = ["call_out", "reaction", "prediction", "hype"]

  // Shuffle accounts
  const shuffledAccounts = [...FAKE_ACCOUNTS].sort(() => Math.random() - 0.5)

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const templates = TWEET_TEMPLATES[type]
    const template = templates[Math.floor(Math.random() * templates.length)]
    const account = shuffledAccounts[i % shuffledAccounts.length]

    // Scale engagement based on intensity
    const baseEngagement = intensity / 10
    const likes = Math.floor(Math.random() * 500 * baseEngagement + 50)
    const retweets = Math.floor(likes * (0.1 + Math.random() * 0.3))
    const replies = Math.floor(likes * (0.05 + Math.random() * 0.1))

    // Generate timestamp (random within last few hours)
    const hoursAgo = Math.floor(Math.random() * 12)
    const timestamp = hoursAgo === 0 ? "Just now" : `${hoursAgo}h`

    tweets.push({
      id: `tweet-${i}-${Date.now()}`,
      author: account,
      content: template(callerName, targetName),
      timestamp,
      likes,
      retweets,
      replies,
      type,
    })
  }

  return tweets.sort(() => Math.random() - 0.5)
}

export function FakeTweets({
  callerName,
  targetName,
  intensity,
  callOutTemplate,
  showCount = 4,
}: FakeTweetsProps) {
  const [tweets, setTweets] = useState<FakeTweet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay for realism
    setIsLoading(true)
    const timer = setTimeout(() => {
      setTweets(generateTweets(callerName, targetName, intensity, showCount))
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [callerName, targetName, intensity, showCount])

  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-blue-500 animate-pulse" />
          <span className="text-xs font-display font-bold text-zinc-400 uppercase">
            Loading Social Feed...
          </span>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-800 w-1/3" />
                  <div className="h-4 bg-zinc-800 w-full" />
                  <div className="h-4 bg-zinc-800 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">𝕏</span>
          </div>
          <span className="text-sm font-display font-bold text-zinc-300 uppercase tracking-wide">
            Social Reactions
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-orange-400">
          <Flame className="w-3 h-3" />
          <span className="font-mono">{intensity}% intensity</span>
        </div>
      </div>

      {/* Tweets */}
      <div className="divide-y divide-zinc-800/50">
        <AnimatePresence>
          {tweets.map((tweet, index) => (
            <motion.div
              key={tweet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-zinc-800/30 transition-colors"
            >
              {/* Tweet Header */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-zinc-500 text-xs font-bold">
                    {tweet.author.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name and handle */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="font-bold text-zinc-200 text-sm truncate">
                      {tweet.author.name}
                    </span>
                    {tweet.author.verified && (
                      <Verified className="w-4 h-4 text-blue-400" fill="currentColor" />
                    )}
                    <span className="text-zinc-500 text-sm">@{tweet.author.handle}</span>
                    <span className="text-zinc-600 text-sm">· {tweet.timestamp}</span>
                  </div>

                  {/* Tweet content */}
                  <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
                    {tweet.content}
                  </p>

                  {/* Tweet actions */}
                  <div className="flex items-center gap-6 mt-3">
                    <button className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-400 transition-colors group">
                      <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono">{tweet.replies}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-zinc-500 hover:text-green-400 transition-colors group">
                      <Repeat2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono">{tweet.retweets}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors group">
                      <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono">{tweet.likes}</span>
                    </button>
                    <button className="flex items-center text-zinc-500 hover:text-blue-400 transition-colors">
                      <Share className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 text-center">
        <span className="text-xs text-zinc-600">
          Simulated social media reactions based on rivalry intensity
        </span>
      </div>
    </div>
  )
}
