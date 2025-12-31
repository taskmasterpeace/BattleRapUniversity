"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Plus, Swords, Loader2, Crown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBattler } from "@/contexts/battler-context"
import { CrewCard } from "@/components/crews/crew-card"
import { CreateCrewModal } from "@/components/crews/create-crew-modal"
import { CrewMembersPanel } from "@/components/crews/crew-members-panel"

interface Crew {
  id: string
  name: string
  tag: string
  logo_url?: string | null
  reputation: number
  total_wins: number
  total_losses: number
  leader_battler_id: string
  member_count?: number
  crew_members?: Array<{
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
  }>
}

export default function CrewsPage() {
  const { activeBattler, loading: battlerLoading } = useBattler()
  const [myCrew, setMyCrew] = useState<Crew | null>(null)
  const [allCrews, setAllCrews] = useState<Crew[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchCrews = async () => {
    try {
      setLoading(true)

      // Fetch player's crew
      const myCrewRes = await fetch('/api/crews?my_crew=true')
      if (myCrewRes.ok) {
        const myCrewData = await myCrewRes.json()
        setMyCrew(myCrewData.crew || null)
      }

      // Fetch all crews
      const allCrewsRes = await fetch('/api/crews')
      if (allCrewsRes.ok) {
        const allCrewsData = await allCrewsRes.json()
        setAllCrews(allCrewsData.crews || [])
      }
    } catch (err) {
      console.error('Failed to fetch crews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!battlerLoading) {
      fetchCrews()
    }
  }, [battlerLoading])

  const handleCrewCreated = () => {
    fetchCrews()
  }

  const handleLeave = () => {
    fetchCrews()
  }

  if (battlerLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!activeBattler) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="w-24 h-24 bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
          <Users className="w-12 h-12 text-zinc-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-zinc-300 mb-2">NO BATTLER SIGNED</h2>
          <p className="text-zinc-500 text-sm">Sign a battler to join or create a crew</p>
        </div>
      </div>
    )
  }

  const isInCrew = myCrew !== null
  const isLeader = myCrew?.leader_battler_id === activeBattler.id

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-black text-zinc-100 uppercase tracking-tighter">
            CREWS
          </h1>
          <p className="text-sm text-zinc-500 font-display mt-1">
            Form alliances, share prep, and build your legacy
          </p>
        </div>

        {!isInCrew && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white font-display font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            CREATE CREW
          </Button>
        )}
      </motion.div>

      {/* My Crew Section */}
      {isInCrew && myCrew && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-orange-950/20 via-zinc-900 to-zinc-900 border-orange-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-orange-500 font-display text-xl flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  YOUR CREW
                </CardTitle>
                {isLeader && (
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-display font-bold">
                    LEADER
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CrewCard crew={myCrew} isPlayerCrew />
                {myCrew.crew_members && (
                  <CrewMembersPanel
                    crewId={myCrew.id}
                    members={myCrew.crew_members}
                    isLeader={isLeader}
                    playerBattlerId={activeBattler.id}
                    onLeave={handleLeave}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Crew Challenges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-zinc-300 font-display text-lg flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-500" />
              CREW CHALLENGES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-800/50 border border-zinc-700 p-8 text-center">
              <Swords className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 font-display text-sm">
                Crew vs crew battles coming soon...
              </p>
              <p className="text-zinc-600 font-display text-xs mt-2">
                Challenge rival crews to prove your dominance
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Browse Crews Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-zinc-300 font-display text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                ALL CREWS
              </CardTitle>
              <span className="text-xs text-zinc-500 font-display">
                {allCrews.length} active crews
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {allCrews.length === 0 ? (
              <div className="bg-zinc-800/50 border border-zinc-700 p-8 text-center">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 font-display text-sm">
                  No crews exist yet
                </p>
                <p className="text-zinc-600 font-display text-xs mt-2">
                  Be the first to create a crew
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCrews.map((crew, index) => (
                  <motion.div
                    key={crew.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CrewCard
                      crew={crew}
                      isPlayerCrew={myCrew?.id === crew.id}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/50 border border-zinc-700 p-4">
                <h3 className="text-orange-400 font-display font-bold text-sm mb-2 uppercase">
                  Crew Benefits
                </h3>
                <ul className="text-xs text-zinc-400 space-y-1 font-display">
                  <li>• Share prep strategies</li>
                  <li>• Borrow crew member badges</li>
                  <li>• Cosign call-outs together</li>
                  <li>• Challenge other crews</li>
                  <li>• Build crew reputation</li>
                </ul>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 p-4">
                <h3 className="text-yellow-400 font-display font-bold text-sm mb-2 uppercase">
                  Permanent Record
                </h3>
                <p className="text-xs text-zinc-400 font-display">
                  Your crew history is FOREVER. Even after you leave, opponents can use your
                  former crew affiliations as angles in battles. Choose wisely!
                </p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 p-4">
                <h3 className="text-blue-400 font-display font-bold text-sm mb-2 uppercase">
                  Crew Limits
                </h3>
                <ul className="text-xs text-zinc-400 space-y-1 font-display">
                  <li>• Max 5 members per crew</li>
                  <li>• One crew at a time</li>
                  <li>• Leader can't leave</li>
                  <li>• Transfer or disband only</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Crew Modal */}
      <CreateCrewModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCrewCreated}
      />
    </div>
  )
}
