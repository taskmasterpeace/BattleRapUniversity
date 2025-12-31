import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { uploadBattlerImage } from '@/lib/services/imageUploadService';

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'avatar' | 'banner';

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!['avatar', 'banner'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Must be "avatar" or "banner".' },
        { status: 400 }
      );
    }

    // Upload image
    const supabase = await createServerSupabaseClient();
    const result = await uploadBattlerImage(supabase, battler.id, file, type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
