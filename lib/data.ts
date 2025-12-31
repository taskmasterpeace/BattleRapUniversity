import type {
  PrepTemplate,
  Activity,
  PrepRecommendation,
  ImpactPreview,
  FocusType,
  DayPlan,
} from "./types"

// ===========================
// PREP TEMPLATES & ACTIVITIES
// ===========================

export const prepTemplates: PrepTemplate[] = [
  {
    id: "balanced",
    name: "BALANCED STRATEGY",
    description: "Recommended mix of Writing, Performance, Rest",
    plan: ["writing", "writing", "rest", "performance", "writing", "performance", "rest"],
  },
  {
    id: "grind",
    name: "GRIND STRATEGY",
    description: "Heavy Writing & Performance focus, high stress",
    plan: ["writing", "writing", "writing", "performance", "performance", "writing", "performance"],
  },
  {
    id: "recovery",
    name: "RECOVERY STRATEGY",
    description: "Focus on Rest & Life to reduce stress",
    plan: ["rest", "life", "writing", "rest", "life", "writing", "rest"],
  },
]

export const focusActivities: Record<FocusType, Activity[]> = {
  research: [
    { id: "study-opponent", name: "STUDY OPPONENT FOOTAGE", bonus: "+Angles", bonusColor: "green" },
    { id: "gather-intel", name: "GATHER INTEL", bonus: "+Research", bonusColor: "green" },
    { id: "analyze-style", name: "ANALYZE OPPONENT STYLE", bonus: "+Preparation", bonusColor: "green" },
  ],
  writing: [
    { id: "punch-session", name: "PUNCHLINE SESSION", bonus: "+Lyricism", bonusColor: "orange" },
    { id: "scheme-workshop", name: "SCHEME WORKSHOP", bonus: "+Wordplay", bonusColor: "orange" },
    { id: "freestyle-drill", name: "FREESTYLE DRILLS", bonus: "+Flow", bonusColor: "orange" },
  ],
  performance: [
    { id: "mirror-practice", name: "MIRROR PRACTICE", bonus: "+Stage Presence", bonusColor: "blue" },
    { id: "crowd-drills", name: "CROWD CONTROL DRILLS", bonus: "+Crowd Control", bonusColor: "blue" },
    { id: "delivery-workshop", name: "DELIVERY WORKSHOP", bonus: "+Delivery", bonusColor: "blue" },
  ],
  life: [
    { id: "family-time", name: "FAMILY TIME", bonus: "+Family", bonusColor: "purple" },
    { id: "financial-mgmt", name: "FINANCIAL MANAGEMENT", bonus: "+Financial", bonusColor: "purple" },
    { id: "networking", name: "NETWORKING", bonus: "+Reputation", bonusColor: "purple" },
  ],
  rest: [
    { id: "full-rest", name: "FULL REST DAY", bonus: "-Stress", bonusColor: "green" },
    { id: "meditation", name: "MEDITATION", bonus: "+Resilience", bonusColor: "green" },
    { id: "light-review", name: "LIGHT MATERIAL REVIEW", bonus: "+Memory", bonusColor: "green" },
  ],
}

export const defaultRecommendations: PrepRecommendation[] = [
  { type: "success", text: "Focus on", highlight: "WRITING", action: "(5-7 days)\n→ Boost lyricism" },
  { type: "success", text: "Include 2-3", highlight: "REST", action: "days" },
  { type: "warning", text: "Opponent uses angles\n→ Consider", highlight: "RESEARCH", action: "" },
]

// ===========================
// IMPACT CALCULATION
// ===========================

export function calculateImpactPreview(days: DayPlan[]): ImpactPreview {
  let lyricism = 0
  let flow = 0
  let resilience = 0
  let stressChange = 0

  days.forEach((day) => {
    switch (day.focus) {
      case "writing":
        lyricism += 0.3
        flow += 0.2
        stressChange += 2
        break
      case "performance":
        flow += 0.3
        stressChange += 3
        break
      case "research":
        lyricism += 0.1
        stressChange += 1
        break
      case "rest":
        resilience += 0.2
        stressChange -= 3
        break
      case "life":
        resilience += 0.1
        stressChange -= 1
        break
    }
  })

  const baseStress = 45
  const finalStress = Math.max(0, Math.min(100, baseStress + stressChange))
  const avgBoost = (lyricism + flow) / 2
  const predictedScore = 6.5 + avgBoost
  const chokeRisk = Math.max(2, Math.min(30, 5 + (finalStress - 50) * 0.3))

  return {
    lyricism: Math.round(lyricism * 10) / 10,
    flow: Math.round(flow * 10) / 10,
    resilience: Math.round(resilience * 10) / 10,
    stressChange: { from: baseStress, to: Math.round(finalStress) },
    predictedScore: Math.round(predictedScore * 10) / 10,
    chokeRisk: Math.round(chokeRisk),
  }
}
