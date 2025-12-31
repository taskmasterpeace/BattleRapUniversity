"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  X, Check, Grid, Move, ZoomIn, ZoomOut, RotateCcw,
  AlertTriangle, Download, Eraser, Eye, EyeOff,
  ChevronLeft, ChevronRight, Pipette, Settings2
} from "lucide-react"
import { AssetType, ASSET_TYPES } from "@/lib/game/assetTypes"

export interface ExtractedSprite {
  dataUrl: string
  width: number
  height: number
  gridX: number
  gridY: number
}

interface SpriteSheetExtractorProps {
  onExtract: (sprite: ExtractedSprite, assetTypeId: string, filename: string) => void
  onClose: () => void
}

interface GridConfig {
  cols: number
  rows: number
  cellWidth: number
  cellHeight: number
  offsetX: number
  offsetY: number
  gapX: number
  gapY: number
}

type BackgroundMode = 'none' | 'chroma' | 'corner' | 'tolerance'

export function SpriteSheetExtractor({ onExtract, onClose }: SpriteSheetExtractorProps) {
  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>("")
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [processedImageData, setProcessedImageData] = useState<ImageData | null>(null)

  // Grid state
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    cols: 4,
    rows: 4,
    cellWidth: 128,
    cellHeight: 128,
    offsetX: 0,
    offsetY: 0,
    gapX: 0,
    gapY: 0,
  })

  // Selection state
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null)
  const [showGrid, setShowGrid] = useState(true)

  // Background removal state
  const [bgMode, setBgMode] = useState<BackgroundMode>('none')
  const [chromaColor, setChromaColor] = useState('#00ff00') // Green default
  const [colorTolerance, setColorTolerance] = useState(30)
  const [showOriginal, setShowOriginal] = useState(false)
  const [isPickingColor, setIsPickingColor] = useState(false)

  // Output state
  const [targetAssetType, setTargetAssetType] = useState<string>('crowd_member')
  const [outputFilename, setOutputFilename] = useState('')

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLPreviewElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Display scale for fitting in viewport
  const [displayScale, setDisplayScale] = useState(1)

  // Load image when URL changes
  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })

      // Create canvas and get image data
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, img.width, img.height)
      setImageData(data)
      setProcessedImageData(data)

      // Auto-detect grid size based on image dimensions
      const suggestedCellSize = Math.min(128, Math.floor(img.width / 4), Math.floor(img.height / 4))
      const cols = Math.floor(img.width / suggestedCellSize)
      const rows = Math.floor(img.height / suggestedCellSize)
      setGridConfig(prev => ({
        ...prev,
        cols,
        rows,
        cellWidth: Math.floor(img.width / cols),
        cellHeight: Math.floor(img.height / rows),
      }))

      // Calculate display scale
      const maxWidth = Math.min(700, window.innerWidth - 400)
      const maxHeight = Math.min(500, window.innerHeight - 350)
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
      setDisplayScale(scale)
    }
    img.src = imageUrl
  }, [imageUrl])

  // Process background removal when settings change
  useEffect(() => {
    if (!imageData || bgMode === 'none') {
      setProcessedImageData(imageData)
      return
    }

    const newData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    )

    const data = newData.data

    if (bgMode === 'chroma') {
      // Chroma key removal
      const r = parseInt(chromaColor.slice(1, 3), 16)
      const g = parseInt(chromaColor.slice(3, 5), 16)
      const b = parseInt(chromaColor.slice(5, 7), 16)

      for (let i = 0; i < data.length; i += 4) {
        const dr = Math.abs(data[i] - r)
        const dg = Math.abs(data[i + 1] - g)
        const db = Math.abs(data[i + 2] - b)
        const diff = Math.sqrt(dr * dr + dg * dg + db * db)

        if (diff < colorTolerance) {
          // Make transparent
          data[i + 3] = 0
        } else if (diff < colorTolerance * 1.5) {
          // Feather edges
          data[i + 3] = Math.round((diff - colorTolerance) / (colorTolerance * 0.5) * 255)
        }
      }
    } else if (bgMode === 'corner') {
      // Sample corners for background color
      const corners = [
        [0, 0],
        [imageData.width - 1, 0],
        [0, imageData.height - 1],
        [imageData.width - 1, imageData.height - 1]
      ]

      // Get average corner color
      let tr = 0, tg = 0, tb = 0
      corners.forEach(([x, y]) => {
        const idx = (y * imageData.width + x) * 4
        tr += data[idx]
        tg += data[idx + 1]
        tb += data[idx + 2]
      })
      const bgR = tr / 4
      const bgG = tg / 4
      const bgB = tb / 4

      for (let i = 0; i < data.length; i += 4) {
        const dr = Math.abs(data[i] - bgR)
        const dg = Math.abs(data[i + 1] - bgG)
        const db = Math.abs(data[i + 2] - bgB)
        const diff = Math.sqrt(dr * dr + dg * dg + db * db)

        if (diff < colorTolerance) {
          data[i + 3] = 0
        } else if (diff < colorTolerance * 1.5) {
          data[i + 3] = Math.round((diff - colorTolerance) / (colorTolerance * 0.5) * 255)
        }
      }
    } else if (bgMode === 'tolerance') {
      // Simple white/near-white removal
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
        if (brightness > 255 - colorTolerance) {
          data[i + 3] = 0
        }
      }
    }

    setProcessedImageData(newData)
  }, [imageData, bgMode, chromaColor, colorTolerance])

  // Render canvas
  useEffect(() => {
    if (!canvasRef.current || !processedImageData || !imageDimensions) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw checkerboard pattern for transparency
    const checkSize = 8
    for (let y = 0; y < canvas.height; y += checkSize) {
      for (let x = 0; x < canvas.width; x += checkSize) {
        ctx.fillStyle = ((x + y) / checkSize) % 2 === 0 ? '#333' : '#444'
        ctx.fillRect(x, y, checkSize, checkSize)
      }
    }

    // Draw image
    const imgToDraw = showOriginal && imageData ? imageData : processedImageData
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = imgToDraw.width
    tempCanvas.height = imgToDraw.height
    tempCanvas.getContext('2d')!.putImageData(imgToDraw, 0, 0)

    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)'
      ctx.lineWidth = 1

      const { cols, rows, cellWidth, cellHeight, offsetX, offsetY, gapX, gapY } = gridConfig
      const scaleX = canvas.width / imageDimensions.width
      const scaleY = canvas.height / imageDimensions.height

      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          const x = (offsetX + col * (cellWidth + gapX)) * scaleX
          const y = (offsetY + row * (cellHeight + gapY)) * scaleY
          const w = cellWidth * scaleX
          const h = cellHeight * scaleY

          if (col < cols && row < rows) {
            // Cell background
            if (selectedCell?.x === col && selectedCell?.y === row) {
              ctx.fillStyle = 'rgba(255, 165, 0, 0.3)'
              ctx.fillRect(x, y, w, h)
              ctx.strokeStyle = 'rgba(255, 165, 0, 1)'
              ctx.lineWidth = 3
              ctx.strokeRect(x, y, w, h)
              ctx.lineWidth = 1
              ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)'
            } else {
              ctx.strokeRect(x, y, w, h)
            }
          }
        }
      }
    }
  }, [processedImageData, imageData, imageDimensions, showGrid, gridConfig, selectedCell, showOriginal, displayScale])

  // Handle file input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageName(file.name)
    setOutputFilename(file.name.replace(/\.[^/.]+$/, ''))

    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(reader.result as string)
      setSelectedCell(null)
    }
    reader.readAsDataURL(file)
  }

  // Handle canvas click for cell selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageDimensions || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert to image coordinates
    const imgX = x / displayScale
    const imgY = y / displayScale

    // Handle color picking
    if (isPickingColor && imageData) {
      const pixelX = Math.floor(imgX)
      const pixelY = Math.floor(imgY)
      const idx = (pixelY * imageData.width + pixelX) * 4
      const r = imageData.data[idx]
      const g = imageData.data[idx + 1]
      const b = imageData.data[idx + 2]
      setChromaColor(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
      setIsPickingColor(false)
      return
    }

    // Find which cell was clicked
    const { cols, rows, cellWidth, cellHeight, offsetX, offsetY, gapX, gapY } = gridConfig

    const col = Math.floor((imgX - offsetX) / (cellWidth + gapX))
    const row = Math.floor((imgY - offsetY) / (cellHeight + gapY))

    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      setSelectedCell({ x: col, y: row })
    }
  }

  // Extract selected sprite
  const extractSprite = () => {
    if (!selectedCell || !processedImageData || !imageDimensions) return null

    const { cellWidth, cellHeight, offsetX, offsetY, gapX, gapY } = gridConfig
    const startX = offsetX + selectedCell.x * (cellWidth + gapX)
    const startY = offsetY + selectedCell.y * (cellHeight + gapY)

    // Create canvas for extracted sprite
    const canvas = document.createElement('canvas')
    canvas.width = cellWidth
    canvas.height = cellHeight
    const ctx = canvas.getContext('2d')!

    // Draw the section from processed image
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = processedImageData.width
    tempCanvas.height = processedImageData.height
    tempCanvas.getContext('2d')!.putImageData(processedImageData, 0, 0)

    ctx.drawImage(tempCanvas, startX, startY, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight)

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: cellWidth,
      height: cellHeight,
      gridX: selectedCell.x,
      gridY: selectedCell.y,
    }
  }

  // Handle extract button
  const handleExtract = () => {
    const sprite = extractSprite()
    if (!sprite) return

    const filename = outputFilename || `sprite_${selectedCell!.x}_${selectedCell!.y}`
    onExtract(sprite, targetAssetType, filename)
  }

  // Grid config update helper
  const updateGridConfig = (key: keyof GridConfig, value: number) => {
    setGridConfig(prev => ({ ...prev, [key]: value }))
  }

  const assetType = ASSET_TYPES[targetAssetType]

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-zinc-700 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-700 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-display font-bold text-orange-500 flex items-center gap-2">
              <Grid className="w-5 h-5" />
              SPRITE SHEET EXTRACTOR
            </h2>
            <p className="text-xs text-zinc-500">
              Load a sprite sheet, remove background, select individual sprites
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Canvas */}
          <div className="flex-1 p-4 overflow-auto" ref={containerRef}>
            {!imageUrl ? (
              <div className="h-full flex items-center justify-center">
                <div
                  className="border-2 border-dashed border-zinc-600 hover:border-orange-500 p-12 text-center cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Grid className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                  <p className="text-zinc-400 font-display">Click to load sprite sheet</p>
                  <p className="text-xs text-zinc-600 mt-2">PNG, JPG, or WebP</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Canvas */}
                <div className="border border-zinc-700 inline-block">
                  <canvas
                    ref={canvasRef}
                    width={(imageDimensions?.width || 400) * displayScale}
                    height={(imageDimensions?.height || 400) * displayScale}
                    onClick={handleCanvasClick}
                    className={`${isPickingColor ? 'cursor-crosshair' : 'cursor-pointer'}`}
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                {/* Canvas Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-700"
                  >
                    Load New
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-3 py-1 border text-sm ${showGrid ? 'bg-orange-600 border-orange-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                  >
                    <Grid className="w-4 h-4 inline mr-1" />
                    Grid
                  </button>

                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className={`px-3 py-1 border text-sm ${showOriginal ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                  >
                    {showOriginal ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                    Original
                  </button>

                  <div className="ml-auto text-xs text-zinc-500">
                    {imageName && <span>{imageName} - </span>}
                    {imageDimensions && <span>{imageDimensions.width}x{imageDimensions.height}px</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Settings */}
          <div className="w-80 border-l border-zinc-700 p-4 overflow-y-auto flex-shrink-0">
            {/* Grid Settings */}
            <div className="mb-6">
              <h3 className="text-sm font-display font-bold text-zinc-300 mb-3 flex items-center gap-2">
                <Grid className="w-4 h-4" />
                GRID SETTINGS
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Columns</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={gridConfig.cols}
                    onChange={(e) => updateGridConfig('cols', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={gridConfig.rows}
                    onChange={(e) => updateGridConfig('rows', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Cell Width</label>
                  <input
                    type="number"
                    min={16}
                    max={512}
                    value={gridConfig.cellWidth}
                    onChange={(e) => updateGridConfig('cellWidth', parseInt(e.target.value) || 64)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Cell Height</label>
                  <input
                    type="number"
                    min={16}
                    max={512}
                    value={gridConfig.cellHeight}
                    onChange={(e) => updateGridConfig('cellHeight', parseInt(e.target.value) || 64)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Offset X</label>
                  <input
                    type="number"
                    min={0}
                    value={gridConfig.offsetX}
                    onChange={(e) => updateGridConfig('offsetX', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Offset Y</label>
                  <input
                    type="number"
                    min={0}
                    value={gridConfig.offsetY}
                    onChange={(e) => updateGridConfig('offsetY', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Gap X</label>
                  <input
                    type="number"
                    min={0}
                    value={gridConfig.gapX}
                    onChange={(e) => updateGridConfig('gapX', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Gap Y</label>
                  <input
                    type="number"
                    min={0}
                    value={gridConfig.gapY}
                    onChange={(e) => updateGridConfig('gapY', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Background Removal */}
            <div className="mb-6">
              <h3 className="text-sm font-display font-bold text-zinc-300 mb-3 flex items-center gap-2">
                <Eraser className="w-4 h-4" />
                BACKGROUND REMOVAL
              </h3>

              <div className="space-y-3">
                <div className="flex gap-1">
                  {(['none', 'chroma', 'corner', 'tolerance'] as BackgroundMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setBgMode(mode)}
                      className={`flex-1 px-2 py-1 text-xs uppercase ${
                        bgMode === mode
                          ? 'bg-orange-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {mode === 'none' ? 'Off' : mode}
                    </button>
                  ))}
                </div>

                {bgMode === 'chroma' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-500">Color:</label>
                      <input
                        type="color"
                        value={chromaColor}
                        onChange={(e) => setChromaColor(e.target.value)}
                        className="w-8 h-6 border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={chromaColor}
                        onChange={(e) => setChromaColor(e.target.value)}
                        className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-xs"
                      />
                      <button
                        onClick={() => setIsPickingColor(true)}
                        className={`p-1 border ${isPickingColor ? 'bg-orange-600 border-orange-500' : 'bg-zinc-800 border-zinc-700'}`}
                        title="Pick color from image"
                      >
                        <Pipette className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {bgMode !== 'none' && (
                  <div>
                    <label className="text-xs text-zinc-500 flex justify-between">
                      <span>Tolerance:</span>
                      <span>{colorTolerance}</span>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={colorTolerance}
                      onChange={(e) => setColorTolerance(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Output Settings */}
            <div className="mb-6">
              <h3 className="text-sm font-display font-bold text-zinc-300 mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                OUTPUT SETTINGS
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Asset Type</label>
                  <select
                    value={targetAssetType}
                    onChange={(e) => setTargetAssetType(e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  >
                    {Object.entries(ASSET_TYPES).map(([id, type]) => (
                      <option key={id} value={id}>
                        {type.name} ({type.aspectRatioLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Filename</label>
                  <input
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    placeholder="sprite_name"
                    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>

                {assetType && (
                  <div className="text-xs text-zinc-500 bg-zinc-800/50 p-2 border border-zinc-700">
                    <div>Target: {assetType.recommendedWidth}x{assetType.recommendedHeight}px</div>
                    <div>Ratio: {assetType.aspectRatioLabel}</div>
                    <div>Folder: {assetType.folder}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            {selectedCell && (
              <div className="mb-6">
                <h3 className="text-sm font-display font-bold text-zinc-300 mb-3">
                  SELECTION PREVIEW
                </h3>
                <div className="bg-zinc-800 border border-zinc-700 p-2">
                  <div className="text-xs text-zinc-500 mb-2">
                    Cell [{selectedCell.x}, {selectedCell.y}] - {gridConfig.cellWidth}x{gridConfig.cellHeight}px
                  </div>
                  <div
                    className="bg-zinc-900 border border-zinc-600 mx-auto overflow-hidden"
                    style={{
                      width: Math.min(200, gridConfig.cellWidth),
                      height: Math.min(200, gridConfig.cellHeight),
                    }}
                  >
                    {(() => {
                      const sprite = extractSprite()
                      return sprite ? (
                        <img
                          src={sprite.dataUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : null
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Extract Button */}
            <button
              onClick={handleExtract}
              disabled={!selectedCell || !imageUrl}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-display font-bold uppercase flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              EXTRACT SPRITE
            </button>

            {!selectedCell && imageUrl && (
              <p className="text-xs text-amber-400 mt-2 text-center">
                Click on a grid cell to select
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
