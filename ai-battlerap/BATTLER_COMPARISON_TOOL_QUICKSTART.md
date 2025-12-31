# Battler Comparison Tool - Quick Start for Developers

## Pre-Implementation Checklist

- [ ] Read full design document: `BATTLER_COMPARISON_TOOL_DESIGN.md`
- [ ] Review visual reference: `BATTLER_COMPARISON_TOOL_VISUAL_REFERENCE.md`
- [ ] Check summary for architecture: `BATTLER_COMPARISON_TOOL_SUMMARY.md`
- [ ] Understand game balance constants in `/lib/game/config.ts`
- [ ] Review badge system in `/lib/game/badges.ts`
- [ ] Familiarize with existing components in `/components/`

## Implementation Roadmap

### Phase 1: MVP (8-12 hours)

#### Step 1: Create API Endpoint (2-3 hours)
```
Location: /app/api/admin/battlers/compare/route.ts
```
- [ ] Parse query params: `ids` (required), `detailed` (optional), `include_trends` (optional)
- [ ] Verify admin authentication (check `profiles.is_admin`)
- [ ] Load battler data (Query 1 from design doc)
- [ ] Calculate choke rates (Query 2)
- [ ] Return standardized response (see design spec)
- [ ] Error handling (invalid UUIDs, unauthorized, not found)
- [ ] Test with Postman/curl

**Key Functions to Implement**:
```typescript
async function verifyAdminAuth(userId: string): Promise<boolean>
async function fetchBattlerWithStats(battlerId: UUID[]): Promise<BattlerData[]>
async function calculateChokeRate(battlerId: UUID): Promise<number>
```

#### Step 2: Create Page Structure (1-2 hours)
```
Location: /app/admin/compare/page.tsx
```
- [ ] Create admin-only page wrapper
- [ ] Implement tab navigation skeleton
- [ ] Setup state management (selected battlers, active tab)
- [ ] Create layout with sidebar and main content area
- [ ] Style with dark theme (Tailwind)

#### Step 3: Implement Battler Selection UI (2-3 hours)
```
Location: /components/admin/BattlerSelector.tsx
        /components/admin/FilterPanel.tsx
```
- [ ] Build battler search/select component
- [ ] Create quick filter UI (tier, rating, league)
- [ ] Implement preset filters
- [ ] Add selected battlers display with remove buttons
- [ ] Connect to selection state
- [ ] Style matching design system

#### Step 4: Implement Attribute Radar Chart (2-3 hours)
```
Location: /components/admin/AttributeRadar.tsx
```
- [ ] Install Recharts (already in package.json)
- [ ] Create radar data transformation function
- [ ] Render multi-series radar chart
- [ ] Implement hover tooltips
- [ ] Add legend with click-to-toggle
- [ ] Test with different attribute ranges

#### Step 5: Implement Stats Comparison Table (2-3 hours)
```
Location: /components/admin/StatsTable.tsx
```
- [ ] Create table component with sortable columns
- [ ] Implement column sorting logic
- [ ] Add data cell highlights (min/max values)
- [ ] Create responsive scrolling (sticky headers + columns)
- [ ] Add tooltips for metric definitions
- [ ] Style with dark theme

**Test MVP**:
- [ ] Load 3 battlers in < 3 seconds
- [ ] Radar chart displays correctly
- [ ] Stats table shows accurate values
- [ ] Admin-only access enforced
- [ ] Responsive on tablet/desktop

### Phase 2: Stats & Badges (8-10 hours)

#### Step 6: Extend Stats Table (1-2 hours)
- [ ] Add all 15+ metrics to table
- [ ] Implement league breakdown columns
- [ ] Add choke/stumble calculations
- [ ] Optimize query performance

#### Step 7: Implement Badge Grid (2-3 hours)
```
Location: /components/admin/BadgeGrid.tsx
        /components/admin/BadgeTooltip.tsx
```
- [ ] Fetch badge definitions from API
- [ ] Create badge matrix component
- [ ] Organize badges by category
- [ ] Implement checkmark indicators
- [ ] Add hover tooltips with effects
- [ ] Style with rarity color coding

#### Step 8: Add Badge Heatmap View (2 hours)
```
Location: /components/admin/BadgeHeatmap.tsx
```
- [ ] Create heatmap visualization (Recharts)
- [ ] Color intensity by rarity
- [ ] Toggle between grid/heatmap view
- [ ] Implement badge count display

#### Step 9: Create Badge API Endpoint (1-2 hours)
```
Location: /app/api/admin/badges/route.ts
```
- [ ] Return all badge definitions
- [ ] Include mechanical effects
- [ ] Format for component consumption
- [ ] Cache responses (optional)

**Test Phase 2**:
- [ ] Badge grid loads without error
- [ ] All 97 badges render correctly
- [ ] Tooltips display full effects
- [ ] Heatmap view functional
- [ ] Choke rates accurate (±2%)

### Phase 3: Charts & Visualizations (10-12 hours)

#### Step 10: Implement Win Rate Trends Chart (3-4 hours)
```
Location: /components/admin/WinRateTrendChart.tsx
        /hooks/useChartData.ts
```
- [ ] Implement rolling average calculation
- [ ] Create line chart (Recharts)
- [ ] Add window size toggles (5, 10, 20 battles)
- [ ] Implement hover tooltips
- [ ] Add trend indicators (↑ Improving, etc.)
- [ ] Calculate projection (next 10 battles)

#### Step 11: Implement League Breakdown Chart (2-3 hours)
```
Location: /components/admin/LeagueBreakdownChart.tsx
```
- [ ] Fetch league-specific win rates (Query 3)
- [ ] Create grouped bar chart
- [ ] Implement specialization detection
- [ ] Add legend with league names
- [ ] Display sample sizes

#### Step 12: Create Chart Data Transformation (2 hours)
```
Location: /hooks/useChartData.ts
```
- [ ] Implement data normalization for charts
- [ ] Create reusable chart utilities
- [ ] Optimize data fetching (lazy load on tab click)
- [ ] Implement caching strategy

#### Step 13: Optimize Performance (2-3 hours)
- [ ] Lazy load charts on tab click
- [ ] Add skeleton loaders
- [ ] Implement SWR caching (5-min revalidation)
- [ ] Database index optimization
- [ ] Benchmark load times

**Test Phase 3**:
- [ ] Win rate trends identify patterns correctly
- [ ] League specialists detected accurately
- [ ] Charts render without lag
- [ ] All interactions responsive
- [ ] Load time < 3 seconds

### Phase 4: Polish & Export (8-10 hours)

#### Step 14: Implement Export Functionality (2-3 hours)
```
Location: /components/admin/ExportPanel.tsx
        /lib/utils/exportData.ts
```
- [ ] Create CSV export function
- [ ] Create JSON export function
- [ ] Implement copy-to-clipboard
- [ ] Add file download handling
- [ ] Include metadata in exports

#### Step 15: Implement Saved Comparisons (2-3 hours)
```
Location: /components/admin/SavedComparisons.tsx
```
- [ ] Store comparisons in localStorage
- [ ] Implement save UI
- [ ] Create load from list
- [ ] Add delete functionality
- [ ] Prevent exceeding 10 comparisons

#### Step 16: Create Insights Panel (2-3 hours)
```
Location: /components/admin/InsightsPanel.tsx
```
- [ ] Detect outlier values (99th percentile)
- [ ] Generate balance recommendations
- [ ] Identify badge synergies
- [ ] Suggest attribute adjustments
- [ ] Display meta analysis

#### Step 17: Polish UI/UX (1-2 hours)
- [ ] Consistent dark theme throughout
- [ ] Responsive design (tablet/desktop)
- [ ] Accessibility (color contrast, labels)
- [ ] Empty states and error messages
- [ ] Loading states (skeletons, spinners)

#### Step 18: Admin Auth Verification (1 hour)
- [ ] Add auth middleware to all admin routes
- [ ] Return 403 Forbidden for non-admins
- [ ] Add auth check to API endpoints
- [ ] Test with non-admin user

**Test Phase 4**:
- [ ] CSV export opens in Excel
- [ ] JSON export parseable
- [ ] Saved comparisons persist across sessions
- [ ] Insights are helpful and actionable
- [ ] Production-ready quality

---

## Database Optimization Tasks

### Add Missing Indexes

```sql
-- High priority (used in frequent queries)
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_battler_player ON battles(battler_player_id);
CREATE INDEX idx_battles_battler_ai ON battles(battler_ai_id);
CREATE INDEX idx_battle_segments_battler_choked ON battle_segments(battler_id, choked);
CREATE INDEX idx_battle_rounds_battle_id ON battle_rounds(battle_id);

-- Medium priority (used in analytics)
CREATE INDEX idx_rankings_rating ON rankings(rating DESC);
CREATE INDEX idx_battlers_is_ai ON battlers(is_ai);

-- Run ANALYZE after creating indexes
ANALYZE;
```

### Optional: Create Materialized Views

```sql
-- Cache expensive calculations (refresh daily)
CREATE MATERIALIZED VIEW admin_battler_stats AS
SELECT
  b.id,
  b.stage_name,
  r.rating,
  r.wins,
  r.losses,
  ROUND(CAST(r.wins AS float) / (r.wins + r.losses) * 100, 1) as win_rate
FROM battlers b
JOIN rankings r ON b.id = r.battler_id
WHERE b.is_ai = true;

CREATE INDEX idx_admin_battler_stats_rating ON admin_battler_stats(rating DESC);

-- Refresh schedule (add to cron/scheduler)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY admin_battler_stats;
```

---

## File Structure to Create

```
app/
├── admin/
│   └── compare/
│       └── page.tsx                    ← Main page

api/admin/
├── battlers/
│   ├── compare/
│   │   └── route.ts                    ← Comparison data endpoint
│   ├── route.ts                        ← List battlers endpoint
│   └── cache/
│       └── invalidate/route.ts         ← Cache invalidation
└── badges/
    └── route.ts                        ← Badge definitions endpoint

components/admin/
├── BattlerSelector.tsx
├── FilterPanel.tsx
├── AttributeRadar.tsx
├── StatsTable.tsx
├── BadgeGrid.tsx
├── BadgeTooltip.tsx
├── BadgeHeatmap.tsx
├── WinRateTrendChart.tsx
├── LeagueBreakdownChart.tsx
├── ChartTooltip.tsx
├── ExportPanel.tsx
├── SavedComparisons.tsx
├── InsightsPanel.tsx
├── OutlierHighlight.tsx
└── ComparisonLayout.tsx

hooks/
└── useChartData.ts

lib/utils/
├── exportData.ts
└── comparisonAnalysis.ts
```

---

## Component Interface Examples

### BattlerSelector.tsx Props
```typescript
interface BattlerSelectorProps {
  onSelectBattlers: (battlerIds: UUID[]) => void;
  maxSelections?: number;  // default: 10
  selectedIds?: UUID[];
  isLoading?: boolean;
}
```

### StatsTable.tsx Props
```typescript
interface StatsTableProps {
  battlers: BattlerComparisonData[];
  isLoading?: boolean;
  sortBy?: string;
  onSortChange?: (column: string) => void;
}
```

### AttributeRadar.tsx Props
```typescript
interface AttributeRadarProps {
  battlers: BattlerComparisonData[];
  showAverage?: boolean;
  onAverageToggle?: (show: boolean) => void;
}
```

### WinRateTrendChart.tsx Props
```typescript
interface WinRateTrendChartProps {
  battlers: BattlerComparisonData[];
  windowSize?: 5 | 10 | 20;
  onWindowChange?: (size: number) => void;
}
```

---

## API Response Interface

```typescript
interface ComparisonResponse {
  success: boolean;
  data: {
    timestamp: string;  // ISO8601
    battlers: BattlerComparisonData[];
  };
  errors?: string[];
}

interface BattlerComparisonData {
  id: UUID;
  stage_name: string;
  tier: 'low' | 'mid' | 'top' | 'god';
  rating: number;
  attributes: {
    writing: WritingAttributes;
    performance: PerformanceAttributes;
    resilience: number;
  };
  stats: {
    total_battles: number;
    wins: number;
    losses: number;
    win_rate: number;
    current_streak: number;
  };
  performance: {
    choke_rate: number;
    avg_chokes_per_battle: number;
    stumble_rate: number;
    avg_score: number;
    peak_score: number;
    crowd_reaction_avg: number;
  };
  league_stats: {
    small_room: LeagueStats;
    main_stage: LeagueStats;
  };
  badges: BadgeInfo[];
  win_rate_trend?: TrendPoint[];
}

interface LeagueStats {
  wins: number;
  losses: number;
  win_rate: number;
}

interface BadgeInfo {
  code: string;
  name: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effects: BadgeEffects;
}

interface TrendPoint {
  battle_number: number;
  win_rate: number;
  date: string;  // ISO8601
}
```

---

## Key Development Tips

### 1. Authentication Middleware
Use existing pattern in `lib/db/server.ts`:
```typescript
async function verifyAdminAuth(request: Request) {
  const user = await getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return new Response('Forbidden', { status: 403 });
  }

  return user;
}
```

### 2. Data Caching Strategy
Use SWR for frontend caching:
```typescript
import useSWR from 'swr';

const { data, error, isLoading } = useSWR(
  `/api/admin/battlers/compare?ids=${selectedIds.join(',')}`,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 60000,  // 1 minute
  }
);
```

### 3. Recharts Customization
Dark theme colors:
```typescript
<ResponsiveContainer>
  <RadarChart>
    <PolarGrid stroke="#27272a" />
    <PolarAngleAxis stroke="#a1a1a6" dataKey="attribute" />
    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
  </RadarChart>
</ResponsiveContainer>
```

### 4. Testing Quick Data Load
Create test endpoint that returns mock data:
```typescript
// /app/api/admin/battlers/compare/mock/route.ts
export async function GET() {
  return Response.json(mockComparisonData);
}
```

### 5. Error Handling Pattern
```typescript
try {
  const response = await fetch(`/api/admin/battlers/compare?ids=${ids}`);
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Admin access required');
    }
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
} catch (error) {
  console.error('Comparison fetch failed:', error);
  // Show user-friendly error message
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Choke rate calculation accuracy
- [ ] Win rate by league calculation
- [ ] Attribute radar data transformation
- [ ] CSV export formatting
- [ ] Trend line rolling average

### Integration Tests
- [ ] Multi-battler selection flow
- [ ] Filter application correctly narrows results
- [ ] API returns correct schema
- [ ] Saved comparisons persist
- [ ] Export generates valid files

### E2E Tests (Manual)
- [ ] Admin can access tool, non-admin cannot
- [ ] Can select 2-10 battlers
- [ ] All tabs render without errors
- [ ] Charts update when selection changes
- [ ] Data matches database values
- [ ] Export opens in Excel
- [ ] Performance < 3 seconds

### Performance Tests
- [ ] Chart renders in < 500ms
- [ ] Table scroll smooth with 50+ rows
- [ ] Filter application instant (< 100ms)
- [ ] API response < 2 seconds
- [ ] Total page load < 3 seconds

---

## Common Pitfalls to Avoid

1. **Not validating admin status** - Always check `profiles.is_admin`
2. **Hardcoding colors** - Use dark theme tokens from design system
3. **N+1 queries** - Batch fetch battler data in single query
4. **Missing error states** - Show loading, error, and empty states
5. **Ignoring RLS policies** - Use service role for admin data
6. **Not caching chart data** - Implement SWR or React Query
7. **Inconsistent metric names** - Use exact names from design doc
8. **Bad TypeScript** - Type all props and responses
9. **Missing tooltips** - Explain every metric on hover
10. **Slow sort/filter** - Keep calculations on backend, not client

---

## Questions to Answer Before Starting

1. **Admin panel routing**: Should this be `/admin/compare` or `/settings/admin/compare`?
2. **Auth integration**: Use existing `lib/db/server.ts` or create new middleware?
3. **Cache strategy**: SWR with 5-min? Or invalidate on every balance change?
4. **Database optimization**: Should we add materialized views for stats?
5. **Export storage**: Save to browser localStorage or server?
6. **Insights algorithm**: What constitutes "actionable" recommendation?
7. **Badge effect matrix**: Show all 25 effect types or summarize?
8. **Mobile support**: Tablet only or full responsive?
9. **Historical data**: Keep last 50 battles or all history?
10. **Performance target**: Aim for < 2s or < 3s page load?

---

## Resources

- **Design Document**: `BATTLER_COMPARISON_TOOL_DESIGN.md` (1,302 lines)
- **Visual Reference**: `BATTLER_COMPARISON_TOOL_VISUAL_REFERENCE.md` (wireframes)
- **Summary**: `BATTLER_COMPARISON_TOOL_SUMMARY.md` (quick facts)
- **Game Config**: `lib/game/config.ts` (balance constants)
- **Badge System**: `lib/game/badges.ts` (97 badge definitions)
- **Simulation Logic**: `lib/game/simulation.ts` (battle engine)
- **Existing Components**: `/components/` (design system reference)
- **Existing API Patterns**: `/app/api/` (endpoint structure)

---

## Success Criteria (Phase by Phase)

### Phase 1 (MVP)
- ✅ Page loads in < 3 seconds
- ✅ Can select 2-10 battlers
- ✅ Radar chart displays 7 attributes
- ✅ Stats table shows top 10 metrics accurately
- ✅ Admin-only access enforced

### Phase 2
- ✅ Choke rates accurate (±2%)
- ✅ Badge grid complete (97 badges)
- ✅ League breakdown calculated
- ✅ Performance maintained < 3 seconds

### Phase 3
- ✅ Trends chart identifies momentum
- ✅ League specialists detected (>10% difference)
- ✅ All charts interactive and responsive
- ✅ No performance degradation

### Phase 4
- ✅ CSV/JSON export valid
- ✅ Saved comparisons persist
- ✅ Insights generate actionable recommendations
- ✅ Production quality code and UX

---

**Status**: Ready for implementation handoff
**Estimated Duration**: 34-44 hours (1-2 weeks)
**Last Updated**: November 30, 2025
