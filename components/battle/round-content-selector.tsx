"use client"

import { useState, useEffect } from "react"
import {
  type ContentType,
  type DeliveryType,
  type PerformanceType,
  type RoundSelections,
  type ForecastResult,
  CONTENT_TYPE_INFO,
  DELIVERY_TYPE_INFO,
  PERFORMANCE_TYPE_INFO,
  SELECTION_LIMITS,
  isValidSelection,
  calculateMockForecast,
} from "@/lib/round-crafting"
import { ContentTypeCard } from "./content-type-card"
import { ContentCategorySection } from "./content-category-section"
import { EffectivenessForecast } from "./effectiveness-forecast"
import { QuickSelectPresets } from "./quick-select-presets"
import { Button } from "@/components/ui/button"

interface RoundContentSelectorProps {
  roundIndex: 1 | 2 | 3
  onConfirm: (selections: RoundSelections) => void
  isSubmitting?: boolean
}

export function RoundContentSelector({ roundIndex, onConfirm, isSubmitting }: RoundContentSelectorProps) {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([])
  const [performanceTypes, setPerformanceTypes] = useState<PerformanceType[]>([])
  const [forecast, setForecast] = useState<ForecastResult | null>(null)

  // Calculate forecast when selections change
  useEffect(() => {
    if (contentTypes.length >= 1 || deliveryTypes.length >= 1 || performanceTypes.length >= 1) {
      const result = calculateMockForecast({
        contentTypes,
        deliveryTypes,
        performanceTypes,
      })
      setForecast(result)
    } else {
      setForecast(null)
    }
  }, [contentTypes, deliveryTypes, performanceTypes])

  const toggleContent = (type: ContentType) => {
    setContentTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      }
      if (prev.length >= SELECTION_LIMITS.content.max) return prev
      return [...prev, type]
    })
  }

  const toggleDelivery = (type: DeliveryType) => {
    setDeliveryTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      }
      if (prev.length >= SELECTION_LIMITS.delivery.max) return prev
      return [...prev, type]
    })
  }

  const togglePerformance = (type: PerformanceType) => {
    setPerformanceTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      }
      if (prev.length >= SELECTION_LIMITS.performance.max) return prev
      return [...prev, type]
    })
  }

  const handlePresetSelect = (selections: RoundSelections) => {
    setContentTypes(selections.contentTypes)
    setDeliveryTypes(selections.deliveryTypes)
    setPerformanceTypes(selections.performanceTypes)
  }

  const selections: RoundSelections = {
    contentTypes,
    deliveryTypes,
    performanceTypes,
  }

  const isValid = isValidSelection(selections)

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <QuickSelectPresets onSelect={handlePresetSelect} currentSelections={selections} />

      {/* Content Selection */}
      <ContentCategorySection
        category="content"
        title="Content"
        minSelections={SELECTION_LIMITS.content.min}
        maxSelections={SELECTION_LIMITS.content.max}
        currentSelections={contentTypes.length}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {(Object.keys(CONTENT_TYPE_INFO) as ContentType[]).map((type) => (
            <ContentTypeCard
              key={type}
              type={type}
              name={CONTENT_TYPE_INFO[type].name}
              description={CONTENT_TYPE_INFO[type].description}
              category="content"
              selected={contentTypes.includes(type)}
              disabled={!contentTypes.includes(type) && contentTypes.length >= SELECTION_LIMITS.content.max}
              onClick={() => toggleContent(type)}
            />
          ))}
        </div>
      </ContentCategorySection>

      {/* Delivery Selection */}
      <ContentCategorySection
        category="delivery"
        title="Delivery"
        minSelections={SELECTION_LIMITS.delivery.min}
        maxSelections={SELECTION_LIMITS.delivery.max}
        currentSelections={deliveryTypes.length}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(DELIVERY_TYPE_INFO) as DeliveryType[]).map((type) => (
            <ContentTypeCard
              key={type}
              type={type}
              name={DELIVERY_TYPE_INFO[type].name}
              description={DELIVERY_TYPE_INFO[type].description}
              category="delivery"
              selected={deliveryTypes.includes(type)}
              disabled={!deliveryTypes.includes(type) && deliveryTypes.length >= SELECTION_LIMITS.delivery.max}
              onClick={() => toggleDelivery(type)}
            />
          ))}
        </div>
      </ContentCategorySection>

      {/* Performance Selection */}
      <ContentCategorySection
        category="performance"
        title="Performance"
        minSelections={SELECTION_LIMITS.performance.min}
        maxSelections={SELECTION_LIMITS.performance.max}
        currentSelections={performanceTypes.length}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(PERFORMANCE_TYPE_INFO) as PerformanceType[]).map((type) => (
            <ContentTypeCard
              key={type}
              type={type}
              name={PERFORMANCE_TYPE_INFO[type].name}
              description={PERFORMANCE_TYPE_INFO[type].description}
              category="performance"
              selected={performanceTypes.includes(type)}
              disabled={!performanceTypes.includes(type) && performanceTypes.length >= SELECTION_LIMITS.performance.max}
              onClick={() => togglePerformance(type)}
            />
          ))}
        </div>
      </ContentCategorySection>

      {/* Forecast */}
      <EffectivenessForecast forecast={forecast} />

      {/* Confirm Button */}
      <Button
        onClick={() => onConfirm(selections)}
        disabled={!isValid || isSubmitting}
        className="w-full h-14 text-lg font-black uppercase tracking-tight"
      >
        {isSubmitting ? "Simulating..." : `Confirm Round ${roundIndex}`}
      </Button>
    </div>
  )
}
