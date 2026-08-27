import { SupabaseClient } from '@supabase/supabase-js';

export type ImageType = 'avatar' | 'banner';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a battler image to Supabase Storage
 * @param supabase - Supabase client instance
 * @param battlerId - ID of the battler
 * @param file - File to upload
 * @param type - Type of image (avatar or banner)
 * @returns Upload result with URL or error
 */
export async function uploadBattlerImage(
  supabase: SupabaseClient,
  battlerId: string,
  file: File,
  type: ImageType
): Promise<UploadResult> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
    };
  }

  // Validate file size
  const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB or 10MB
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return {
      success: false,
      error: `File too large. Maximum size is ${maxMB}MB.`
    };
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${battlerId}-${Date.now()}.${fileExt}`;
    const bucket = type === 'avatar' ? 'battler-avatars' : 'battler-banners';

    // Delete old image if exists
    const { data: existingBattler } = await supabase
      .from('battlers')
      .select(type === 'avatar' ? 'avatar_url' : 'banner_url')
      .eq('id', battlerId)
      .single();

    if (existingBattler) {
      const existingUrl = type === 'avatar'
        ? (existingBattler as any).avatar_url
        : (existingBattler as any).banner_url;

      if (existingUrl) {
        // Extract filename from URL and delete
        const urlParts = existingUrl.split('/');
        const oldFileName = urlParts[urlParts.length - 1];
        await supabase.storage.from(bucket).remove([oldFileName]);
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Failed to upload image.' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Update battler record
    const updateField = type === 'avatar' ? 'avatar_url' : 'banner_url';
    const { error: updateError } = await supabase
      .from('battlers')
      .update({ [updateField]: publicUrl })
      .eq('id', battlerId);

    if (updateError) {
      console.error('Update error:', updateError);
      // Try to clean up uploaded file
      await supabase.storage.from(bucket).remove([fileName]);
      return { success: false, error: 'Failed to update battler record.' };
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Delete a battler image from Supabase Storage
 * @param supabase - Supabase client instance
 * @param battlerId - ID of the battler
 * @param imageUrl - URL of the image to delete
 * @param type - Type of image (avatar or banner)
 * @returns True if deletion was successful
 */
export async function deleteBattlerImage(
  supabase: SupabaseClient,
  battlerId: string,
  imageUrl: string,
  type: ImageType
): Promise<boolean> {
  try {
    const bucket = type === 'avatar' ? 'battler-avatars' : 'battler-banners';

    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return false;
    }

    // Update battler record
    const updateField = type === 'avatar' ? 'avatar_url' : 'banner_url';
    const { error: updateError } = await supabase
      .from('battlers')
      .update({ [updateField]: null })
      .eq('id', battlerId);

    return !updateError;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

/**
 * Get image dimensions from a file
 * @param file - File to measure
 * @returns Promise with width and height
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize image client-side using canvas
 * @param file - File to resize
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Promise with resized file
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<File> {
  try {
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');

    let { width, height } = img;

    // Calculate new dimensions while maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(img, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          resolve(new File([blob], file.name, { type: file.type }));
        },
        file.type,
        0.9 // Quality for JPEG
      );
    });
  } catch (error) {
    console.error('Resize error:', error);
    // If resize fails, return original file
    return file;
  }
}

/**
 * Generate initials from a name
 * @param name - Name to generate initials from
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get color for avatar based on tier
 * @param tier - Battler tier
 * @returns Tailwind color class
 */
export function getTierColor(tier: string): string {
  switch (tier) {
    case 'god':
      return 'bg-orange-500';
    case 'top':
      return 'bg-amber-500';
    case 'mid':
      return 'bg-blue-500';
    case 'low':
      return 'bg-zinc-600';
    default:
      return 'bg-zinc-500';
  }
}
