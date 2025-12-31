/**
 * Storyline Image System
 *
 * Provides placeholder images for storyline categories.
 * When real images are generated, update the image paths in the storyline JSON files.
 */

export type StorylineCategory =
  | 'family'
  | 'legal'
  | 'financial'
  | 'rivalry'
  | 'health'
  | 'career'
  | 'street'
  | 'crew'
  | 'romance'

const PLACEHOLDER_BASE = '/sprites/storylines'

/**
 * Get the placeholder image for a storyline category
 */
export function getStorylinePlaceholder(category: StorylineCategory): string {
  return `${PLACEHOLDER_BASE}/placeholder-${category}.svg`
}

/**
 * Get the image for a specific storyline chapter.
 * If no specific image is set, falls back to category placeholder.
 *
 * @param storylineCode - The storyline template code (e.g., "VIRAL_CHOKE")
 * @param chapterId - The chapter ID (e.g., "viral_ch1")
 * @param category - The storyline category
 * @param customImage - Optional custom image URL from chapter data
 */
export function getChapterImage(
  storylineCode: string,
  chapterId: string,
  category: StorylineCategory,
  customImage?: string
): string {
  // If a custom image is specified, use it
  if (customImage) {
    return customImage
  }

  // Check for a specific chapter image
  // Format: /sprites/storylines/[storyline_code]/[chapter_id].png
  const specificPath = `${PLACEHOLDER_BASE}/${storylineCode.toLowerCase()}/${chapterId}.png`

  // For now, return the category placeholder
  // When images are generated, they should be placed in the specific path
  return getStorylinePlaceholder(category)
}

/**
 * Get all expected image paths for a storyline template.
 * Useful for generating the image asset list.
 */
export function getStorylineImagePaths(
  storylineCode: string,
  chapterIds: string[],
  endingIds: string[]
): string[] {
  const basePath = `${PLACEHOLDER_BASE}/${storylineCode.toLowerCase()}`
  const paths: string[] = []

  // Cover/header image
  paths.push(`${basePath}/cover.png`)

  // Chapter images
  for (const chapterId of chapterIds) {
    paths.push(`${basePath}/${chapterId}.png`)
  }

  // Ending images
  for (const endingId of endingIds) {
    paths.push(`${basePath}/${endingId}.png`)
  }

  return paths
}

/**
 * Image requirements for each storyline (for documentation/generation)
 */
export interface StorylineImageRequirements {
  storylineCode: string
  storylineName: string
  category: StorylineCategory
  images: {
    id: string
    type: 'cover' | 'chapter' | 'ending'
    description: string
    suggestedPrompt: string
  }[]
}

/**
 * Generate a documentation entry for storyline image generation
 */
export function generateImageRequirements(
  storylineCode: string,
  storylineName: string,
  category: StorylineCategory,
  chapters: Array<{ id: string; title: string; description: string }>,
  endings: Array<{ id: string; title: string; description: string }>
): StorylineImageRequirements {
  return {
    storylineCode,
    storylineName,
    category,
    images: [
      {
        id: 'cover',
        type: 'cover',
        description: `Cover image for ${storylineName}`,
        suggestedPrompt: `Battle rap game comic book style, ${storylineName.toLowerCase()}, dramatic lighting, urban setting`
      },
      ...chapters.map(ch => ({
        id: ch.id,
        type: 'chapter' as const,
        description: ch.title,
        suggestedPrompt: `Battle rap game comic book style, scene depicting: ${ch.description.slice(0, 100)}...`
      })),
      ...endings.map(end => ({
        id: end.id,
        type: 'ending' as const,
        description: end.title,
        suggestedPrompt: `Battle rap game comic book style, ${end.title.toLowerCase()}, conclusion scene`
      }))
    ]
  }
}
