"use client"

import Image from "next/image"
import type { ImageAspectRatio } from "@/lib/life-events"

interface EventImageProps {
  src: string
  aspectRatio: ImageAspectRatio
  alt: string
}

export function EventImage({ src, aspectRatio, alt }: EventImageProps) {
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square"
      case "9:16":
        return "aspect-[9/16]"
      case "16:9":
        return "aspect-video"
      case "21:9":
        return "aspect-[21/9]"
      default:
        return "aspect-video"
    }
  }

  const getContainerClass = () => {
    switch (aspectRatio) {
      case "9:16":
        return "max-w-xs mx-auto"
      case "1:1":
        return "max-w-sm mx-auto"
      default:
        return "w-full"
    }
  }

  return (
    <div className={`relative overflow-hidden bg-zinc-800 ${getContainerClass()}`}>
      <div className={`relative ${getAspectClass()}`}>
        <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-cover" />
      </div>
    </div>
  )
}
