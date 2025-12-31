# OriginSelector Component

A React component for selecting a player's origin story during onboarding.

## Usage

```tsx
import OriginSelector from "@/components/onboarding/OriginSelector"
import type { OriginType } from "@/lib/types"

function OnboardingStep() {
  const [selectedOrigin, setSelectedOrigin] = useState<OriginType | null>(null)

  return (
    <OriginSelector
      selectedOrigin={selectedOrigin}
      onSelect={setSelectedOrigin}
      disabled={false}
    />
  )
}
```

## Props

- `selectedOrigin`: `OriginType | null` - Currently selected origin
- `onSelect`: `(origin: OriginType | null) => void` - Callback when origin is selected
- `disabled`: `boolean` (optional) - Whether the selector is disabled

## Origins

1. **Text Forums** (`text_forums`)
   - Writer archetype
   - +2 Lyricism, +1 Wordplay, +1 Creativity
   - -1 Stage Presence, -1 Delivery

2. **App/Camera** (`app_camera`)
   - Performer archetype
   - +2 Stage Presence, +1 Delivery, +1 Crowd Control
   - -1 Lyricism, -1 Wordplay

3. **Crew** (`crew`)
   - Street archetype
   - +1 Reputation, +1 Resilience, Crew assigned
   - -1 Financial Stability

4. **Skip** (`null`)
   - No bonuses or penalties
   - Start fresh in local leagues
