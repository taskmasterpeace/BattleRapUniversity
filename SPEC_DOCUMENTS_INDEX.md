# Battle Rap University - Spec Documents Index

Master index of all specification and design documents.

---

## CORE GAME DESIGN

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | Main project guide, tech stack, game mechanics, dev setup |
| `ROUND_CRAFTING_AND_PREP_SYSTEM_V2.md` | Complete V2 prep system design with real battle rap research |

---

## V1 DOCUMENTATION (Core Flow)

| Document | Purpose |
|----------|---------|
| `V0_HANDOFF_README.md` | V1 master guide for V0 |
| `V0_PRIORITY_FIXES.md` | Critical navigation fixes |
| `V0_MISSING_COMPONENTS_SPEC.md` | 6 components to build |
| `V0_API_CONTRACT.md` | V1 API endpoints and data types |
| `V0_AUDIT_CHECKLIST.md` | V1 verification checklist |
| `V0_FRONTEND_MASTER_CHECKLIST.md` | Complete V1 feature list |

---

## V2 DOCUMENTATION (Segment-Based Prep)

| Document | Purpose |
|----------|---------|
| `V2_HANDOFF_README.md` | V2 master guide for V0 |
| `V2_FEATURES_SPEC.md` | All 10 V2 features detailed |
| `V2_COMPONENTS_SPEC.md` | 7 new components to build |
| `V2_API_CONTRACT.md` | V2 API endpoints and database schema |
| `V2_AUDIT_CHECKLIST.md` | V2 verification checklist |

---

## SUPPLEMENTARY SPECS

| Document | Purpose |
|----------|---------|
| `ROUND_CRAFTING_FRONTEND_SPEC.md` | Round crafting UI component specs |
| `LIFE_EVENTS_V2_FRONTEND_SPEC.md` | Life events system UI |
| `LIFE_EVENTS_V2_DEEP_SPEC.md` | Life events system mechanics |
| `LEAGUE_EVENTS_SYSTEM_SPEC.md` | League/tournament system |
| `AI_BATTLERS_ROSTER.md` | AI opponent roster |
| `docs/SECRETS_AND_INTEL_SYSTEM.md` | Secrets & Intel system - discovery, angles, personals |

---

## IMPLEMENTATION STATUS

### V1 Status: **COMPLETE** (100%)
- All pages connected
- All components built
- Navigation flow working
- Mock data in place

### V2 Status: **74% COMPLETE**
- Frontend: **100%** - All components built
- API Routes: **100%** - Stubs with mock data
- Database: **0%** - Schema written, not deployed
- Simulation: **0%** - Not connected

---

## BACKEND TODO

These items are backend work (not V0):

1. **Deploy V2 Database Schema**
   - Run `scripts/v2-schema.sql`
   - Create `battle_segments` table
   - Create `battle_counters` table

2. **Build V2 Simulation Engine**
   - Segment-based round scoring
   - Counter resolution logic
   - Research level effects
   - Freestyle variance

3. **Connect Real Data**
   - Replace mock data in API routes
   - Wire to Supabase database

4. **Internal API Routes**
   - `POST /api/internal/generate-battle-offers`
   - `POST /api/internal/run-due-battles`

---

## QUICK LINKS

**Starting a new feature?**
1. Check `CLAUDE.md` for project context
2. Check relevant V1/V2 spec for requirements
3. Use audit checklist to verify

**Frontend work?**
- Start with `V2_HANDOFF_README.md`
- Reference `V2_COMPONENTS_SPEC.md`
- Use `V2_API_CONTRACT.md` for data shapes

**Backend work?**
- Check `V2_API_CONTRACT.md` for endpoints
- See database schema in same file
- Simulation logic in `ROUND_CRAFTING_AND_PREP_SYSTEM_V2.md`

---

**Last Updated**: December 11, 2025
