"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DemographicVote, BattleVerdict, VerdictType } from "@/lib/game/verdictSystem";
import { CrowdDemographic, CROWD_DEMOGRAPHICS } from "@/lib/game/crowdDemographics";

// =====================================================
// CROWD SPRITE CONFIGURATION
// =====================================================

// Only these 3 races have sprites
type SpriteRace = "black" | "white" | "mixed";
type SpriteReaction =
  | "hype" | "cheer" | "stunned" | "watch" | "think"
  | "disappointed" | "boo" | "cringe" | "laugh"
  | "listen" | "unimpressed" | "record" | "talk";

// Available sprites per race and reaction (based on actual files)
const SPRITE_COUNTS: Record<SpriteRace, Record<SpriteReaction, number[]>> = {
  black: {
    hype: [1, 2, 3, 5, 6, 13, 14, 17, 22],
    cheer: [1, 2, 6, 9, 10, 13, 14, 15],
    stunned: [1, 3, 4, 5, 7, 8, 9, 10, 12, 15],
    watch: [1, 2, 3, 4, 7, 8, 15, 21],
    think: [1, 2, 5, 7, 14, 18],
    disappointed: [1, 2, 4],
    boo: [1, 2, 3, 7, 9],
    cringe: [1, 4, 5],
    laugh: [1],
    listen: [1, 2],
    unimpressed: [1, 2, 4, 6, 11],
    record: [1, 2, 3, 4, 5, 6],
    talk: [3],
  },
  white: {
    hype: [3, 4, 5, 6],
    cheer: [1, 2, 3, 7],
    stunned: [1, 2, 4, 8],
    watch: [5, 8, 13],
    think: [2, 3],
    disappointed: [],
    boo: [],
    cringe: [1, 2, 3],
    laugh: [1],
    listen: [1],
    unimpressed: [],
    record: [1, 2, 3, 4, 5, 6],
    talk: [],
  },
  mixed: {
    hype: [3, 5],
    cheer: [1, 4],
    stunned: [],
    watch: [1, 3, 6, 8, 9, 11, 12, 13, 18],
    think: [1, 2],
    disappointed: [],
    boo: [],
    cringe: [],
    laugh: [],
    listen: [],
    unimpressed: [],
    record: [],
    talk: [],
  },
};

function getRandomSprite(race: SpriteRace, reaction: SpriteReaction): string {
  const available = SPRITE_COUNTS[race][reaction];
  if (!available || available.length === 0) {
    // Fallback to watch if reaction not available for this race
    const fallback = SPRITE_COUNTS[race].watch;
    if (fallback && fallback.length > 0) {
      const num = fallback[Math.floor(Math.random() * fallback.length)];
      return `/sprites/crowd/${race}/watch_${String(num).padStart(3, "0")}.png`;
    }
    // Ultimate fallback to black watch
    return `/sprites/crowd/black/watch_001.png`;
  }
  const num = available[Math.floor(Math.random() * available.length)];
  return `/sprites/crowd/${race}/${reaction}_${String(num).padStart(3, "0")}.png`;
}

// =====================================================
// AUDIENCE MEMBER INTERFACE
// =====================================================

export interface AudienceMember {
  id: string;
  demographic: CrowdDemographic;
  demographicName: string;
  race: SpriteRace;
  gender: "male" | "female";
  spriteUrl: string;
  roundVotes: ("battler1" | "battler2")[];
  overallWinner: "battler1" | "battler2";
  verdict: string;
  reason: string;
  confidence: number;
}

// =====================================================
// GENERATE INDIVIDUAL AUDIENCE MEMBERS
// =====================================================

function generateAudienceMembers(
  verdict: BattleVerdict,
  count: number
): AudienceMember[] {
  const members: AudienceMember[] = [];

  // Distribute members based on demographic percentages
  for (const vote of verdict.demographicVotes) {
    const memberCount = Math.round((vote.percentage / 100) * count);
    for (let i = 0; i < memberCount; i++) {
      // Randomize race distribution (rough approximation of battle rap audiences)
      const raceRoll = Math.random();
      let race: SpriteRace;
      if (raceRoll < 0.65) race = "black";
      else if (raceRoll < 0.85) race = "white";
      else race = "mixed";

      // Gender distribution (roughly 70/30 male/female in battle rap crowds)
      const gender = Math.random() < 0.7 ? "male" : "female";

      // Map sprite reaction based on vote outcome
      let reaction: SpriteReaction = "watch";
      const winnerIsTheirs = vote.overallWinner === verdict.winner;
      const avgMargin = verdict.avgMargin;

      if (winnerIsTheirs) {
        if (avgMargin > 2.0) reaction = "hype";
        else if (avgMargin > 1.0) reaction = "cheer";
        else reaction = "watch";
      } else {
        if (avgMargin > 2.0) reaction = "stunned";
        else if (avgMargin > 1.0) reaction = "disappointed";
        else reaction = "think";
      }

      // Small chance of recording regardless
      if (Math.random() < 0.1) reaction = "record";

      members.push({
        id: `${vote.demographic}-${i}`,
        demographic: vote.demographic,
        demographicName: vote.demographicName,
        race,
        gender,
        spriteUrl: getRandomSprite(race, reaction),
        roundVotes: vote.roundVotes,
        overallWinner: vote.overallWinner,
        verdict: vote.verdict,
        reason: vote.reason,
        confidence: vote.confidence,
      });
    }
  }

  // Shuffle for random display order
  return members.sort(() => Math.random() - 0.5);
}

// =====================================================
// VERDICT BADGE STYLING
// =====================================================

const VERDICT_COLORS: Record<VerdictType, string> = {
  BODYBAG: "bg-red-500/20 text-red-400 border-red-500/30",
  "30": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "GENTLEMAN'S 30": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  EDGE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DEBATABLE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const DEMOGRAPHIC_COLORS: Record<CrowdDemographic, string> = {
  purists: "bg-indigo-500/20 text-indigo-400",
  street_fans: "bg-red-500/20 text-red-400",
  comedy_fans: "bg-yellow-500/20 text-yellow-400",
  aggression_fans: "bg-orange-500/20 text-orange-400",
  performance_fans: "bg-purple-500/20 text-purple-400",
};

// =====================================================
// SINGLE AUDIENCE MEMBER CARD
// =====================================================

interface AudienceMemberCardProps {
  member: AudienceMember;
  battler1Name: string;
  battler2Name: string;
  isRevealing: boolean;
}

function AudienceMemberCard({
  member,
  battler1Name,
  battler2Name,
  isRevealing,
}: AudienceMemberCardProps) {
  const winnerName = member.overallWinner === "battler1" ? battler1Name : battler2Name;

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800
        transition-all duration-500
        ${isRevealing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {/* Sprite */}
      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
        <Image
          src={member.spriteUrl}
          alt="Audience member"
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Demographic tag */}
        <span
          className={`
            inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
            ${DEMOGRAPHIC_COLORS[member.demographic]}
          `}
        >
          {member.demographicName}
        </span>

        {/* Their verdict */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-zinc-500">Gave it to</span>
          <span className="text-xs font-bold text-zinc-200">{winnerName}</span>
          <span className="text-[10px] text-zinc-600">({member.verdict})</span>
        </div>

        {/* Their reason */}
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{member.reason}</p>
      </div>

      {/* Confidence indicator */}
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-zinc-500 uppercase">Confidence</span>
        <div className="w-8 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${member.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT - STREAMING REVEAL
// =====================================================

interface AudienceVerdictDisplayProps {
  verdict: BattleVerdict;
  audienceCount?: number;
  revealSpeed?: number;
  autoStart?: boolean;
}

export function AudienceVerdictDisplay({
  verdict,
  audienceCount = 10,
  revealSpeed = 800,
  autoStart = true,
}: AudienceVerdictDisplayProps) {
  const [members, setMembers] = useState<AudienceMember[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(autoStart);

  // Generate members on mount
  useEffect(() => {
    const generated = generateAudienceMembers(verdict, audienceCount);
    setMembers(generated);
  }, [verdict, audienceCount]);

  // Reveal members one by one
  useEffect(() => {
    if (!isStarted || revealedCount >= members.length) {
      if (revealedCount >= members.length && members.length > 0) {
        setIsComplete(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      setRevealedCount(prev => prev + 1);
    }, revealSpeed);

    return () => clearTimeout(timer);
  }, [isStarted, revealedCount, members.length, revealSpeed]);

  // Calculate running vote totals
  const revealedMembers = members.slice(0, revealedCount);
  const battler1Votes = revealedMembers.filter(m => m.overallWinner === "battler1").length;
  const battler2Votes = revealedMembers.filter(m => m.overallWinner === "battler2").length;

  return (
    <div className="space-y-4">
      {/* Header with verdict */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-zinc-300">
            AUDIENCE VERDICT
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`
                px-2 py-1 rounded text-xs font-bold uppercase border
                ${VERDICT_COLORS[verdict.verdict]}
              `}
            >
              {verdict.verdict}
            </span>
            <span className="text-zinc-400 text-xs">{verdict.score}</span>
          </div>
        </div>

        {/* Running vote count */}
        <div className="text-right">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-black text-orange-500">{battler1Votes}</div>
              <div className="text-[10px] text-zinc-500 uppercase">{verdict.battler1Name}</div>
            </div>
            <div className="text-zinc-600">-</div>
            <div className="text-center">
              <div className="text-lg font-black text-blue-500">{battler2Votes}</div>
              <div className="text-[10px] text-zinc-500 uppercase">{verdict.battler2Name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="absolute left-0 h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${members.length > 0 ? (revealedCount / members.length) * 100 : 0}%` }}
        />
        {!isStarted && (
          <button
            onClick={() => setIsStarted(true)}
            className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            CLICK TO REVEAL VOTES
          </button>
        )}
      </div>

      {/* Audience members grid */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {revealedMembers.map((member, idx) => (
          <AudienceMemberCard
            key={member.id}
            member={member}
            battler1Name={verdict.battler1Name}
            battler2Name={verdict.battler2Name}
            isRevealing={idx < revealedCount}
          />
        ))}
      </div>

      {/* Final summary when complete */}
      {isComplete && (
        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 mt-4">
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Room Consensus</div>
            <div className="text-lg font-black text-zinc-200 mt-1">
              {Math.round(verdict.consensusPercentage)}% agree with the official verdict
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              {verdict.roomReaction === "unanimous" && "The room was unanimous"}
              {verdict.roomReaction === "consensus" && "Strong consensus in the room"}
              {verdict.roomReaction === "split" && "The room was split"}
              {verdict.roomReaction === "controversial" && "Controversial decision!"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// COMPACT VERSION FOR SIDEBAR/SUMMARY
// =====================================================

interface CompactAudienceVerdictProps {
  verdict: BattleVerdict;
}

export function CompactAudienceVerdict({ verdict }: CompactAudienceVerdictProps) {
  const winnerName = verdict.winner === "battler1" ? verdict.battler1Name : verdict.battler2Name;

  return (
    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
      {/* Verdict badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`
            px-3 py-1 rounded text-sm font-black uppercase border
            ${VERDICT_COLORS[verdict.verdict]}
          `}
        >
          {verdict.verdict}
        </span>
        <span className="text-xl font-black text-zinc-300">{verdict.score}</span>
      </div>

      {/* Winner */}
      <div className="text-center mb-4">
        <div className="text-xs text-zinc-500 uppercase">Winner</div>
        <div className="text-lg font-black text-orange-500 uppercase">{winnerName}</div>
      </div>

      {/* Demographic breakdown bars */}
      <div className="space-y-2">
        <div className="text-xs text-zinc-500 uppercase tracking-wider">By Demographic</div>
        {verdict.demographicVotes.map(vote => {
          const votedForWinner = vote.overallWinner === verdict.winner;
          return (
            <div key={vote.demographic} className="flex items-center gap-2">
              <div className="w-24 text-xs text-zinc-400 truncate">
                {CROWD_DEMOGRAPHICS[vote.demographic].name}
              </div>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${votedForWinner ? "bg-green-500" : "bg-red-500"}`}
                  style={{ width: `${vote.confidence}%` }}
                />
              </div>
              <div className="w-16 text-xs text-right">
                <span className={votedForWinner ? "text-green-400" : "text-red-400"}>
                  {vote.verdict}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room reaction */}
      <div className="mt-4 pt-3 border-t border-zinc-800 text-center">
        <span className="text-xs text-zinc-500">
          {Math.round(verdict.consensusPercentage)}% consensus •{" "}
          {verdict.roomReaction === "unanimous" && "Unanimous"}
          {verdict.roomReaction === "consensus" && "Strong Agreement"}
          {verdict.roomReaction === "split" && "Split Room"}
          {verdict.roomReaction === "controversial" && "Controversial!"}
        </span>
      </div>
    </div>
  );
}

export default AudienceVerdictDisplay;
