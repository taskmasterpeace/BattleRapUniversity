import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { deleteBattlerImage } from '@/lib/services/imageUploadService';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated battler
    const { battler } = await getPlayerBattler();

    if (!battler) {
      return NextResponse.json(
        { error: 'Unauthorized. No battler found.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { imageUrl, type } = body;

    // Validate inputs
    if (!imageUrl || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: imageUrl and type' },
        { status: 400 }
      );
    }

    if (!['avatar', 'banner'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Must be "avatar" or "banner".' },
        { status: 400 }
      );
    }

    // Delete image
    const supabase = await createServerSupabaseClient();
    const success = await deleteBattlerImage(supabase, battler.id, imageUrl, type);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
