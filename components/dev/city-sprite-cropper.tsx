"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Crop, Check, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"

interface CitySpriteCropperProps {
  file: File
  cityPrefix: string
  onComplete: () => void
  onCancel: () => void
}

export function CitySpriteCropper({ file, cityPrefix, onComplete, onCancel }: CitySpriteCropperProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; size: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [variant, setVariant] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)

    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
      // Initialize crop box to center square
      const size = Math.min(img.width, img.height)
      setCropBox({
        x: (img.width - size) / 2,
        y: (img.height - size) / 2,
        size
      })
    }
    img.src = url

    return () => URL.revokeObjectURL(url)
  }, [file])

  // Handle mouse down on crop area
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !imageDimensions || !cropBox) return

    const rect = containerRef.current.getBoundingClientRect()
    const scaleX = imageDimensions.width / rect.width
    const scaleY = imageDimensions.height / rect.height

    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    setIsDragging(true)
    setDragStart({ x: mouseX - cropBox.x, y: mouseY - cropBox.y })
  }, [imageDimensions, cropBox])

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !containerRef.current || !imageDimensions || !cropBox) return

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
  }, [isDragging, dragStart, imageDimensions, cropBox])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Adjust crop size
  const adjustSize = (delta: number) => {
    if (!cropBox || !imageDimensions) return

    const newSize = Math.max(64, Math.min(
      Math.min(imageDimensions.width, imageDimensions.height),
      cropBox.size + delta
    ))

    // Keep centered
    const deltaSize = newSize - cropBox.size
    let newX = cropBox.x - deltaSize / 2
    let newY = cropBox.y - deltaSize / 2

    // Constrain to bounds
    newX = Math.max(0, Math.min(imageDimensions.width - newSize, newX))
    newY = Math.max(0, Math.min(imageDimensions.height - newSize, newY))

    setCropBox({ x: newX, y: newY, size: newSize })
  }

  // Reset crop to center
  const resetCrop = () => {
    if (!imageDimensions) return
    const size = Math.min(imageDimensions.width, imageDimensions.height)
    setCropBox({
      x: (imageDimensions.width - size) / 2,
      y: (imageDimensions.height - size) / 2,
      size
    })
  }

  // Upload with crop
  const handleUpload = async () => {
    if (!cropBox || !imageDimensions) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('cityPrefix', cityPrefix)
      if (variant.trim()) {
        formData.append('variant', variant.trim())
      }
      formData.append('crop', JSON.stringify({
        left: cropBox.x,
        top: cropBox.y,
        width: cropBox.size,
        height: cropBox.size
      }))

      const res = await fetch('/api/cities/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onComplete()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (!imageUrl || !imageDimensions || !cropBox) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="text-zinc-400">Loading image...</div>
      </div>
    )
  }

  // Calculate display scale
  const maxDisplaySize = 500
  const displayScale = Math.min(1, maxDisplaySize / Math.max(imageDimensions.width, imageDimensions.height))
  const displayWidth = imageDimensions.width * displayScale
  const displayHeight = imageDimensions.height * displayScale

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-zinc-700 max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-orange-500">Crop City Sprite</h2>
            <p className="text-xs text-zinc-500">{cityPrefix} • Output: 512×512</p>
          </div>
          <button onClick={onCancel} className="p-2 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4">
          <div
            ref={containerRef}
            className="relative mx-auto cursor-move select-none"
            style={{ width: displayWidth, height: displayHeight }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Preview"
              className="w-full h-full"
              style={{ pointerEvents: 'none' }}
              draggable={false}
            />

            {/* Darkened overlay outside crop */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right, rgba(0,0,0,0.7) ${(cropBox.x / imageDimensions.width) * 100}%, transparent ${(cropBox.x / imageDimensions.width) * 100}%),
                  linear-gradient(to left, rgba(0,0,0,0.7) ${100 - ((cropBox.x + cropBox.size) / imageDimensions.width) * 100}%, transparent ${100 - ((cropBox.x + cropBox.size) / imageDimensions.width) * 100}%)
                `
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(cropBox.x / imageDimensions.width) * 100}%`,
                right: `${100 - ((cropBox.x + cropBox.size) / imageDimensions.width) * 100}%`,
                top: 0,
                height: `${(cropBox.y / imageDimensions.height) * 100}%`,
                background: 'rgba(0,0,0,0.7)'
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(cropBox.x / imageDimensions.width) * 100}%`,
                right: `${100 - ((cropBox.x + cropBox.size) / imageDimensions.width) * 100}%`,
                bottom: 0,
                height: `${100 - ((cropBox.y + cropBox.size) / imageDimensions.height) * 100}%`,
                background: 'rgba(0,0,0,0.7)'
              }}
            />

            {/* Crop box border */}
            <div
              className="absolute border-2 border-orange-500 pointer-events-none"
              style={{
                left: `${(cropBox.x / imageDimensions.width) * 100}%`,
                top: `${(cropBox.y / imageDimensions.height) * 100}%`,
                width: `${(cropBox.size / imageDimensions.width) * 100}%`,
                height: `${(cropBox.size / imageDimensions.height) * 100}%`
              }}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-orange-500/30" />
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => adjustSize(-50)}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
              title="Zoom out (smaller crop)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => adjustSize(50)}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
              title="Zoom in (larger crop)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetCrop}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
              title="Reset to center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Variant name input */}
          <div className="mt-4">
            <label className="block text-xs text-zinc-500 mb-1">
              Variant name (optional - e.g., "night", "winter", "rain")
            </label>
            <input
              type="text"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="Leave empty for primary sprite"
              className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
            />
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
            Crop: {Math.round(cropBox.size)}×{Math.round(cropBox.size)}px → 512×512px
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 font-display text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-orange-500 text-white font-display text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Sprite
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
