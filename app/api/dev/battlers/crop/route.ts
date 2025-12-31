import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface CropBox {
  x: number
  y: number
  width: number
  height: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { battlerId, crop } = body as { battlerId: string; crop: CropBox }

    if (!battlerId) {
      return NextResponse.json({ error: 'battlerId is required' }, { status: 400 })
    }

    if (!crop || typeof crop.x !== 'number' || typeof crop.y !== 'number' ||
        typeof crop.width !== 'number' || typeof crop.height !== 'number') {
      return NextResponse.json({ error: 'Invalid crop parameters' }, { status: 400 })
    }

    // Get battler to find their avatar_url
    const { data: battler, error: fetchError } = await supabase
      .from('battlers')
      .select('id, stage_name, avatar_url')
      .eq('id', battlerId)
      .single()

    if (fetchError || !battler) {
      return NextResponse.json({ error: 'Battler not found' }, { status: 404 })
    }

    const avatarUrl = battler.avatar_url
    if (!avatarUrl) {
      return NextResponse.json({ error: 'Battler has no avatar_url set' }, { status: 400 })
    }

    // Convert URL path to file system path
    // Avatar URLs are like: /sprites/characters/image_xxx/sprite_xxx.png
    const relativePath = avatarUrl.startsWith('/') ? avatarUrl.slice(1) : avatarUrl
    const filePath = path.join(process.cwd(), 'public', relativePath)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: `File not found: ${filePath}` }, { status: 404 })
    }

    // Read the original image
    const originalBuffer = await fs.readFile(filePath)

    // Get image metadata to validate crop bounds
    const metadata = await sharp(originalBuffer).metadata()
    const imgWidth = metadata.width || 0
    const imgHeight = metadata.height || 0

    // Validate crop bounds
    const cropX = Math.max(0, Math.round(crop.x))
    const cropY = Math.max(0, Math.round(crop.y))
    const cropWidth = Math.min(crop.width, imgWidth - cropX)
    const cropHeight = Math.min(crop.height, imgHeight - cropY)

    if (cropWidth <= 0 || cropHeight <= 0) {
      return NextResponse.json({ error: 'Invalid crop dimensions' }, { status: 400 })
    }

    // Perform the crop using Sharp
    const croppedBuffer = await sharp(originalBuffer)
      .extract({
        left: cropX,
        top: cropY,
        width: Math.round(cropWidth),
        height: Math.round(cropHeight),
      })
      .png() // Ensure output is PNG
      .toBuffer()

    // Write the cropped image back to the same file (DESTRUCTIVE)
    await fs.writeFile(filePath, croppedBuffer)

    console.log(`[CROP] Destructively cropped ${battler.stage_name}'s avatar: ${filePath}`)
    console.log(`[CROP] Original: ${imgWidth}x${imgHeight} -> Cropped: ${cropWidth}x${cropHeight}`)

    return NextResponse.json({
      success: true,
      message: `Portrait cropped successfully`,
      battlerId,
      battlerName: battler.stage_name,
      originalSize: { width: imgWidth, height: imgHeight },
      croppedSize: { width: Math.round(cropWidth), height: Math.round(cropHeight) },
      filePath: avatarUrl,
    })
  } catch (error) {
    console.error('Crop error:', error)
    return NextResponse.json({
      error: 'Failed to crop image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
