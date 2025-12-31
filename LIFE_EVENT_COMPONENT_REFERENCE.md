# Life Event Component Reference Guide

Quick reference for using the enhanced Life Event components in the Algorithm Institute battle rap game.

## Component Quick Links

| Component | File | Purpose |
|-----------|------|---------|
| LifeEventResolutionClient | `components/battler/LifeEventResolutionClient.tsx` | Main event resolution screen with choices |
| EventOutcome | `components/lifeEvents/EventOutcome.tsx` | Post-resolution celebration modal |
| ImpactPreview | `components/lifeEvents/ImpactPreview.tsx` | Shows attribute changes preview |
| ConfirmationModal | `components/lifeEvents/ConfirmationModal.tsx` | Confirmation dialog for major events |
| LifeEventHistoryClient | `components/lifeEvents/LifeEventHistoryClient.tsx` | Event history with filters |
| EventStatistics | `components/lifeEvents/EventStatistics.tsx` | Statistics dashboard |

---

## LifeEventResolutionClient

**Location:** `components/battler/LifeEventResolutionClient.tsx`

### Props
```typescript
{
  event: any;      // Life event from database
  battler: any;    // Player's battler
}
```

### Features
- Animated choice cards
- Category/severity badges
- Effect previews
- Shake animation on invalid confirm
- Auto-redirect after resolution

### Usage
```tsx
<LifeEventResolutionClient
  event={event}
  battler={battler}
/>
```

---

## EventOutcome

**Location:** `components/lifeEvents/EventOutcome.tsx`

### Props
```typescript
{
  eventTitle: string;
  choice: 'a' | 'b';
  effects: any;
  category?: string;    // Default: 'career'
  onClose?: () => void;
}
```

### Features
- Full-screen modal
- Animated attribute changes
- Progress bars
- Category-themed styling
- Auto-counting effect

### Usage
```tsx
<EventOutcome
  eventTitle="Major Record Deal"
  choice="a"
  effects={{
    reputation: 2,
    financial_stability: 3,
    public_knowledge: 10
  }}
  category="financial"
  onClose={() => router.push('/dashboard')}
/>
```

### Animation Details
- Attributes count up/down over 500ms
- Stagger delay: 150ms between each attribute
- Ease-out timing function

---

## ImpactPreview

**Location:** `components/lifeEvents/ImpactPreview.tsx`

### Props
```typescript
{
  currentAttributes: any;
  effects: any;
  choiceLabel: string;
}
```

### Features
- Current → Projected display
- Visual progress bars
- Tier change detection
- Warning indicators

### Usage
```tsx
<ImpactPreview
  currentAttributes={battler.attributes}
  effects={template.choice_a_effects}
  choiceLabel="Choice A"
/>
```

### Tier Detection
- **Low:** 1-3 (red)
- **Mid:** 4-6 (yellow)
- **Top:** 7-9 (green)
- **God:** 10 (purple)

### Warnings
- `⚠ CRITICAL LOW` - Attribute drops to ≤3
- `⭐ GOD TIER REACHED` - Attribute reaches 10

---

## ConfirmationModal

**Location:** `components/lifeEvents/ConfirmationModal.tsx`

### Props
```typescript
{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  eventTitle: string;
  choiceText: string;
  effects: any;
  severity?: 'minor' | 'moderate' | 'major' | 'critical';
}
```

### Features
- Severity-based theming
- Effect summary
- Warning messages
- Go back option

### Usage
```tsx
const [showModal, setShowModal] = useState(false);

<ConfirmationModal
  isOpen={showModal}
  onConfirm={handleConfirm}
  onCancel={() => setShowModal(false)}
  eventTitle={event.template.title}
  choiceText={event.template.choice_a_text}
  effects={event.template.choice_a_effects}
  severity="major"
/>
```

### Severity Behavior
- **Critical:** Red theme, strong warning
- **Major:** Orange theme, moderate warning
- **Moderate:** Standard confirmation
- **Minor:** Typically skip modal

---

## LifeEventHistoryClient

**Location:** `components/lifeEvents/LifeEventHistoryClient.tsx`

### Props
```typescript
{
  events: LifeEvent[];
  battler: any;
}
```

### Features
- Category filtering
- Date sorting
- Search functionality
- Expandable details
- Stats summary

### Usage (Server Component)
```tsx
// app/life-events/history/page.tsx
const { data: events } = await supabase
  .from('battler_life_events')
  .select(`
    *,
    template:life_event_templates(*),
    battle:battles(
      id,
      scheduled_at,
      ai_battler:battler_ai_id(stage_name)
    )
  `)
  .eq('battler_id', battler.id)
  .eq('status', 'resolved')
  .order('resolved_at', { ascending: false });

return <LifeEventHistoryClient events={events || []} battler={battler} />;
```

### Filter Options
- All
- Career
- Personal
- Scandal
- Financial
- Relationship

### Sort Options
- Recent (default)
- Oldest

---

## EventStatistics

**Location:** `components/lifeEvents/EventStatistics.tsx`

### Props
```typescript
{
  events: LifeEvent[];  // Both pending and resolved
}
```

### Features
- Overview stats
- Category breakdown
- Most common events
- Biggest impact analysis
- Frequency timeline

### Usage
```tsx
const { data: allEvents } = await supabase
  .from('battler_life_events')
  .select(`
    *,
    template:life_event_templates(*)
  `)
  .eq('battler_id', battler.id);

<EventStatistics events={allEvents || []} />
```

### Metrics Calculated
- Total events
- Resolved count
- Pending count
- Last 30 days activity
- Category distribution
- Impact totals

---

## Event Categories

### Category Configuration
```typescript
const EVENT_CATEGORIES = {
  career: {
    icon: '💼',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30'
  },
  personal: {
    icon: '🏠',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30'
  },
  scandal: {
    icon: '📰',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30'
  },
  financial: {
    icon: '💰',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30'
  },
  relationship: {
    icon: '❤️',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30'
  }
};
```

---

## API Response Structure

### POST `/api/life-events/[id]/resolve`

**Request:**
```json
{
  "choice": "a" | "b"
}
```

**Response:**
```json
{
  "message": "Life event resolved successfully",
  "choice": "a",
  "effects": {
    "reputation": 2,
    "financial_stability": 1,
    "public_knowledge": 5
  },
  "eventTitle": "Record Deal Offer",
  "category": "financial",
  "outcome": {
    "attributeChanges": {
      "reputation": {
        "before": 5,
        "after": 7,
        "change": 2
      },
      "financial_stability": {
        "before": 3,
        "after": 4,
        "change": 1
      },
      "public_knowledge": {
        "before": 20,
        "after": 25,
        "change": 5
      }
    },
    "ratingBefore": 1500,
    "ratingAfter": 1500
  }
}
```

---

## Database Schema

### life_event_templates
```sql
CREATE TABLE life_event_templates (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_condition JSONB NOT NULL,
  choice_a_text TEXT NOT NULL,
  choice_a_effects JSONB NOT NULL,
  choice_b_text TEXT,
  choice_b_effects JSONB,

  -- New metadata fields
  category TEXT DEFAULT 'career'
    CHECK (category IN ('career', 'personal', 'scandal', 'financial', 'relationship')),
  severity TEXT DEFAULT 'moderate'
    CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  rarity TEXT DEFAULT 'common'
    CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  icon_emoji TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### battler_life_events
```sql
CREATE TABLE battler_life_events (
  id UUID PRIMARY KEY,
  battler_id UUID REFERENCES battlers(id),
  template_code TEXT REFERENCES life_event_templates(code),
  battle_id UUID REFERENCES battles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  chosen_option TEXT CHECK (chosen_option IN ('a', 'b')),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  details_json JSONB DEFAULT '{}'
);
```

---

## Common Patterns

### 1. Adding Impact Preview to Resolution Screen

```tsx
import ImpactPreview from '@/components/lifeEvents/ImpactPreview';

// In LifeEventResolutionClient, before choice cards:
{selectedChoice && (
  <ImpactPreview
    currentAttributes={battler.attributes}
    effects={
      selectedChoice === 'a'
        ? template.choice_a_effects
        : template.choice_b_effects
    }
    choiceLabel={`Choice ${selectedChoice.toUpperCase()}`}
  />
)}
```

### 2. Adding Confirmation Modal for Major Events

```tsx
import ConfirmationModal from '@/components/lifeEvents/ConfirmationModal';

const [showConfirm, setShowConfirm] = useState(false);

// In handleResolve:
const handleResolve = () => {
  if (!selectedChoice) {
    setShakeConfirm(true);
    return;
  }

  // Check severity
  if (template.severity === 'major' || template.severity === 'critical') {
    setShowConfirm(true);
    return;
  }

  // Direct resolution for minor/moderate
  proceedWithResolution();
};

// Render modal
<ConfirmationModal
  isOpen={showConfirm}
  onConfirm={proceedWithResolution}
  onCancel={() => setShowConfirm(false)}
  eventTitle={template.title}
  choiceText={selectedChoice === 'a' ? template.choice_a_text : template.choice_b_text}
  effects={selectedChoice === 'a' ? template.choice_a_effects : template.choice_b_effects}
  severity={template.severity}
/>
```

### 3. Showing Outcome on Dashboard

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import EventOutcome from '@/components/lifeEvents/EventOutcome';

export default function DashboardClient({ battler }: Props) {
  const searchParams = useSearchParams();
  const [showOutcome, setShowOutcome] = useState(false);

  useEffect(() => {
    if (searchParams.get('event_resolved') === 'true') {
      setShowOutcome(true);
    }
  }, [searchParams]);

  return (
    <div>
      {/* Dashboard content */}

      {showOutcome && (
        <EventOutcome
          eventTitle={searchParams.get('event_title') || ''}
          choice={searchParams.get('choice') as 'a' | 'b'}
          effects={JSON.parse(searchParams.get('effects') || '{}')}
          category={searchParams.get('category') || 'career'}
          onClose={() => {
            setShowOutcome(false);
            router.push('/dashboard');
          }}
        />
      )}
    </div>
  );
}
```

---

## Styling Guidelines

### Color Palette
- Background: `bg-zinc-950`
- Cards: `bg-zinc-900`
- Borders: `border-zinc-800`
- Text Primary: `text-zinc-100`
- Text Secondary: `text-zinc-400`
- Accent: `text-orange-500`

### Typography
- Headers: `font-black uppercase tracking-tighter`
- Labels: `text-xs uppercase tracking-wider`
- Body: `text-sm`

### Spacing
- Card padding: `p-6`
- Section gaps: `space-y-6`
- Grid gaps: `gap-4` or `gap-6`

---

## Troubleshooting

### Issue: Animations not playing
**Solution:** Check that the component has `<style jsx>` block with keyframe definitions

### Issue: Category colors not showing
**Solution:** Ensure event template has `category` field populated (run migration)

### Issue: Effects not displaying
**Solution:** Verify effects object is properly formatted JSON with numeric values

### Issue: History page empty
**Solution:** Check that events have `status='resolved'` and joined with template

### Issue: Attribute preview shows wrong values
**Solution:** Ensure `currentAttributes` has proper nested structure (personal/writing/performance)

---

## Performance Tips

1. **Lazy load EventStatistics** - Only render when user navigates to stats tab
2. **Memoize category counts** - Use useMemo for expensive calculations
3. **Virtualize long lists** - If history has 100+ events, consider virtual scrolling
4. **Debounce search** - Add 300ms debounce to search input
5. **Optimize animations** - Use `will-change: transform` for animated elements

---

## Migration Guide

### Applying the Schema Changes

```bash
cd ai-battlerap
npx supabase migration up
```

This will:
- Add `category`, `severity`, `rarity`, `icon_emoji` columns
- Auto-categorize existing events
- Create indexes for filtering

### Updating Existing Events

If you have custom event templates, update them:

```sql
UPDATE life_event_templates
SET category = 'scandal',
    severity = 'critical'
WHERE code = 'my_custom_event';
```

---

## Testing Checklist

- [ ] Resolution screen displays with animations
- [ ] Category badges show correct colors/icons
- [ ] Choice selection shows visual feedback
- [ ] Confirm button shakes when no choice selected
- [ ] Effects display with proper formatting
- [ ] History page loads all resolved events
- [ ] Filters and search work correctly
- [ ] Statistics calculate accurately
- [ ] Mobile layout is responsive
- [ ] Outcome modal displays after resolution

---

## Support

For issues or questions:
1. Check this reference guide
2. Review component source code
3. Check LIFE_EVENT_UI_UX_ENHANCEMENT_SUMMARY.md
4. Review CLAUDE.md for project context
