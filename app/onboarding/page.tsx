"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Check, Minus, Plus, ChevronLeft, ChevronRight, Loader2, Info, X } from "lucide-react"
import { CityAutocomplete, type CityData } from "@/components/ui/city-autocomplete"
import { OriginSelector, type OriginType } from "@/components/onboarding/OriginSelector"

type Step = 1 | 2 | 3 | 4 | 5

interface OnboardingData {
  stageName: string
  city: CityData | null
  origin: OriginType | null
  league: string
  attributes: Record<string, number>
  styles: string[]
}

const leagues = [
  {
    id: "small_room",
    name: "SMALL ROOM CIRCUIT",
    description: "Intimate battles. Focus on bars & performance.",
    details: ["2-min rounds (4 segments)", "Writing-focused", "Small crowd"],
    image: "/small-intimate-battle-rap-venue-purple-lighting.jpg",
  },
  {
    id: "main_stage",
    name: "MAIN STAGE ARENA",
    description: "Grand stage. High stakes, media attention.",
    details: ["3-min rounds (6 segments)", "Performance-focused", "Large crowd"],
    image: "/large-arena-battle-rap-stage-bright-lights-crowd.jpg",
  },
]

const attributeCategories = {
  WRITING: [
    { id: "lyricism", name: "LYRICISM", icon: "pen", tooltip: "Metaphors, similes, clever wordplay" },
    { id: "wordplay", name: "WORDPLAY", icon: "message", tooltip: "Double entendres, punchlines" },
    { id: "creativity", name: "CREATIVITY", icon: "lightbulb", tooltip: "Unique angles, fresh content" },
    { id: "flow", name: "FLOW", icon: "waves", tooltip: "Rhythm, cadence, delivery timing" },
  ],
  PERFORMANCE: [
    { id: "stagePresence", name: "STAGE PRESENCE", icon: "theater", tooltip: "Confidence, charisma on stage" },
    { id: "crowdControl", name: "CROWD CONTROL", icon: "users", tooltip: "Ability to hype or control crowd" },
    { id: "delivery", name: "DELIVERY", icon: "mic", tooltip: "Voice projection, tone, emphasis" },
  ],
  PERSONAL: [
    { id: "financial", name: "FINANCIAL", icon: "dollar", tooltip: "Starting cash, affects stress" },
    { id: "reputation", name: "REPUTATION", icon: "star", tooltip: "Name recognition, booking offers" },
    { id: "family", name: "FAMILY", icon: "home", tooltip: "Support system, emotional stability" },
  ],
}

const resilienceAttr = {
  id: "resilience",
  name: "RESILIENCE",
  icon: "shield",
  tooltip: "Handles pressure, avoids choking",
}

const styleTags = [
  { id: "wordplay", name: "WORDPLAY", icon: "message", category: "content" },
  { id: "angles", name: "ANGLES", icon: "target", category: "content" },
  { id: "storytelling", name: "STORYTELLING", icon: "book", category: "content" },
  { id: "flow", name: "FLOW", icon: "waves", category: "content" },
  { id: "rebuttals", name: "REBUTTALS", icon: "rotate", category: "content" },
  { id: "schemes", name: "SCHEMES", icon: "theater", category: "content" },
  { id: "aggression", name: "AGGRESSION", icon: "zap", category: "delivery" },
  { id: "comedy", name: "COMEDY", icon: "smile", category: "delivery" },
]

const initialAttributes: Record<string, number> = {
  lyricism: 3,
  wordplay: 3,
  creativity: 2,
  flow: 2,
  stagePresence: 3,
  crowdControl: 2,
  delivery: 2,
  financial: 2,
  reputation: 2,
  family: 2,
  resilience: 2,
}

const presets = {
  technicalWriter: {
    name: "TECHNICAL WRITER",
    attributes: {
      lyricism: 6,
      wordplay: 6,
      creativity: 5,
      flow: 4,
      stagePresence: 2,
      crowdControl: 1,
      delivery: 2,
      financial: 1,
      reputation: 2,
      family: 1,
      resilience: 3,
    },
  },
  performer: {
    name: "PERFORMER",
    attributes: {
      lyricism: 3,
      wordplay: 3,
      creativity: 3,
      flow: 3,
      stagePresence: 6,
      crowdControl: 5,
      delivery: 5,
      financial: 1,
      reputation: 2,
      family: 1,
      resilience: 1,
    },
  },
  balanced: {
    name: "BALANCED",
    attributes: {
      lyricism: 3,
      wordplay: 3,
      creativity: 2,
      flow: 2,
      stagePresence: 3,
      crowdControl: 2,
      delivery: 2,
      financial: 2,
      reputation: 2,
      family: 2,
      resilience: 2,
    },
  },
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredAttr, setHoveredAttr] = useState<string | null>(null)

  const [data, setData] = useState<OnboardingData>({
    stageName: "",
    city: null,
    origin: null,
    league: "",
    attributes: { ...initialAttributes },
    styles: [],
  })

  const usedPoints = Object.values(data.attributes).reduce((sum, v) => sum + v, 0)
  const totalPoints = 36
  const remainingPoints = totalPoints - usedPoints

  const isStageNameValid = data.stageName.length >= 2 && data.stageName.length <= 50
  const isOriginSelected = data.origin !== null
  const isLeagueSelected = data.league !== ""
  const isAttributesValid = remainingPoints === 0
  const isStylesValid = data.styles.length >= 1 && data.styles.length <= 3

  const canProceed = () => {
    switch (step) {
      case 1:
        return isStageNameValid
      case 2:
        return isOriginSelected
      case 3:
        return isLeagueSelected
      case 4:
        return isAttributesValid
      case 5:
        return isStylesValid
      default:
        return false
    }
  }

  const handleAttributeChange = (attr: string, delta: number) => {
    const current = data.attributes[attr]
    const newVal = current + delta
    if (newVal < 1 || newVal > 8) return
    if (delta > 0 && remainingPoints <= 0) return
    setData((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: newVal },
    }))
  }

  const applyPreset = (preset: typeof presets.balanced) => {
    setData((prev) => ({ ...prev, attributes: { ...preset.attributes } }))
  }

  const randomizeAttributes = () => {
    const attrs = Object.keys(initialAttributes)
    const newAttrs: Record<string, number> = {}
    attrs.forEach((a) => (newAttrs[a] = 1))
    let pointsLeft = 25
    while (pointsLeft > 0) {
      const randomAttr = attrs[Math.floor(Math.random() * attrs.length)]
      if (newAttrs[randomAttr] < 8) {
        newAttrs[randomAttr]++
        pointsLeft--
      }
    }
    setData((prev) => ({ ...prev, attributes: newAttrs }))
  }

  const handleStyleToggle = (styleId: string) => {
    setData((prev) => {
      const hasStyle = prev.styles.includes(styleId)
      if (hasStyle) {
        return { ...prev, styles: prev.styles.filter((s) => s !== styleId) }
      }
      if (prev.styles.length >= 3) return prev
      return { ...prev, styles: [...prev.styles, styleId] }
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/battler/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage_name: data.stageName,
          city: data.city
            ? {
                name: data.city.name,
                state: data.city.state,
                region: data.city.region,
                population: data.city.population,
                coordinates: data.city.coordinates,
                time_zone: data.city.timeZone,
                city_tier: data.city.cityTier,
              }
            : null,
          origin_type: data.origin,
          primary_league_id: data.league,
          style_tags: data.styles,
          allocated_attributes: {
            writing: {
              lyricism: data.attributes.lyricism,
              wordplay: data.attributes.wordplay,
              creativity: data.attributes.creativity,
              flow: data.attributes.flow,
            },
            performance: {
              stage_presence: data.attributes.stagePresence,
              crowd_control: data.attributes.crowdControl,
              delivery: data.attributes.delivery,
            },
            personal: {
              financial_stability: data.attributes.financial,
              reputation: data.attributes.reputation,
              family_bond: data.attributes.family,
            },
            resilience: data.attributes.resilience,
          },
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Failed to create battler")
      }

      setSubmitSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (step < 5) {
      setStep((s) => (s + 1) as Step)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
  }

  const getTierLabel = (value: number) => {
    if (value <= 3) return "LOW"
    if (value <= 6) return "MID"
    return "TOP"
  }

  const getBarColor = (value: number) => {
    if (value <= 3) return "bg-zinc-500"
    if (value <= 6) return "bg-blue-500"
    return "bg-purple-500"
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-zinc-100 uppercase mb-4">BATTLER CREATED</h1>
          <p className="text-zinc-400 mb-2">
            Welcome, <span className="text-orange-500 font-bold">{data.stageName}</span>
          </p>
          {data.city && (
            <p className="text-zinc-500 text-sm mb-2">
              Repping {data.city.name}, {data.city.state} ({data.city.region})
            </p>
          )}
          <p className="text-zinc-500 text-sm mb-8">Starting Rating: 1200 | Tier: LOW</p>
          <p className="text-zinc-600 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-zinc-100 tracking-wide">
            ONBOARDING:{" "}
            {step === 1
              ? "IDENTITY"
              : step === 2
                ? "ORIGIN STORY"
                : step === 3
                  ? "LEAGUE SELECTION"
                  : step === 4
                    ? "ATTRIBUTES"
                    : "DEFINE YOUR STYLE"}{" "}
            <span className="text-zinc-500">(STEP {step} OF 5)</span>
          </h1>
          <Link
            href="/roster"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border border-zinc-700 transition-colors"
            title="Cancel and return to roster"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">CANCEL</span>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-zinc-800 mb-6 sm:mb-8">
          <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        {/* Step Content */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-display font-bold text-zinc-400 tracking-wide mb-2">
                    STAGE NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.stageName}
                    onChange={(e) => setData((prev) => ({ ...prev, stageName: e.target.value }))}
                    maxLength={50}
                    className={`w-full bg-zinc-800 border-2 px-4 py-3 text-lg font-display text-zinc-100 focus:outline-none transition-colors ${
                      data.stageName.length > 0
                        ? isStageNameValid
                          ? "border-green-500"
                          : "border-red-500"
                        : "border-zinc-700 focus:border-orange-500"
                    }`}
                    placeholder="Enter your battle rap name..."
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-zinc-500">Min 2 characters</span>
                    <span
                      className={`text-xs ${data.stageName.length > 0 ? (isStageNameValid ? "text-green-500" : "text-red-500") : "text-zinc-500"}`}
                    >
                      {data.stageName.length}/50
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-display font-bold text-zinc-400 tracking-wide mb-2">
                    HOMETOWN <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <CityAutocomplete
                    value={data.city}
                    onChange={(city) => setData((prev) => ({ ...prev, city }))}
                    placeholder="Search for your city..."
                  />
                  {data.city && (
                    <div className="mt-2 p-3 bg-zinc-800/50 border border-zinc-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 uppercase">City Tier</span>
                        <span
                          className={`text-xs font-display uppercase px-2 py-0.5 ${
                            data.city.cityTier === "major"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                              : data.city.cityTier === "regional"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                                : "bg-zinc-600/20 text-zinc-400 border border-zinc-600/50"
                          }`}
                        >
                          {data.city.cityTier}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1">
                        {data.city.cityTier === "major" && "Major city battlers get +10% crowd energy"}
                        {data.city.cityTier === "regional" && "Regional battlers get bonus in local tournaments"}
                        {data.city.cityTier === "underground" && "Underground scene = +5% authenticity"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-display font-bold text-zinc-400 tracking-wide mb-2 text-center">
                  PORTRAIT GENERATOR
                </label>
                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-zinc-800 border-2 border-zinc-600 mx-auto overflow-hidden">
                  <Image
                    src="/battle-rapper-portrait-pixel-art-hoodie-dark-skin.jpg"
                    alt="Portrait"
                    width={192}
                    height={192}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  {["skin", "face", "outfit", "accessories"].map((opt, i) => (
                    <button
                      key={opt}
                      className="w-10 h-10 bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:border-orange-500 transition-colors text-xs text-zinc-500"
                      title={opt}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <OriginSelector selectedOrigin={data.origin} onSelect={(origin) => setData((prev) => ({ ...prev, origin }))} />
          )}

          {step === 3 && (
            <div>
              <p className="text-zinc-400 text-sm mb-6 text-center">
                Choose your primary league. You can participate in both, but this will be your starting point.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => setData((prev) => ({ ...prev, league: league.id }))}
                    className={`relative overflow-hidden border-2 transition-colors text-left ${
                      data.league === league.id ? "border-orange-500" : "border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    <Image
                      src={league.image || "/placeholder.svg"}
                      alt={league.name}
                      width={400}
                      height={200}
                      className="w-full h-32 sm:h-40 object-cover"
                    />
                    <div className="p-4 bg-zinc-800">
                      <h3 className="text-base sm:text-lg font-display font-bold text-zinc-100">{league.name}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{league.description}</p>
                      <div className="mt-3 space-y-1">
                        {league.details.map((detail, i) => (
                          <div key={i} className="text-xs text-zinc-500">
                            * {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                    {data.league === league.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="text-center mb-6">
                <div
                  className={`text-5xl sm:text-6xl font-display font-bold ${
                    remainingPoints === 0 ? "text-green-500" : remainingPoints < 0 ? "text-red-500" : "text-orange-500"
                  }`}
                >
                  {remainingPoints}
                </div>
                <p className="text-zinc-500 uppercase text-sm mt-1">POINTS REMAINING</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1 text-xs font-display font-bold uppercase bg-zinc-800 border border-zinc-700 hover:border-orange-500 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
                <button
                  onClick={randomizeAttributes}
                  className="px-3 py-1 text-xs font-display font-bold uppercase bg-zinc-800 border border-zinc-700 hover:border-orange-500 transition-colors"
                >
                  RANDOMIZE
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {Object.entries(attributeCategories).map(([category, attrs]) => (
                  <div key={category} className="bg-zinc-800/50 border border-zinc-700 p-4">
                    <h3 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 text-center">
                      {category}
                    </h3>
                    <div className="space-y-4">
                      {attrs.map((attr) => {
                        const value = data.attributes[attr.id]
                        return (
                          <div key={attr.id} className="relative">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-display text-zinc-300">{attr.name}</span>
                                <button
                                  className="text-zinc-600 hover:text-zinc-400"
                                  onMouseEnter={() => setHoveredAttr(attr.id)}
                                  onMouseLeave={() => setHoveredAttr(null)}
                                >
                                  <Info className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleAttributeChange(attr.id, -1)}
                                  className="w-6 h-6 bg-zinc-700 border border-zinc-600 flex items-center justify-center hover:border-orange-500 transition-colors disabled:opacity-50"
                                  disabled={value <= 1}
                                >
                                  <Minus className="w-3 h-3 text-zinc-400" />
                                </button>
                                <span className="w-8 text-center font-display font-bold text-zinc-100">{value}</span>
                                <button
                                  onClick={() => handleAttributeChange(attr.id, 1)}
                                  className="w-6 h-6 bg-zinc-700 border border-zinc-600 flex items-center justify-center hover:border-orange-500 transition-colors disabled:opacity-50"
                                  disabled={value >= 8 || remainingPoints <= 0}
                                >
                                  <Plus className="w-3 h-3 text-zinc-400" />
                                </button>
                              </div>
                            </div>
                            <div className="h-2 bg-zinc-700 flex gap-0.5">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className={`flex-1 ${i < value ? getBarColor(value) : "bg-zinc-600"}`} />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-zinc-600">LOW</span>
                              <span className="text-xs text-zinc-600">TOP</span>
                            </div>
                            {hoveredAttr === attr.id && (
                              <div className="absolute z-10 left-0 top-full mt-1 bg-zinc-800 border border-zinc-600 p-2 text-xs text-zinc-400 w-48">
                                {attr.tooltip}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resilience standalone */}
              <div className="mt-6 bg-orange-500/10 border border-orange-500/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-display font-bold text-orange-500">{resilienceAttr.name}</span>
                    <button
                      className="text-zinc-600 hover:text-zinc-400"
                      onMouseEnter={() => setHoveredAttr("resilience")}
                      onMouseLeave={() => setHoveredAttr(null)}
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAttributeChange("resilience", -1)}
                      className="w-6 h-6 bg-zinc-700 border border-zinc-600 flex items-center justify-center hover:border-orange-500 transition-colors disabled:opacity-50"
                      disabled={data.attributes.resilience <= 1}
                    >
                      <Minus className="w-3 h-3 text-zinc-400" />
                    </button>
                    <span className="w-8 text-center font-display font-bold text-zinc-100">
                      {data.attributes.resilience}
                    </span>
                    <button
                      onClick={() => handleAttributeChange("resilience", 1)}
                      className="w-6 h-6 bg-zinc-700 border border-zinc-600 flex items-center justify-center hover:border-orange-500 transition-colors disabled:opacity-50"
                      disabled={data.attributes.resilience >= 8 || remainingPoints <= 0}
                    >
                      <Plus className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-zinc-700 flex gap-0.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 ${i < data.attributes.resilience ? "bg-orange-500" : "bg-zinc-600"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2">Critical for avoiding chokes under pressure</p>
                {hoveredAttr === "resilience" && (
                  <div className="mt-2 text-xs text-zinc-400">{resilienceAttr.tooltip}</div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="text-center mb-6">
                <p className="text-zinc-400 text-sm">Select 1-3 style tags that define your battling approach</p>
                <div
                  className={`text-3xl font-display font-bold mt-2 ${
                    isStylesValid ? "text-green-500" : "text-orange-500"
                  }`}
                >
                  {data.styles.length}/3 <span className="text-zinc-500 text-lg">SELECTED</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {styleTags.map((style) => {
                  const isSelected = data.styles.includes(style.id)
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleStyleToggle(style.id)}
                      className={`px-4 py-3 border-2 font-display font-bold uppercase transition-colors flex items-center gap-2 ${
                        isSelected
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {style.name}
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="mt-4 bg-red-500/20 border border-red-500/50 p-3 text-red-400 text-sm">{error}</div>}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 border border-orange-500 text-white font-display font-bold uppercase hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> CREATING...
              </>
            ) : step === 5 ? (
              "CREATE BATTLER"
            ) : (
              <>
                NEXT <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
