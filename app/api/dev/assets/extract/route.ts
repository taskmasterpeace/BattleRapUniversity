import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { ASSET_TYPES } from '@/lib/game/assetTypes'

interface ExtractRequest {
  dataUrl: string // Base64 encoded image data
  assetTypeId: string
  filename: string
  resize?: boolean // Whether to resize to recommended dimensions
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ExtractRequest
    const { dataUrl, assetTypeId, filename, resize = true } = body

    // Validate asset type
    const assetType = ASSET_TYPES[assetTypeId]
    if (!assetType) {
      return NextResponse.json({
        error: `Invalid asset type: ${assetTypeId}`,
        validTypes: Object.keys(ASSET_TYPES),
      }, { status: 400 })
    }

    // Validate data URL
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    // Extract base64 data
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Get image metadata
    const metadata = await sharp(buffer).metadata()

    // Process image
    let processedBuffer: Buffer

    if (resize) {
      // Resize to recommended dimensions using nearest neighbor for pixel art
      processedBuffer = await sharp(buffer)
        .resize(assetType.recommendedWidth, assetType.recommendedHeight, {
          fit: 'fill',
          kernel: 'nearest', // Preserve pixel art look
        })
        .png()
        .toBuffer()
    } else {
      // Just ensure PNG format
      processedBuffer = await sharp(buffer).png().toBuffer()
    }

    // Generate clean filename
    const cleanFilename = filename
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()

    // Determine output path
    const outputFilename = `${cleanFilename}.png`
    const outputDir = path.join(process.cwd(), 'public', 'sprites', assetType.folder)
    const outputPath = path.join(outputDir, outputFilename)

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true })

    // Check if file already exists
    let finalFilename = outputFilename
    let counter = 1
    while (true) {
      try {
        await fs.access(path.join(outputDir, finalFilename))
        // File exists, try with counter
        finalFilename = `${cleanFilename}_${counter}.png`
        counter++
      } catch {
        // File doesn't exist, we can use this name
        break
      }
    }

    const finalPath = path.join(outputDir, finalFilename)

    // Write the processed image
    await fs.writeFile(finalPath, processedBuffer)

    // Get final dimensions
    const finalMetadata = await sharp(processedBuffer).metadata()

    const publicUrl = `/sprites/${assetType.folder}/${finalFilename}`

    console.log(`[SPRITE EXTRACT] Saved ${assetType.name}: ${finalPath}`)
    console.log(`[SPRITE EXTRACT] Original: ${metadata.width}x${metadata.height} -> Output: ${finalMetadata.width}x${finalMetadata.height}`)

    return NextResponse.json({
      success: true,
      message: `Sprite extracted and saved as ${assetType.name}`,
      assetType: assetTypeId,
      source: {
        width: metadata.width,
        height: metadata.height,
      },
      output: {
        path: publicUrl,
        filename: finalFilename,
        width: finalMetadata.width,
        height: finalMetadata.height,
        folder: assetType.folder,
      },
    })
  } catch (error) {
    console.error('[SPRITE EXTRACT] Error:', error)
    return NextResponse.json({
      error: 'Failed to extract sprite',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
