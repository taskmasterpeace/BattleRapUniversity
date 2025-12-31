import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const SPRITES_DIR = path.join(process.cwd(), 'public', 'sprites', 'cities')
const TARGET_SIZE = 512

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const cityPrefix = formData.get('cityPrefix') as string | null
    const variant = formData.get('variant') as string | null // optional: "night", "dusk", etc.
    const cropData = formData.get('crop') as string | null // optional: JSON {left, top, width, height}

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!cityPrefix) {
      return NextResponse.json({ error: 'No city prefix provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Get image metadata
    const metadata = await sharp(buffer).metadata()
    const { width, height } = metadata

    if (!width || !height) {
      return NextResponse.json({ error: 'Could not read image dimensions' }, { status: 400 })
    }

    // Process image
    let image = sharp(buffer)

    // Apply custom crop if provided
    if (cropData) {
      try {
        const crop = JSON.parse(cropData)
        image = image.extract({
          left: Math.round(crop.left),
          top: Math.round(crop.top),
          width: Math.round(crop.width),
          height: Math.round(crop.height)
        })
      } catch {
        return NextResponse.json({ error: 'Invalid crop data' }, { status: 400 })
      }
    } else {
      // Default: center crop to square
      const size = Math.min(width, height)
      const left = Math.floor((width - size) / 2)
      const top = Math.floor((height - size) / 2)
      image = image.extract({ left, top, width: size, height: size })
    }

    // Resize to target size (512x512)
    // Use nearest neighbor for pixel art preservation
    const processed = await image
      .resize(TARGET_SIZE, TARGET_SIZE, {
        kernel: sharp.kernel.nearest,
        fit: 'fill'
      })
      .png()
      .toBuffer()

    // Determine filename
    const sanitizedPrefix = cityPrefix.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    let filename: string

    if (variant) {
      const sanitizedVariant = variant.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      filename = `${sanitizedPrefix}-${sanitizedVariant}.png`
    } else {
      // Check if base file exists, if so create numbered variant
      const existingFiles = fs.readdirSync(SPRITES_DIR)
        .filter(f => f.startsWith(sanitizedPrefix) && f.endsWith('.png'))

      if (existingFiles.length === 0) {
        filename = `${sanitizedPrefix}.png`
      } else if (!existingFiles.includes(`${sanitizedPrefix}.png`)) {
        filename = `${sanitizedPrefix}.png`
      } else {
        // Find next available number
        let num = 2
        while (existingFiles.includes(`${sanitizedPrefix}-${num}.png`)) {
          num++
        }
        filename = `${sanitizedPrefix}-${num}.png`
      }
    }

    // Ensure sprites directory exists
    if (!fs.existsSync(SPRITES_DIR)) {
      fs.mkdirSync(SPRITES_DIR, { recursive: true })
    }

    // Save file
    const filePath = path.join(SPRITES_DIR, filename)
    await fs.promises.writeFile(filePath, processed)

    return NextResponse.json({
      success: true,
      filename,
      path: `/sprites/cities/${filename}`,
      size: `${TARGET_SIZE}x${TARGET_SIZE}`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
