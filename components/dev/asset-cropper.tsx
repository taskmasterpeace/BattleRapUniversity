"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Check, RotateCcw, ZoomIn, ZoomOut, AlertTriangle, Move, Maximize2 } from "lucide-react"
import { AssetType, validateImageDimensions } from "@/lib/game/assetTypes"

interface AssetCropperProps {
  imageUrl: string
  assetType: AssetType
  entityId?: string // battlerId, venueId, etc.
  entityName?: string
  onSave: (cropData: CropData) => Promise<void>
  onCancel: () => void
}

export interface CropData {
  x: number
  y: number
  width: number
  height: number
  outputWidth: number
  outputHeight: number
}

interface CropBox {
  x: number
  y: number
  width: number
  height: number
}

type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null

export function AssetCropper({
  imageUrl,
  assetType,
  entityId,
  entityName,
  onSave,
  onCancel,
}: AssetCropperProps) {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [cropBox, setCropBox] = useState<CropBox | null>(null)
  const [dragMode, setDragMode] = useState<DragMode>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; box: CropBox } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Load image and initialize crop box
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
      // Initialize crop box with correct aspect ratio, centered
      initializeCropBox(img.width, img.height)
    }
    img.onerror = () => {
      setError(`Failed to load image: ${imageUrl}`)
    }
    img.src = imageUrl
  }, [imageUrl])

  // Initialize crop box with correct aspect ratio
  const initializeCropBox = (imgWidth: number, imgHeight: number) => {
    const targetRatio = assetType.aspectRatio

    let cropWidth: number
    let cropHeight: number

    // Calculate largest crop box that fits with correct aspect ratio
    if (imgWidth / imgHeight > targetRatio) {
      // Image is wider than target ratio - constrain by height
      cropHeight = imgHeight
      cropWidth = cropHeight * targetRatio
    } else {
      // Image is taller than target ratio - constrain by width
      cropWidth = imgWidth
      cropHeight = cropWidth / targetRatio
    }

    // Center the crop box
    const x = (imgWidth - cropWidth) / 2
    const y = (imgHeight - cropHeight) / 2

    setCropBox({ x, y, width: cropWidth, height: cropHeight })
    validateCrop({ x, y, width: cropWidth, height: cropHeight })
  }

  // Validate current crop against asset type requirements
  const validateCrop = (box: CropBox) => {
    const validation = validateImageDimensions(
      Math.round(box.width),
      Math.round(box.height),
      assetType
    )
    setValidationErrors(validation.errors)
  }

  // Convert screen coordinates to image coordinates
  const screenToImage = (clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!containerRef.current || !imageDimensions) return null
    const rect = containerRef.current.getBoundingClientRect()
    const scaleX = imageDimensions.width / rect.width
    const scaleY = imageDimensions.height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent, mode: DragMode) => {
    e.preventDefault()
    e.stopPropagation()
    if (!cropBox) return

    const pos = screenToImage(e.clientX, e.clientY)
    if (!pos) return

    setDragMode(mode)
    setDragStart({ x: pos.x, y: pos.y, box: { ...cropBox } })
  }, [cropBox, imageDimensions])

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragMode || !dragStart || !imageDimensions || !cropBox) return

    const pos = screenToImage(e.clientX, e.clientY)
    if (!pos) return

    const dx = pos.x - dragStart.x
    const dy = pos.y - dragStart.y
    const startBox = dragStart.box

    let newBox: CropBox

    if (dragMode === 'move') {
      // Move the crop box
      let newX = startBox.x + dx
      let newY = startBox.y + dy

      // Constrain to image bounds
      newX = Math.max(0, Math.min(imageDimensions.width - startBox.width, newX))
      newY = Math.max(0, Math.min(imageDimensions.height - startBox.height, newY))

      newBox = { ...startBox, x: newX, y: newY }
    } else {
      // Resize - maintain aspect ratio
      newBox = resizeWithAspectRatio(startBox, dx, dy, dragMode)
    }

    setCropBox(newBox)
    validateCrop(newBox)
  }, [dragMode, dragStart, imageDimensions, cropBox])

  // Resize maintaining aspect ratio
  const resizeWithAspectRatio = (
    startBox: CropBox,
    dx: number,
    dy: number,
    corner: DragMode
  ): CropBox => {
    if (!imageDimensions) return startBox

    const ratio = assetType.aspectRatio
    let newWidth = startBox.width
    let newHeight = startBox.height
    let newX = startBox.x
    let newY = startBox.y

    // Determine primary axis based on which direction moved more
    const useDx = Math.abs(dx) > Math.abs(dy)

    switch (corner) {
      case 'resize-se':
        if (useDx) {
          newWidth = Math.max(50, startBox.width + dx)
          newHeight = newWidth / ratio
        } else {
          newHeight = Math.max(50, startBox.height + dy)
          newWidth = newHeight * ratio
        }
        break
      case 'resize-sw':
        if (useDx) {
          newWidth = Math.max(50, startBox.width - dx)
          newHeight = newWidth / ratio
          newX = startBox.x + startBox.width - newWidth
        } else {
          newHeight = Math.max(50, startBox.height + dy)
          newWidth = newHeight * ratio
          newX = startBox.x + startBox.width - newWidth
        }
        break
      case 'resize-ne':
        if (useDx) {
          newWidth = Math.max(50, startBox.width + dx)
          newHeight = newWidth / ratio
          newY = startBox.y + startBox.height - newHeight
        } else {
          newHeight = Math.max(50, startBox.height - dy)
          newWidth = newHeight * ratio
          newY = startBox.y + startBox.height - newHeight
        }
        break
      case 'resize-nw':
        if (useDx) {
          newWidth = Math.max(50, startBox.width - dx)
          newHeight = newWidth / ratio
          newX = startBox.x + startBox.width - newWidth
          newY = startBox.y + startBox.height - newHeight
        } else {
          newHeight = Math.max(50, startBox.height - dy)
          newWidth = newHeight * ratio
          newX = startBox.x + startBox.width - newWidth
          newY = startBox.y + startBox.height - newHeight
        }
        break
    }

    // Constrain to image bounds
    if (newX < 0) {
      newWidth += newX
      newHeight = newWidth / ratio
      newX = 0
    }
    if (newY < 0) {
      newHeight += newY
      newWidth = newHeight * ratio
      newY = 0
    }
    if (newX + newWidth > imageDimensions.width) {
      newWidth = imageDimensions.width - newX
      newHeight = newWidth / ratio
    }
    if (newY + newHeight > imageDimensions.height) {
      newHeight = imageDimensions.height - newY
      newWidth = newHeight * ratio
    }

    return { x: newX, y: newY, width: newWidth, height: newHeight }
  }

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragMode(null)
    setDragStart(null)
  }, [])

  // Zoom controls
  const adjustSize = (delta: number) => {
    if (!cropBox || !imageDimensions) return

    const ratio = assetType.aspectRatio
    let newWidth = cropBox.width + delta
    let newHeight = newWidth / ratio

    // Constrain to minimum and image bounds
    const maxWidth = Math.min(imageDimensions.width, imageDimensions.height * ratio)
    const maxHeight = maxWidth / ratio

    newWidth = Math.max(assetType.minWidth, Math.min(maxWidth, newWidth))
    newHeight = newWidth / ratio

    // Keep centered relative to current position
    const deltaW = newWidth - cropBox.width
    const deltaH = newHeight - cropBox.height
    let newX = cropBox.x - deltaW / 2
    let newY = cropBox.y - deltaH / 2

    // Constrain to bounds
    newX = Math.max(0, Math.min(imageDimensions.width - newWidth, newX))
    newY = Math.max(0, Math.min(imageDimensions.height - newHeight, newY))

    const newBox = { x: newX, y: newY, width: newWidth, height: newHeight }
    setCropBox(newBox)
    validateCrop(newBox)
  }

  // Reset to max size
  const resetCrop = () => {
    if (!imageDimensions) return
    initializeCropBox(imageDimensions.width, imageDimensions.height)
  }

  // Handle save
  const handleSave = async () => {
    if (!cropBox || validationErrors.length > 0) return

    setSaving(true)
    setError(null)

    try {
      await onSave({
        x: Math.round(cropBox.x),
        y: Math.round(cropBox.y),
        width: Math.round(cropBox.width),
        height: Math.round(cropBox.height),
        outputWidth: assetType.recommendedWidth,
        outputHeight: assetType.recommendedHeight,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Loading/error states
  if (error && !imageDimensions) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border-2 border-red-500/50 p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <span>{error}</span>
          </div>
          <button onClick={onCancel} className="mt-4 px-4 py-2 bg-zinc-700 text-white w-full">
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!imageDimensions || !cropBox) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-zinc-400">Loading image...</div>
      </div>
    )
  }

  // Calculate display dimensions (fit in viewport)
  const maxDisplayWidth = Math.min(800, window.innerWidth - 100)
  const maxDisplayHeight = Math.min(600, window.innerHeight - 300)
  const displayScale = Math.min(
    maxDisplayWidth / imageDimensions.width,
    maxDisplayHeight / imageDimensions.height,
    1
  )
  const displayWidth = imageDimensions.width * displayScale
  const displayHeight = imageDimensions.height * displayScale

  // Crop box in display coordinates
  const displayCrop = {
    x: cropBox.x * displayScale,
    y: cropBox.y * displayScale,
    width: cropBox.width * displayScale,
    height: cropBox.height * displayScale,
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-zinc-700 max-w-4xl w-full max-h-[95vh] overflow-auto">
        {/* Header */}
        <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-orange-500 flex items-center gap-2">
              <Maximize2 className="w-5 h-5" />
              Crop {assetType.name}
            </h2>
            <p className="text-xs text-zinc-500">
              {entityName ? `${entityName} • ` : ''}
              Required: {assetType.aspectRatioLabel} ({assetType.recommendedWidth}×{assetType.recommendedHeight}px)
            </p>
          </div>
          <button onClick={onCancel} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4">
          {/* Validation warnings */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded">
              <div className="flex items-start gap-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Validation Issues:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Image with crop overlay */}
          <div
            ref={containerRef}
            className="relative mx-auto cursor-crosshair select-none border border-zinc-700"
            style={{ width: displayWidth, height: displayHeight }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Source"
              className="w-full h-full"
              style={{ pointerEvents: "none", imageRendering: "pixelated" }}
              draggable={false}
            />

            {/* Darkened overlay outside crop */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `
                  inset ${displayCrop.x}px 0 0 0 rgba(0,0,0,0.7),
                  inset -${displayWidth - displayCrop.x - displayCrop.width}px 0 0 0 rgba(0,0,0,0.7),
                  inset 0 ${displayCrop.y}px 0 0 rgba(0,0,0,0.7),
                  inset 0 -${displayHeight - displayCrop.y - displayCrop.height}px 0 0 rgba(0,0,0,0.7)
                `
              }}
            />

            {/* Crop box */}
            <div
              className="absolute border-2 border-orange-500"
              style={{
                left: displayCrop.x,
                top: displayCrop.y,
                width: displayCrop.width,
                height: displayCrop.height,
              }}
            >
              {/* Move handle (center) */}
              <div
                className="absolute inset-0 cursor-move"
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-orange-500/30" />
                  ))}
                </div>
              </div>

              {/* Corner resize handles */}
              {['nw', 'ne', 'sw', 'se'].map((corner) => (
                <div
                  key={corner}
                  className={`absolute w-4 h-4 bg-orange-500 border-2 border-white cursor-${corner}-resize`}
                  style={{
                    ...(corner.includes('n') ? { top: -8 } : { bottom: -8 }),
                    ...(corner.includes('w') ? { left: -8 } : { right: -8 }),
                  }}
                  onMouseDown={(e) => handleMouseDown(e, `resize-${corner}` as DragMode)}
                />
              ))}

              {/* Dimensions overlay */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 text-xs text-white font-mono whitespace-nowrap">
                {Math.round(cropBox.width)} × {Math.round(cropBox.height)}px
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => adjustSize(-30)}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              title="Smaller crop area"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <div className="text-sm text-zinc-400 font-mono w-32 text-center">
              {Math.round(cropBox.width)}×{Math.round(cropBox.height)}
            </div>
            <button
              onClick={() => adjustSize(30)}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              title="Larger crop area"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={resetCrop}
              className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ml-2"
              title="Reset to maximum size"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          <div className="mt-6 pt-4 border-t border-zinc-700">
            <p className="text-xs text-zinc-500 mb-2 text-center">Output Preview ({assetType.recommendedWidth}×{assetType.recommendedHeight}px):</p>
            <div className="flex justify-center">
              <div
                className="bg-zinc-800 border border-zinc-600 overflow-hidden"
                style={{
                  width: Math.min(200, assetType.recommendedWidth),
                  height: Math.min(200, assetType.recommendedHeight),
                }}
              >
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    imageRendering: "pixelated",
                    width: (imageDimensions.width / cropBox.width) * Math.min(200, assetType.recommendedWidth),
                    height: (imageDimensions.height / cropBox.height) * Math.min(200, assetType.recommendedHeight),
                    marginLeft: -(cropBox.x / cropBox.width) * Math.min(200, assetType.recommendedWidth),
                    marginTop: -(cropBox.y / cropBox.height) * Math.min(200, assetType.recommendedHeight),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Source: {imageDimensions.width}×{imageDimensions.height}px →
            Output: {assetType.recommendedWidth}×{assetType.recommendedHeight}px
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
              disabled={saving || validationErrors.length > 0}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-display text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
