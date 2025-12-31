# Avatar Integration Guide

Quick reference for integrating avatars and banners throughout the application.

## Component Import

```tsx
import BattlerAvatar from '@/components/battler/BattlerAvatar';
import BattlerBanner from '@/components/battler/BattlerBanner';
```

## Integration Opportunities

### ✅ Already Integrated

#### Dashboard (`components/battler/DashboardClient.tsx`)
```tsx
<BattlerBanner battler={battler}>
  <div className="w-full px-6 pb-6">
    <div className="flex items-end gap-4">
      <BattlerAvatar battler={battler} size="xl" showBorder />
      <div>
        <h2>{battler.stage_name.toUpperCase()}</h2>
      </div>
    </div>
  </div>
</BattlerBanner>
```

### 🔲 Ready to Integrate

#### Battle Offers Page (`app/battle/offers/page.tsx`)

**Show opponent avatar in offer cards:**
```tsx
{offers.map((battle) => (
  <div key={battle.id} className="offer-card">
    {/* Add opponent avatar */}
    <div className="flex items-center gap-3 mb-4">
      <BattlerAvatar
        battler={battle.ai_battler}
        size="md"
      />
      <div>
        <h3>{battle.ai_battler.stage_name}</h3>
        <p>{battle.ai_battler.tier} TIER</p>
      </div>
    </div>
    {/* Rest of offer card */}
  </div>
))}
```

#### Battle Results Page (`app/battle/[id]/page.tsx`)

**Show both battlers with avatars:**
```tsx
<div className="battle-header">
  <div className="battler-section">
    <BattlerAvatar battler={playerBattler} size="lg" showBorder />
    <h2>{playerBattler.stage_name}</h2>
  </div>

  <div className="vs-divider">VS</div>

  <div className="battler-section">
    <BattlerAvatar battler={aiBattler} size="lg" showBorder />
    <h2>{aiBattler.stage_name}</h2>
  </div>
</div>
```

#### Tournament Brackets (`app/tournaments/[id]/page.tsx`)

**Show participants in bracket:**
```tsx
<div className="matchup">
  <div className="participant">
    <BattlerAvatar battler={battler1} size="sm" />
    <span>{battler1.stage_name}</span>
  </div>
  <div className="participant">
    <BattlerAvatar battler={battler2} size="sm" />
    <span>{battler2.stage_name}</span>
  </div>
</div>
```

#### Recent Battles Widget (Dashboard)

**Add avatars to battle history:**
```tsx
{recentBattles.map((battle) => (
  <Link href={`/battle/${battle.id}`} key={battle.id}>
    <div className="flex items-center gap-3">
      <BattlerAvatar
        battler={battle.ai_battler}
        size="sm"
      />
      <div>
        <p>VS {battle.ai_battler.stage_name}</p>
        <p className="text-xs">{battle.result}</p>
      </div>
    </div>
  </Link>
))}
```

#### News Articles (`app/media/[slug]/page.tsx`)

**Show battler avatars in articles:**
```tsx
<div className="article-header">
  {article.primary_battler && (
    <div className="flex items-center gap-3">
      <BattlerAvatar
        battler={article.primary_battler}
        size="md"
      />
      <h3>{article.primary_battler.stage_name}</h3>
    </div>
  )}
</div>
```

#### Rankings/Leaderboard (Future Page)

**Show top battlers:**
```tsx
{topBattlers.map((battler, index) => (
  <div key={battler.id} className="rank-row">
    <span className="rank">#{index + 1}</span>
    <BattlerAvatar battler={battler} size="sm" />
    <span>{battler.stage_name}</span>
    <span>{battler.rating}</span>
  </div>
))}
```

## Avatar Size Guide

### Size Options
- `xs`: 32px (w-8 h-8) - Small icons, lists
- `sm`: 48px (w-12 h-12) - Compact displays, rankings
- `md`: 64px (w-16 h-16) - Default size, cards
- `lg`: 96px (w-24 h-24) - Feature displays, headers
- `xl`: 128px (w-32 h-32) - Main profile, dashboard
- `2xl`: 160px (w-40 h-40) - Settings page, large profile

### Usage Recommendations

| Context | Recommended Size | Use Border? |
|---------|-----------------|-------------|
| Dashboard header | `xl` | Yes |
| Battle results header | `lg` | Yes |
| Battle offers list | `md` | No |
| Tournament brackets | `sm` | No |
| Recent battles widget | `sm` | No |
| Rankings/leaderboard | `sm` | No |
| News article header | `md` | No |
| Profile settings | `2xl` | Yes |
| Opponent info modal | `lg` | Yes |

## Banner Usage

### Dashboard Banner
```tsx
<BattlerBanner battler={battler}>
  {/* Content overlaid on banner */}
  <div className="p-6">
    <h1>{battler.stage_name}</h1>
  </div>
</BattlerBanner>
```

### Profile Page Banner (Future)
```tsx
<BattlerBanner battler={battler} showOverlay={true}>
  <div className="w-full px-6 pb-6">
    <div className="flex justify-between items-end">
      <BattlerAvatar battler={battler} size="xl" showBorder />
      <div className="stats">
        <div>{ranking.rating} ELO</div>
        <div>{ranking.wins}W - {ranking.losses}L</div>
      </div>
    </div>
  </div>
</BattlerBanner>
```

### Banner without Overlay
```tsx
{/* Use for decorative headers */}
<BattlerBanner battler={battler} showOverlay={false} />
```

## Fallback Behavior

### Avatar Fallbacks
When `avatar_url` is null or image fails to load:
- Shows initials (first letter of stage name, or first + last)
- Background color based on tier:
  - God: Orange (`bg-orange-500`)
  - Top: Purple (`bg-purple-500`)
  - Mid: Blue (`bg-blue-500`)
  - Low: Gray (`bg-zinc-600`)

### Banner Fallbacks
When `banner_url` is null or image fails to load:
- Shows gradient based on tier:
  - God: Orange → Red → Purple
  - Top: Purple → Pink → Orange
  - Mid: Blue → Cyan → Teal
  - Low: Gray → Gray → Gray

## Styling Tips

### Custom Classes
```tsx
<BattlerAvatar
  battler={battler}
  size="md"
  className="shadow-lg" // Add custom classes
/>
```

### Border Ring
```tsx
<BattlerAvatar
  battler={battler}
  size="lg"
  showBorder={true} // Adds orange ring
/>
```

### Banner with Custom Overlay
```tsx
<BattlerBanner battler={battler} showOverlay={false}>
  {/* Add your own overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
    <div className="absolute bottom-0 left-0 p-6">
      <h1>Custom Content</h1>
    </div>
  </div>
</BattlerBanner>
```

## Performance Tips

1. **Lazy Load**: Avatars use native `<img>` with loading states
2. **Caching**: Images are cached by browser (public URLs)
3. **Fallbacks**: No layout shift thanks to sized containers
4. **Optimization**: Consider using Next.js `<Image>` component for additional optimization

## Accessibility

Both components handle:
- Alt text (stage name)
- Loading states
- Error states
- Keyboard navigation (when wrapped in links/buttons)

## Example Integration: Battle Offers

```tsx
// app/battle/offers/page.tsx
import BattlerAvatar from '@/components/battler/BattlerAvatar';

export default async function BattleOffersPage() {
  const offers = await getOffers();

  return (
    <div className="offers-grid">
      {offers.map((battle) => (
        <div key={battle.id} className="offer-card">
          {/* Opponent Header */}
          <div className="flex items-center gap-4 mb-6">
            <BattlerAvatar
              battler={battle.ai_battler}
              size="lg"
            />
            <div>
              <h3 className="text-2xl font-black">
                {battle.ai_battler.stage_name}
              </h3>
              <p className="text-zinc-500 uppercase text-sm">
                {battle.ai_battler.tier} TIER • {battle.ai_battler.ranking?.rating} ELO
              </p>
            </div>
          </div>

          {/* Battle Details */}
          <div className="battle-info">
            <p>League: {battle.league.name}</p>
            <p>Scheduled: {formatDate(battle.scheduled_at)}</p>
          </div>

          {/* Accept Button */}
          <button onClick={() => acceptBattle(battle.id)}>
            ACCEPT BATTLE
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Common Patterns

### Avatar + Name Combo
```tsx
<div className="flex items-center gap-3">
  <BattlerAvatar battler={battler} size="sm" />
  <span className="font-bold">{battler.stage_name}</span>
</div>
```

### Avatar + Stats Card
```tsx
<div className="card">
  <BattlerAvatar battler={battler} size="md" className="mb-4" />
  <h3>{battler.stage_name}</h3>
  <div className="stats">
    <span>{battler.ranking.rating} ELO</span>
    <span>{battler.ranking.wins}W - {battler.ranking.losses}L</span>
  </div>
</div>
```

### Two Battlers Face-Off
```tsx
<div className="flex items-center justify-between">
  <div className="text-center">
    <BattlerAvatar battler={playerBattler} size="lg" showBorder />
    <p>{playerBattler.stage_name}</p>
  </div>

  <div className="text-4xl font-black text-orange-500">VS</div>

  <div className="text-center">
    <BattlerAvatar battler={aiBattler} size="lg" showBorder />
    <p>{aiBattler.stage_name}</p>
  </div>
</div>
```

## Quick Integration Checklist

When adding avatars to a new page/component:

- [ ] Import `BattlerAvatar` component
- [ ] Choose appropriate size (xs, sm, md, lg, xl, 2xl)
- [ ] Decide if border ring needed (`showBorder={true}`)
- [ ] Add custom className if needed for spacing
- [ ] Ensure battler object has required fields (stage_name, avatar_url, tier)
- [ ] Test fallback behavior (delete image to see initials)
- [ ] Check mobile responsiveness
- [ ] Verify loading states work correctly

## Need Help?

- See `IMAGE_UPLOAD_IMPLEMENTATION.md` for full system docs
- See `STORAGE_SETUP.md` for Supabase configuration
- Check component source code for all available props
- Test in profile settings (`/settings/profile`) to see all features
