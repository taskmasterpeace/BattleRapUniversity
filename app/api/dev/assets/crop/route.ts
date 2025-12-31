import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { ASSET_TYPES, AssetType } from '@/lib/game/assetTypes'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface CropRequest {
  sourceUrl: string; // Can be URL or path in public/
  assetTypeId: string;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
    outputWidth: number;
    outputHeight: number;
  };
  // Optional: update database record
  updateRecord?: {
    table: string;
    id: string;
    field: string;
  };
  // Optional: custom output path
  outputPath?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CropRequest
    const { sourceUrl, assetTypeId, crop, updateRecord, outputPath } = body

    // Validate asset type
    const assetType = ASSET_TYPES[assetTypeId]
    if (!assetType) {
      return NextResponse.json({
        error: `Invalid asset type: ${assetTypeId}`,
        validTypes: Object.keys(ASSET_TYPES),
      }, { status: 400 })
    }

    // Validate crop parameters
    if (!crop || typeof crop.x !== 'number' || typeof crop.y !== 'number' ||
        typeof crop.width !== 'number' || typeof crop.height !== 'number') {
      return NextResponse.json({ error: 'Invalid crop parameters' }, { status: 400 })
    }

    // Get source file path
    let sourcePath: string
    if (sourceUrl.startsWith('http')) {
      // External URL - would need to download first (not implemented)
      return NextResponse.json({
        error: 'External URLs not supported yet. Use local paths starting with /',
      }, { status: 400 })
    } else {
      // Local path
      const relativePath = sourceUrl.startsWith('/') ? sourceUrl.slice(1) : sourceUrl
      sourcePath = path.join(process.cwd(), 'public', relativePath)
    }

    // Check if source file exists
    try {
      await fs.access(sourcePath)
    } catch {
      return NextResponse.json({ error: `Source file not found: ${sourcePath}` }, { status: 404 })
    }

    // Read the source image
    const sourceBuffer = await fs.readFile(sourcePath)
    const metadata = await sharp(sourceBuffer).metadata()

    // Validate crop bounds
    const cropX = Math.max(0, Math.round(crop.x))
    const cropY = Math.max(0, Math.round(crop.y))
    const cropWidth = Math.min(Math.round(crop.width), (metadata.width || 0) - cropX)
    const cropHeight = Math.min(Math.round(crop.height), (metadata.height || 0) - cropY)

    if (cropWidth <= 0 || cropHeight <= 0) {
      return NextResponse.json({ error: 'Invalid crop dimensions' }, { status: 400 })
    }

    // Perform the crop and resize to recommended dimensions
    const outputWidth = crop.outputWidth || assetType.recommendedWidth
    const outputHeight = crop.outputHeight || assetType.recommendedHeight

    const processedBuffer = await sharp(sourceBuffer)
      .extract({
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight,
      })
      .resize(outputWidth, outputHeight, {
        fit: 'fill', // Exact dimensions
        kernel: 'nearest', // Preserve pixel art look
      })
      .png()
      .toBuffer()

    // Determine output path
    let finalOutputPath: string
    let outputUrl: string

    if (outputPath) {
      // Custom output path
      const relPath = outputPath.startsWith('/') ? outputPath.slice(1) : outputPath
      finalOutputPath = path.join(process.cwd(), 'public', relPath)
      outputUrl = '/' + relPath
    } else {
      // Default: overwrite source
      finalOutputPath = sourcePath
      outputUrl = sourceUrl.startsWith('/') ? sourceUrl : '/' + sourceUrl
    }

    // Ensure output directory exists
    const outputDir = path.dirname(finalOutputPath)
    await fs.mkdir(outputDir, { recursive: true })

    // Write the processed image
    await fs.writeFile(finalOutputPath, processedBuffer)

    console.log(`[ASSET CROP] Processed ${assetType.name}: ${sourcePath}`)
    console.log(`[ASSET CROP] Original: ${metadata.width}x${metadata.height} -> Crop: ${cropWidth}x${cropHeight} -> Output: ${outputWidth}x${outputHeight}`)

    // Optionally update database record
    if (updateRecord) {
      const { table, id, field } = updateRecord
      const { error: updateError } = await supabase
        .from(table)
        .update({ [field]: outputUrl })
        .eq('id', id)

      if (updateError) {
        console.error('[ASSET CROP] DB update failed:', updateError)
        // Don't fail the whole request, just warn
      } else {
        console.log(`[ASSET CROP] Updated ${table}.${field} for id ${id}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${assetType.name} cropped successfully`,
      assetType: assetTypeId,
      source: {
        path: sourceUrl,
        width: metadata.width,
        height: metadata.height,
      },
      crop: {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
      },
      output: {
        path: outputUrl,
        width: outputWidth,
        height: outputHeight,
      },
    })
  } catch (error) {
    console.error('[ASSET CROP] Error:', error)
    return NextResponse.json({
      error: 'Failed to crop image',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// GET - Return asset type configurations
export async function GET() {
  return NextResponse.json({
    assetTypes: ASSET_TYPES,
    categories: {
      battler: ['battler_portrait', 'battler_full_body'],
      location: ['city_background', 'city_thumbnail'],
      venue: ['venue_background', 'venue_thumbnail'],
      crowd: ['crowd_member', 'crowd_silhouette'],
      ui: ['league_logo', 'badge_icon'],
    },
  })
}
