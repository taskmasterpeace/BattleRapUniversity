"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Crown, UserMinus, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CrewMember {
  id: string
  battler_id: string
  role: "leader" | "member"
  joined_at: string
  battler: {
    id: string
    stage_name: string
    tier: string
    sprite_url?: string
  }
}

interface CrewMembersPanelProps {
  crewId: string
  members: CrewMember[]
  isLeader: boolean
  playerBattlerId: string
  onLeave: () => void
}

export function CrewMembersPanel({
  crewId,
  members,
  isLeader,
  playerBattlerId,
  onLeave,
}: CrewMembersPanelProps) {
  const [isLeaving, setIsLeaving] = useState(false)
  const [error, setError] = useState("")

  const handleLeave = async () => {
    if (isLeader) {
      setError("Leaders cannot leave. Transfer leadership or disband the crew instead.")
      return
    }

    setIsLeaving(true)
    setError("")

    try {
      const response = await fetch(`/api/crews/${crewId}/leave`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to leave crew')
        setIsLeaving(false)
        return
      }

      // Success - callback to refresh page
      onLeave()
    } catch (err) {
      console.error('Leave crew error:', err)
      setError('Failed to leave crew')
      setIsLeaving(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-zinc-300 font-display text-lg flex items-center gap-2">
          CREW MEMBERS ({members.length}/5)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Members List */}
        <div className="space-y-2">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700"
            >
              {/* Portrait */}
              <div className="w-12 h-12 bg-zinc-700 border border-zinc-600 overflow-hidden flex-shrink-0">
                {member.battler?.sprite_url ? (
                  <img
                    src={member.battler.sprite_url}
                    alt={member.battler.stage_name}
                    className="w-full h-full object-cover pixelated"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-700" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-bold text-zinc-200 text-sm truncate">
                    {member.battler?.stage_name || "Unknown"}
                  </p>
                  {member.role === "leader" && (
                    <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 font-display">
                  {member.battler?.tier || "MID TIER"} • Joined{" "}
                  {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>

              {/* You Badge */}
              {member.battler_id === playerBattlerId && (
                <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 text-orange-400 text-xs font-display font-bold">
                  YOU
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 p-3"
          >
            <p className="text-xs text-red-500 font-display">{error}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-zinc-800 space-y-2">
          {isLeader ? (
            <div className="bg-zinc-800/50 border border-zinc-700 p-3">
              <p className="text-xs text-zinc-400 font-display">
                As crew leader, you can manage members and crew settings. Use the "Disband Crew" option to dissolve the crew.
              </p>
            </div>
          ) : (
            <Button
              onClick={handleLeave}
              disabled={isLeaving}
              className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-display font-bold"
            >
              {isLeaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  LEAVING...
                </>
              ) : (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  LEAVE CREW
                </>
              )}
            </Button>
          )}

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-2">
            <p className="text-xs text-yellow-500 font-display">
              ⚠️ Your crew history is PERMANENT - opponents can use it in battles even after you leave!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
