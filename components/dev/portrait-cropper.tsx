"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Check, RotateCcw, ZoomIn, ZoomOut, AlertTriangle, Crop } from "lucide-react"

interface PortraitCropperProps {
  battlerId: string
  battlerName: string
  spriteUrl: string
  onComplete: () => void
  onCancel: () => void
}

interface CropBox {
  x: number
  y: number
  size: number // Square crops only
}

export function PortraitCropper({
  battlerId,
  battlerName,
  spriteUrl,
  onComplete,
  onCancel,
}: PortraitCropperProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [cropBox, setCropBox] = useState<CropBox | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load image from sprite URL
  useEffect(() => {
    const fullUrl = spriteUrl.startsWith('http') ? spriteUrl : spriteUrl
    setImageUrl(fullUrl)

    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
      // Initialize crop box to center, taking largest square that fits
      const size = Math.min(img.width, img.height)
      setCropBox({
        x: (img.width - size) / 2,
        y: (img.height - size) / 2,
        size,
      })
    }
    img.onerror = () => {
      setError(`Failed to load image: ${spriteUrl}`)
    }
    img.src = fullUrl
  }, [spriteUrl])

  // Handle mouse down on crop area
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || !imageDimensions || !cropBox) return

      const rect = containerRef.current.getBoundingClientRect()
      const scaleX = imageDimensions.width / rect.width
      const scaleY = imageDimensions.height / rect.height

      const mouseX = (e.clientX - rect.left) * scaleX
      const mouseY = (e.clientY - rect.top) * scaleY

      setIsDragging(true)
      setDragStart({ x: mouseX - cropBox.x, y: mouseY - cropBox.y })
    },
    [imageDimensions, cropBox]
  )

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStart || !containerRef.current || !imageDimensions || !cropBox)
        return

      const rect = containerRef.current.getBoundingClientRect()
      const scaleX = imageDimensions.width / rect.width
      const scaleY = imageDimensions.height / rect.height

      const mouseX = (e.clientX - rect.left) * scaleX
      const mouseY = (e.clientY - rect.top) * scaleY

      let newX = mouseX - dragStart.x
      let newY = mouseY - dragStart.y

      // Constrain to image bounds
      newX = Math.max(0, Math.min(imageDimensions.width - cropBox.size, newX))
      newY = Math.max(0, Math.min(imageDimensions.height - cropBox.size, newY))

      setCropBox({ ...cropBox, x: newX, y: newY })
    },
    [isDragging, dragStart, imageDimensions, cropBox]
  )

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Adjust crop size
  const adjustSize = (delta: number) => {
    if (!cropBox || !imageDimensions) return

    const newSize = Math.max(
      32, // Minimum 32px
      Math.min(Math.min(imageDimensions.width, imageDimensions.height), cropBox.size + delta)
    )

    // Keep centered
    const deltaSize = newSize - cropBox.size
    let newX = cropBox.x - deltaSize / 2
    let newY = cropBox.y - deltaSize / 2

    // Constrain to bounds
    newX = Math.max(0, Math.min(imageDimensions.width - newSize, newX))
    newY = Math.max(0, Math.min(imageDimensions.height - newSize, newY))

    setCropBox({ x: newX, y: newY, size: newSize })
  }

  // Reset crop to center (largest square)
  const resetCrop = () => {
    if (!imageDimensions) return
    const size = Math.min(imageDimensions.width, imageDimensions.height)
    setCropBox({
      x: (imageDimensions.width - size) / 2,
      y: (imageDimensions.height - size) / 2,
      size,
    })
  }

  // Handle save - call the destructive crop API
  const handleSave = async () => {
    if (!cropBox || !imageDimensions) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/dev/battlers/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battlerId,
          crop: {
            x: Math.round(cropBox.x),
            y: Math.round(cropBox.y),
            width: Math.round(cropBox.size),
            height: Math.round(cropBox.size),
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to crop")
      }

      // Success!
      onComplete()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (!imageUrl || !imageDimensions || !cropBox) {
    if (error) {
      return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-red-500/50 p-6 max-w-md">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <span>{error}</span>
            </div>
            <button
              onClick={onCancel}
              className="mt-4 px-4 py-2 bg-zinc-700 text-white w-full"
            >
              Close
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-zinc-400">Loading image...</div>
      </div>
    )
  }

  // Calculate display scale
  const maxDisplaySize = 400
  const displayScale = Math.min(
    1,
    maxDisplaySize / Math.max(imageDimensions.width, imageDimensions.height)
  )
  const displayWidth = imageDimensions.width * displayScale
  const displayHeight = imageDimensions.height * displayScale

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-zinc-700 max-w-xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-orange-500 flex items-center gap-2">
              <Crop className="w-5 h-5" />
              Crop Portrait
            </h2>
            <p className="text-xs text-zinc-500">
              {battlerName} • Drag to position, zoom to resize
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4">
          {/* Warning about destructive crop */}
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded">
            <div className="flex items-start gap-2 text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Destructive crop:</strong> This will permanently modify the image file.
                The original cannot be recovered.
              </span>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative mx-auto cursor-move select-none border border-zinc-700"
            style={{ width: displayWidth, height: displayHeight }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Image */}
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full"
              style={{ pointerEvents: "none", imageRendering: "pixelated" }}
              draggable={false}
            />

            {/* Darkened overlay outside crop */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right, rgba(0,0,0,0.7) ${(cropBox.x / imageDimensions.width) * 100}%, transparent ${(cropBox.x / imageDimensions.width) * 100}%),
                  linear-gradient(to left, rgba(0,0,0,0.7) ${100 - ((cropBox.x + cropBox.size) / imageDimensions.width) * 100}%, transparent ${100 - ((cropBox.x + cropBox.size) / imageDimensions.width) * 100}%)
                `,
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(cropBox.x / imageDimensions.width) * 100}%`,
                right: `${100 - ((cropBox.x + cropBox.size) / imageDimensions.width) * 100}%`,
                top: 0,
                height: `${(cropBox.y / imageDimensions.height) * 100}%`,
                background: "rgba(0,0,0,0.7)",
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(cropBox.x / imageDimensions.width) * 100}%`,
                right: `${100 - ((cropBox.x + cropBox.size) / imageDimensions.width) * 100}%`,
                bottom: 0,
                height: `${100 - ((cropBox.y + cropBox.size) / imageDimensions.height) * 100}%`,
                background: "rgba(0,0,0,0.7)",
              }}
            />

            {/* Crop box border */}
            <div
              className="absolute border-2 border-orange-500 pointer-events-none"
              style={{
                left: `${(cropBox.x / imageDimensions.width) * 100}%`,
                top: `${(cropBox.y / imageDimensions.height) * 100}%`,
                width: `${(cropBox.size / imageDimensions.width) * 100}%`,
                height: `${(cropBox.size / imageDimensions.height) * 100}%`,
              }}
            >
              {/* Grid lines for alignment */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-orange-500/30" />
                ))}
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => adjustSize(-20)}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              title="Smaller crop area"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm text-zinc-400 font-mono w-24 text-center">
              {Math.round(cropBox.size)}×{Math.round(cropBox.size)}
            </span>
            <button
              onClick={() => adjustSize(20)}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              title="Larger crop area"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={resetCrop}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ml-2"
              title="Reset to full image"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Preview at different sizes */}
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <p className="text-xs text-zinc-500 mb-2 text-center">Preview after crop:</p>
            <div className="flex items-end justify-center gap-4">
              <div className="text-center">
                <div
                  className="bg-zinc-800 border border-zinc-600 overflow-hidden mx-auto"
                  style={{ width: 64, height: 64 }}
                >
                  <img
                    src={imageUrl}
                    alt="Preview 64"
                    style={{
                      imageRendering: "pixelated",
                      width: (imageDimensions.width / cropBox.size) * 64,
                      height: (imageDimensions.height / cropBox.size) * 64,
                      marginLeft: -(cropBox.x / cropBox.size) * 64,
                      marginTop: -(cropBox.y / cropBox.size) * 64,
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 mt-1 block">64px</span>
              </div>
              <div className="text-center">
                <div
                  className="bg-zinc-800 border border-zinc-600 overflow-hidden mx-auto"
                  style={{ width: 48, height: 48 }}
                >
                  <img
                    src={imageUrl}
                    alt="Preview 48"
                    style={{
                      imageRendering: "pixelated",
                      width: (imageDimensions.width / cropBox.size) * 48,
                      height: (imageDimensions.height / cropBox.size) * 48,
                      marginLeft: -(cropBox.x / cropBox.size) * 48,
                      marginTop: -(cropBox.y / cropBox.size) * 48,
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 mt-1 block">48px</span>
              </div>
              <div className="text-center">
                <div
                  className="bg-zinc-800 border border-zinc-600 overflow-hidden mx-auto"
                  style={{ width: 32, height: 32 }}
                >
                  <img
                    src={imageUrl}
                    alt="Preview 32"
                    style={{
                      imageRendering: "pixelated",
                      width: (imageDimensions.width / cropBox.size) * 32,
                      height: (imageDimensions.height / cropBox.size) * 32,
                      marginLeft: -(cropBox.x / cropBox.size) * 32,
                      marginTop: -(cropBox.y / cropBox.size) * 32,
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 mt-1 block">32px</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Original: {imageDimensions.width}×{imageDimensions.height}px → Crop:{" "}
            {Math.round(cropBox.size)}×{Math.round(cropBox.size)}px
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white font-display text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-display text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Crop & Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
