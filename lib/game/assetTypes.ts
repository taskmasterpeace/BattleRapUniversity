/**
 * Asset Types Configuration
 *
 * PIXEL ART GAME - All dimensions optimized for retro pixel art style.
 * Using smaller sizes that maintain crisp pixels when scaled.
 */

export interface AssetType {
  id: string;
  name: string;
  description: string;
  aspectRatio: number; // width / height (e.g., 1.0 for square, 1.78 for 16:9)
  aspectRatioLabel: string; // Human readable like "1:1" or "16:9"
  minWidth: number;
  minHeight: number;
  recommendedWidth: number;
  recommendedHeight: number;
  outputFormat: 'png' | 'jpg' | 'webp';
  folder: string; // Where to save in public/sprites/
  databaseField?: string | null; // Which DB field references this
  usedIn: string[]; // Where in the game this is displayed
}

export const ASSET_TYPES: Record<string, AssetType> = {
  // ============================================
  // BATTLER ASSETS (1:1 Square)
  // ============================================
  battler_portrait: {
    id: 'battler_portrait',
    name: 'Battler Portrait',
    description: 'Square portrait for battle cards, roster, and profile displays',
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 64,
    minHeight: 64,
    recommendedWidth: 256,
    recommendedHeight: 256,
    outputFormat: 'png',
    folder: 'characters',
    databaseField: 'avatar_url',
    usedIn: ['Battle cards', 'Roster list', 'Battler profile', 'Matchup screens', 'News articles'],
  },

  battler_full_body: {
    id: 'battler_full_body',
    name: 'Battler Full Body',
    description: 'Taller sprite showing full body for battle stage display',
    aspectRatio: 0.67, // 2:3 portrait
    aspectRatioLabel: '2:3',
    minWidth: 128,
    minHeight: 192,
    recommendedWidth: 256,
    recommendedHeight: 384,
    outputFormat: 'png',
    folder: 'characters/full',
    databaseField: 'full_body_url',
    usedIn: ['Battle stage (future)', 'Character select'],
  },

  // ============================================
  // LOCATION ASSETS (16:9 Widescreen)
  // ============================================
  city_background: {
    id: 'city_background',
    name: 'City Background',
    description: 'Wide city skyline for location cards and battle intros',
    aspectRatio: 1.78, // 16:9
    aspectRatioLabel: '16:9',
    minWidth: 256,
    minHeight: 144,
    recommendedWidth: 512,
    recommendedHeight: 288,
    outputFormat: 'png',
    folder: 'cities',
    databaseField: 'city_image_url',
    usedIn: ['Location select', 'Battle intro', 'League pages'],
  },

  city_thumbnail: {
    id: 'city_thumbnail',
    name: 'City Thumbnail',
    description: 'Square city thumbnail for compact displays',
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 64,
    minHeight: 64,
    recommendedWidth: 128,
    recommendedHeight: 128,
    outputFormat: 'png',
    folder: 'cities/thumbs',
    databaseField: 'city_thumb_url',
    usedIn: ['City dropdown', 'Compact lists'],
  },

  // ============================================
  // VENUE ASSETS (16:9 Widescreen)
  // ============================================
  venue_background: {
    id: 'venue_background',
    name: 'Venue Background',
    description: 'Wide venue interior for battle simulation display',
    aspectRatio: 1.78, // 16:9
    aspectRatioLabel: '16:9',
    minWidth: 256,
    minHeight: 144,
    recommendedWidth: 512,
    recommendedHeight: 288,
    outputFormat: 'png',
    folder: 'venues',
    databaseField: 'venue_image_url',
    usedIn: ['Battle simulation', 'Venue select'],
  },

  venue_thumbnail: {
    id: 'venue_thumbnail',
    name: 'Venue Thumbnail',
    description: 'Square venue thumbnail for lists',
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 64,
    minHeight: 64,
    recommendedWidth: 128,
    recommendedHeight: 128,
    outputFormat: 'png',
    folder: 'venues/thumbs',
    databaseField: 'venue_thumb_url',
    usedIn: ['Venue dropdown', 'Compact lists'],
  },

  // ============================================
  // ULTRAWIDE BACKGROUNDS (21:9)
  // ============================================
  ultrawide_background: {
    id: 'ultrawide_background',
    name: 'Ultrawide Background',
    description: 'Cinematic ultrawide for special scenes',
    aspectRatio: 2.33, // 21:9
    aspectRatioLabel: '21:9',
    minWidth: 336,
    minHeight: 144,
    recommendedWidth: 672,
    recommendedHeight: 288,
    outputFormat: 'png',
    folder: 'backgrounds/ultrawide',
    databaseField: null,
    usedIn: ['Cinematic scenes', 'Special events'],
  },

  // ============================================
  // CROWD ASSETS (1:1 Square)
  // ============================================
  crowd_member: {
    id: 'crowd_member',
    name: 'Crowd Member',
    description: 'Individual crowd member sprite for reactions',
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 48,
    minHeight: 48,
    recommendedWidth: 128,
    recommendedHeight: 128,
    outputFormat: 'png',
    folder: 'crowd',
    databaseField: null,
    usedIn: ['Battle simulation crowd'],
  },

  crowd_silhouette: {
    id: 'crowd_silhouette',
    name: 'Crowd Silhouette',
    description: 'Dark silhouette for background crowd layer',
    aspectRatio: 3.0, // Wide panoramic
    aspectRatioLabel: '3:1',
    minWidth: 384,
    minHeight: 128,
    recommendedWidth: 768,
    recommendedHeight: 256,
    outputFormat: 'png',
    folder: 'crowd/silhouettes',
    databaseField: null,
    usedIn: ['Battle simulation background layer'],
  },

  // ============================================
  // UI ASSETS (1:1 Square)
  // ============================================
  league_logo: {
    id: 'league_logo',
    name: 'League Logo',
    description: 'Square league logo/emblem',
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 32,
    minHeight: 32,
    recommendedWidth: 128,
    recommendedHeight: 128,
    outputFormat: 'png',
    folder: 'leagues',
    databaseField: 'logo_url',
    usedIn: ['League select', 'Battle cards', 'Standings'],
  },

  badge_icon: {
    id: 'badge_icon',
    name: 'Badge Icon',
    description: 'Square badge/achievement icon',
    aspectRatio: 1.0,
    aspectRatioLabel: '1:1',
    minWidth: 24,
    minHeight: 24,
    recommendedWidth: 64,
    recommendedHeight: 64,
    outputFormat: 'png',
    folder: 'badges',
    databaseField: 'icon_url',
    usedIn: ['Battler profiles', 'Badge unlock screens'],
  },
};

// Get all asset types as array
export const ASSET_TYPE_LIST = Object.values(ASSET_TYPES);

// Group by category
export const ASSET_CATEGORIES = {
  battler: ['battler_portrait', 'battler_full_body'],
  location: ['city_background', 'city_thumbnail'],
  venue: ['venue_background', 'venue_thumbnail'],
  background: ['ultrawide_background'],
  crowd: ['crowd_member', 'crowd_silhouette'],
  ui: ['league_logo', 'badge_icon'],
};

// Helper to get aspect ratio dimensions
export function getAspectRatioDimensions(aspectRatio: number, baseWidth: number): { width: number; height: number } {
  return {
    width: baseWidth,
    height: Math.round(baseWidth / aspectRatio),
  };
}

// Helper to validate image dimensions
export function validateImageDimensions(
  width: number,
  height: number,
  assetType: AssetType
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const actualRatio = width / height;
  const expectedRatio = assetType.aspectRatio;
  const ratioTolerance = 0.05; // 5% tolerance

  if (width < assetType.minWidth) {
    errors.push(`Width ${width}px is below minimum ${assetType.minWidth}px`);
  }

  if (height < assetType.minHeight) {
    errors.push(`Height ${height}px is below minimum ${assetType.minHeight}px`);
  }

  if (Math.abs(actualRatio - expectedRatio) > ratioTolerance) {
    errors.push(
      `Aspect ratio ${actualRatio.toFixed(2)} doesn't match required ${assetType.aspectRatioLabel} (${expectedRatio.toFixed(2)})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
