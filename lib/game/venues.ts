/**
 * Venue System
 * Categorized battle venues with crowd configuration
 */

export type VenueCategory = 'underground' | 'small_room' | 'medium' | 'outdoor'

export interface Venue {
  id: string
  name: string
  category: VenueCategory
  sprite: string
  capacity: number
  crowdReactions: number // How many crowd member sprites to show (1-5)
  description: string
}

export const VENUE_CATEGORIES: Record<VenueCategory, { label: string; capacityRange: string; description: string }> = {
  underground: {
    label: 'Underground',
    capacityRange: '20-50',
    description: 'Gritty, raw, cheapest venues. Where legends start.'
  },
  small_room: {
    label: 'Small Room',
    capacityRange: '50-150',
    description: 'Grassroots, established venues. Real battle rap culture.'
  },
  medium: {
    label: 'Medium',
    capacityRange: '150-300',
    description: 'More production value. Growing audience.'
  },
  outdoor: {
    label: 'Outdoor',
    capacityRange: '100-200',
    description: 'Rooftops and streets. Open air energy.'
  }
}

export const VENUES: Venue[] = [
  // UNDERGROUND
  { id: 'warehouse_boxes', name: 'The Warehouse', category: 'underground', sprite: '/sprites/venues/underground/warehouse_boxes.png', capacity: 30, crowdReactions: 1, description: 'Dusty warehouse, cardboard boxes, raw energy' },
  { id: 'alley_night', name: 'Back Alley', category: 'underground', sprite: '/sprites/venues/underground/alley_night.png', capacity: 25, crowdReactions: 1, description: 'Fire escapes overhead, brick walls, street vibes' },
  { id: 'basement_graffiti', name: 'Graffiti Basement', category: 'underground', sprite: '/sprites/venues/underground/basement_graffiti.png', capacity: 40, crowdReactions: 1, description: 'Pipes, drums, tags on the walls' },
  { id: 'bunker', name: 'The Bunker', category: 'underground', sprite: '/sprites/venues/underground/bunker.png', capacity: 35, crowdReactions: 1, description: 'Concrete walls, fluorescent lights, no escape' },
  { id: 'subway', name: 'Subway Platform', category: 'underground', sprite: '/sprites/venues/underground/subway.png', capacity: 50, crowdReactions: 1, description: 'Train could come any minute. Pressure.' },
  { id: 'back_alley', name: 'The Block', category: 'underground', sprite: '/sprites/venues/underground/back_alley.png', capacity: 20, crowdReactions: 1, description: 'Trash cans, fire escape, keep it real' },
  { id: 'loading_dock', name: 'Loading Dock', category: 'underground', sprite: '/sprites/venues/underground/loading_dock.png', capacity: 45, crowdReactions: 1, description: 'Industrial loading bay, garage door backdrop' },

  // SMALL ROOM
  { id: 'community_center', name: 'Community Center', category: 'small_room', sprite: '/sprites/venues/small_room/community_center.png', capacity: 100, crowdReactions: 3, description: 'Banner hanging, trophy case, neighborhood pride' },
  { id: 'dive_bar', name: 'Dive Bar', category: 'small_room', sprite: '/sprites/venues/small_room/dive_bar.png', capacity: 80, crowdReactions: 3, description: 'Neon signs, bar stools, drinks flowing' },
  { id: 'sports_bar', name: 'Sports Bar', category: 'small_room', sprite: '/sprites/venues/small_room/sports_bar.png', capacity: 90, crowdReactions: 3, description: 'Dartboard, TVs, regulars watching' },
  { id: 'recording_studio', name: 'Recording Studio', category: 'small_room', sprite: '/sprites/venues/small_room/recording_studio.png', capacity: 60, crowdReactions: 3, description: 'Mixing board, acoustic panels, industry vibes' },
  { id: 'photo_studio', name: 'Photo Studio', category: 'small_room', sprite: '/sprites/venues/small_room/photo_studio.png', capacity: 70, crowdReactions: 3, description: 'Clean backdrop, professional setting' },
  { id: 'sound_booth', name: 'Sound Booth', category: 'small_room', sprite: '/sprites/venues/small_room/sound_booth.png', capacity: 40, crowdReactions: 3, description: 'Acoustic foam, intimate setting' },
  { id: 'record_store', name: 'Record Store', category: 'small_room', sprite: '/sprites/venues/small_room/record_store.png', capacity: 75, crowdReactions: 3, description: 'Vinyl on the walls, hip-hop culture' },
  { id: 'rec_hall', name: 'Rec Hall', category: 'small_room', sprite: '/sprites/venues/small_room/rec_hall.png', capacity: 120, crowdReactions: 3, description: 'Gymnasium floor, wooden stage' },
  { id: 'church_hall', name: 'Church Hall', category: 'small_room', sprite: '/sprites/venues/small_room/church_hall.png', capacity: 100, crowdReactions: 3, description: 'Gothic windows, sacred space turned battle ground' },

  // MEDIUM
  { id: 'basement_club', name: 'Basement Club', category: 'medium', sprite: '/sprites/venues/medium/basement_club.png', capacity: 200, crowdReactions: 5, description: 'Stage lights, exposed pipes, classic battle venue' },
  { id: 'neon_club', name: 'Neon Club', category: 'medium', sprite: '/sprites/venues/medium/neon_club.png', capacity: 250, crowdReactions: 5, description: 'Purple neon, stage platform, nightlife energy' },
  { id: 'cyberpunk_club', name: 'Cyber Club', category: 'medium', sprite: '/sprites/venues/medium/cyberpunk_club.png', capacity: 220, crowdReactions: 5, description: 'Futuristic neon, industrial pipes, underground rave' },
  { id: 'art_gallery', name: 'Art Gallery', category: 'medium', sprite: '/sprites/venues/medium/art_gallery.png', capacity: 180, crowdReactions: 5, description: 'Modern art, spotlight, upscale crowd' },
  { id: 'loft_gallery', name: 'Loft Gallery', category: 'medium', sprite: '/sprites/venues/medium/loft_gallery.png', capacity: 200, crowdReactions: 5, description: 'Brick wall spotlight, artsy venue' },
  { id: 'warehouse_clean', name: 'Warehouse Event', category: 'medium', sprite: '/sprites/venues/medium/warehouse_clean.png', capacity: 300, crowdReactions: 5, description: 'Cleaned up warehouse, crates for seating' },
  { id: 'industrial_venue', name: 'Industrial Venue', category: 'medium', sprite: '/sprites/venues/medium/industrial_venue.png', capacity: 280, crowdReactions: 5, description: 'Garage door backdrop, industrial chic' },
  { id: 'graffiti_club', name: 'Graffiti Club', category: 'medium', sprite: '/sprites/venues/medium/graffiti_club.png', capacity: 200, crowdReactions: 5, description: 'Stage spotlights, graffiti walls, iconic' },
  { id: 'basketball_gym', name: 'Basketball Gym', category: 'medium', sprite: '/sprites/venues/medium/basketball_gym.png', capacity: 350, crowdReactions: 5, description: 'Bleachers, court floor, school energy' },
  { id: 'graffiti_loft', name: 'Graffiti Loft', category: 'medium', sprite: '/sprites/venues/medium/graffiti_loft.png', capacity: 180, crowdReactions: 5, description: 'Big windows, natural light, tagged walls' },
  { id: 'modern_gallery', name: 'Modern Gallery', category: 'medium', sprite: '/sprites/venues/medium/modern_gallery.png', capacity: 160, crowdReactions: 5, description: 'Abstract art, white walls, sophisticated' },
  { id: 'brick_warehouse', name: 'Brick Warehouse', category: 'medium', sprite: '/sprites/venues/medium/brick_warehouse.png', capacity: 250, crowdReactions: 5, description: 'Brick walls, hanging lights, classic' },
  { id: 'event_tent', name: 'Event Tent', category: 'medium', sprite: '/sprites/venues/medium/event_tent.png', capacity: 400, crowdReactions: 5, description: 'Pop-up tent venue, festival vibes' },
  { id: 'empty_storefront', name: 'Empty Storefront', category: 'medium', sprite: '/sprites/venues/medium/empty_storefront.png', capacity: 150, crowdReactions: 5, description: 'Glass front, urban setting' },

  // OUTDOOR
  { id: 'rooftop_sunset', name: 'Sunset Rooftop', category: 'outdoor', sprite: '/sprites/venues/outdoor/rooftop_sunset.png', capacity: 150, crowdReactions: 3, description: 'City skyline, sunset colors, rooftop vibes' },
  { id: 'rooftop_night', name: 'Night Rooftop', category: 'outdoor', sprite: '/sprites/venues/outdoor/rooftop_night.png', capacity: 180, crowdReactions: 3, description: 'City lights, night sky, premium location' },
  { id: 'rooftop_day', name: 'Day Rooftop', category: 'outdoor', sprite: '/sprites/venues/outdoor/rooftop_day.png', capacity: 140, crowdReactions: 3, description: 'Daytime skyline, fresh air' },
  { id: 'rooftop_door', name: 'Rooftop Access', category: 'outdoor', sprite: '/sprites/venues/outdoor/rooftop_door.png', capacity: 120, crowdReactions: 3, description: 'Simple rooftop, building access visible' },
  { id: 'park_pavilion', name: 'Park Pavilion', category: 'outdoor', sprite: '/sprites/venues/outdoor/park_pavilion.png', capacity: 200, crowdReactions: 3, description: 'Sunset, trees, open air venue' },
  { id: 'alley_day', name: 'Daytime Alley', category: 'outdoor', sprite: '/sprites/venues/outdoor/alley_day.png', capacity: 60, crowdReactions: 3, description: 'Brick walls, daylight, street corner' },
  { id: 'street_night', name: 'Street Corner', category: 'outdoor', sprite: '/sprites/venues/outdoor/street_night.png', capacity: 80, crowdReactions: 3, description: 'Night time, street lamp, urban corner' },
  { id: 'bodega_corner', name: 'Bodega Corner', category: 'outdoor', sprite: '/sprites/venues/outdoor/bodega_corner.png', capacity: 70, crowdReactions: 3, description: 'NYC vibes, bodega in back, authentic' },
]

// Get venues by category
export function getVenuesByCategory(category: VenueCategory): Venue[] {
  return VENUES.filter(v => v.category === category)
}

// Get random venue from category
export function getRandomVenue(category?: VenueCategory): Venue {
  const venues = category ? getVenuesByCategory(category) : VENUES
  return venues[Math.floor(Math.random() * venues.length)]
}

// Get crowd silhouette based on energy level
export function getCrowdSilhouette(energyLevel: number): string {
  // energyLevel 0-100
  // Below 60 = calm, 60+ = hype
  return energyLevel >= 60
    ? '/sprites/crowd/silhouettes/crowd_hype.png'
    : '/sprites/crowd/silhouettes/crowd_calm.png'
}

// Map league to default venue category
export function getLeagueDefaultCategory(leagueName: string): VenueCategory {
  const name = leagueName.toLowerCase()
  if (name.includes('url') || name.includes('main stage')) return 'medium'
  if (name.includes('kotd')) return 'medium'
  if (name.includes('rbe')) return 'small_room'
  if (name.includes('small room') || name.includes('caffeine')) return 'small_room'
  if (name.includes('grind time')) return 'underground'
  return 'small_room' // Default
}
