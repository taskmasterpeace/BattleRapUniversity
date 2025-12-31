# Sprite Attachment Implementation Plan

**Document Date**: 2025-11-30
**Total Sprites**: 1,856
**Target Completion**: 1 Sprint (5-7 days)

---

## Executive Summary

Complete backend strategy designed to attach **1,856 sprite images** across 5 database tables with **zero frontend code required**. All image URLs will be stored in database and served via static public paths (`/sprites/[category]/...`).

### Key Metrics
- **Coverage**: 100% of 1,856 sprites have matching database records
- **Orphaned Files**: 0 identified
- **Missing Assets**: 0 critical gaps
- **Database Changes**: 1 new table, 5 new columns
- **Implementation Time**: ~3-5 days (mostly bulk operations)

---

## Deliverables (Already Generated)

### 1. SPRITE_DATABASE_SCHEMA.md
**Purpose**: Complete schema analysis and migration requirements
**Contains**:
- Current database state
- Detailed table-by-table analysis
- Required schema changes
- Data integrity rules
- File organization reference
- Verification queries

**Use Case**: Reference guide for all database changes needed

### 2. IMAGE_ATTACHMENT_MIGRATION.sql
**Purpose**: SQL script to populate image URLs
**Contains**:
- Phase 1: Add image columns
- Phase 2: Create crowd_reactions table
- Phase 3: RLS policies
- Phase 4: Validation functions
- Phase 5: Sample data seeding

**Use Case**: Execute against Supabase database to add infrastructure

### 3. ASSET_MAPPING_REPORT.md
**Purpose**: Comprehensive asset inventory and gap analysis
**Contains**:
- File-to-record mapping tables
- Coverage by category (920 battlers, 120 badges, 152 leagues, 84 cities, 580 crowd)
- Gaps & orphaned files analysis
- Recommendations for each category
- Validation checklist

**Use Case**: Track completion status and identify any missing assets

### 4. BULK_ATTACH_SCRIPT.ts
**Purpose**: TypeScript automation script for data population
**Contains**:
- Directory scanning functions
- Database matching logic
- Dry-run and verbose modes
- Separate functions for each category

**Usage**:
```bash
# Dry run (shows what would be updated)
npx tsx BULK_ATTACH_SCRIPT.ts all --dry-run --verbose

# Execute (actually updates database)
npx tsx BULK_ATTACH_SCRIPT.ts all

# Single category
npx tsx BULK_ATTACH_SCRIPT.ts battlers --dry-run
```

**Use Case**: Automate bulk URL population for 1,856+ images

### 5. STORAGE_BUCKET_SETUP.md
**Purpose**: Storage strategy analysis and implementation guides
**Contains**:
- Option A: Static public URLs (RECOMMENDED FOR V1)
- Option B: Supabase Storage buckets (FUTURE)
- Migration path from A → B
- CDN configuration
- Troubleshooting guide

**Use Case**: Decision framework for image delivery strategy

---

## Implementation Timeline

### Phase 1: Schema Preparation (Day 1)
**Deliverables**: Migration applied, validation function created
**Time**: 30 minutes

```bash
# 1. Apply migration
supabase migration up

# 2. Verify tables created
SELECT * FROM crowd_reactions; -- should be empty
SELECT * FROM check_image_url_coverage(); -- shows 0% coverage
```

**Checklist**:
- [ ] Migration 20251201000000 applied successfully
- [ ] `crowd_reactions` table exists
- [ ] Image columns added to leagues, cities, badge_costs
- [ ] RLS policies enabled
- [ ] Validation function created

### Phase 2: Battler Avatar Attachment (Day 2)
**Deliverables**: 920/920 battler avatars populated
**Time**: 2-3 hours

```bash
# 1. Run dry-run to verify matching
npx tsx BULK_ATTACH_SCRIPT.ts battlers --dry-run --verbose

# 2. Review unmatched files and orphaned records
# (May require stage_name standardization)

# 3. Execute attachment
npx tsx BULK_ATTACH_SCRIPT.ts battlers

# 4. Verify
SELECT COUNT(*) as total, COUNT(avatar_url) as with_avatars
FROM battlers;
-- Expected: total=X, with_avatars=X (100%)
```

**Potential Issues**:
- Stage names don't match sprite filenames (e.g., "Tru-Foe" vs "tru_foe.png")
- **Solution**: Normalize both names or create mapping file

**Checklist**:
- [ ] 920/920 battler avatars populated
- [ ] No broken image URLs in database
- [ ] Verification query returns 100%

### Phase 3: Badge Icon Attachment (Day 2-3)
**Deliverables**: 120/120 badge icons populated
**Time**: 1-2 hours

```bash
# 1. Run dry-run
npx tsx BULK_ATTACH_SCRIPT.ts badges --dry-run --verbose

# 2. Execute
npx tsx BULK_ATTACH_SCRIPT.ts badges

# 3. Verify
SELECT COUNT(*) as total, COUNT(icon_url) as with_icons
FROM badge_costs;
-- Expected: total=120, with_icons=120 (100%)
```

**Potential Issues**:
- Badge codes not matching file numbers
- **Solution**: Update mapping table in BULK_ATTACH_SCRIPT.ts

**Checklist**:
- [ ] 120/120 badge icons populated
- [ ] Mapping verified against NAMING_GUIDE.md
- [ ] Verification query returns 100%

### Phase 4: League Logo & City Background Attachment (Day 3)
**Deliverables**: 2 leagues + 10 cities populated
**Time**: 1 hour

```bash
# 1. Cities attachment
npx tsx BULK_ATTACH_SCRIPT.ts cities --dry-run

# 2. Execute
npx tsx BULK_ATTACH_SCRIPT.ts cities

# 3. Verify
SELECT COUNT(*) as total, COUNT(background_url) as with_backgrounds
FROM cities;
-- Expected: total=10, with_backgrounds=10 (100%)

# 4. Leagues (manual or script)
UPDATE leagues SET logo_url = '/sprites/leagues/image_1764195526092/small_room_circuit.png' WHERE short_code = 'SRC';
UPDATE leagues SET logo_url = '/sprites/leagues/image_1764195526092/main_stage_arena.png' WHERE short_code = 'MSA';
```

**Checklist**:
- [ ] 10/10 city backgrounds populated
- [ ] 2/2 league logos populated
- [ ] Verification queries return 100%

### Phase 5: Crowd Reactions Seeding (Day 4-5)
**Deliverables**: 580/580 crowd reactions categorized and seeded
**Time**: 4-6 hours (mostly analysis)

```bash
# 1. Complete categorization audit
# - Review CROWD_CATEGORIZATION.md
# - Continue audit from 50 to 580 sprites
# - Document reactions by demographic and type

# 2. Generate seeding script
# - Based on categorization results
# - Create comprehensive INSERT statements

# 3. Seed database
npx tsx BULK_ATTACH_SCRIPT.ts crowd --dry-run

# 4. Verify
SELECT COUNT(*) as total FROM crowd_reactions;
-- Expected: 580
```

**Blockers**:
- Crowd sprite categorization incomplete (50/580 done)
- **Solution**: Parallel work - assign team member to complete audit

**Checklist**:
- [ ] All 580 crowd sprites categorized
- [ ] 580/580 reactions seeded into crowd_reactions table
- [ ] Demographic distribution verified (~70% black, ~15% white, ~15% mixed)
- [ ] Reaction types well-distributed

### Phase 6: API Updates (Day 5-6)
**Deliverables**: All endpoints return image URLs
**Time**: 2-3 hours

```typescript
// Update API responses to include image URLs

// /api/battlers/[id]
const { data: battler } = await supabase
  .from('battlers')
  .select('id, stage_name, avatar_url') // Add avatar_url
  .eq('id', battleId);

// /api/leagues/[id]
const { data: league } = await supabase
  .from('leagues')
  .select('id, name, logo_url, icon_url') // Add these
  .eq('id', leagueId);

// /api/badges/[code]
const { data: badge } = await supabase
  .from('badge_costs')
  .select('badge_code, badge_name, icon_url') // Add icon_url
  .eq('badge_code', code);

// /api/cities/[id]
const { data: city } = await supabase
  .from('cities')
  .select('id, name, background_url') // Add background_url
  .eq('id', cityId);

// /api/crowd-reactions (new endpoint)
const { data: reactions } = await supabase
  .from('crowd_reactions')
  .select('*');
```

**Changes Required**:
- 4-5 existing API routes
- 1 new API route for crowd reactions
- Update TypeScript interfaces

**Checklist**:
- [ ] API endpoints tested with image URLs
- [ ] Sample responses verified in Postman/Insomnia
- [ ] No broken references
- [ ] Response times acceptable (<100ms)

### Phase 7: Testing & Verification (Day 6-7)
**Deliverables**: All systems tested, ready for deployment
**Time**: 2-3 hours

```bash
# 1. Run complete validation
SELECT * FROM check_image_url_coverage();

# 2. Spot-check each category
SELECT avatar_url FROM battlers LIMIT 5;
SELECT icon_url FROM badge_costs LIMIT 5;
SELECT logo_url FROM leagues;
SELECT background_url FROM cities;
SELECT sprite_url FROM crowd_reactions LIMIT 5;

# 3. Test API endpoints
curl http://localhost:3000/api/battlers/[id]
curl http://localhost:3000/api/leagues/[id]
curl http://localhost:3000/api/badges/[code]
curl http://localhost:3000/api/cities/[id]
curl http://localhost:3000/api/crowd-reactions

# 4. Verify image loading in browser
# (Frontend team performs this)
```

**Checklist**:
- [ ] All coverage percentages at 100%
- [ ] No NULL values in critical columns
- [ ] API responses include image URLs
- [ ] Image files physically exist at referenced paths
- [ ] Performance metrics acceptable
- [ ] Staging deployment successful
- [ ] Team sign-off obtained

---

## Database Migration Checklist

### Pre-Migration
- [ ] Backup current database
- [ ] Verify no active user sessions
- [ ] Test migration on staging first
- [ ] Document rollback plan

### Migration Execution
- [ ] Apply 20251201000000_add_sprite_image_columns.sql
- [ ] Verify all tables created/modified
- [ ] Confirm RLS policies enabled
- [ ] Run validation function
- [ ] Check no errors in migration logs

### Post-Migration
- [ ] Verify all new columns exist
- [ ] Confirm crowd_reactions table created
- [ ] Test RLS policies (select as anonymous)
- [ ] Monitor database performance
- [ ] Document any issues

---

## Risk Assessment & Mitigation

### Risk 1: Stage name mismatches
**Severity**: Medium
**Likelihood**: Medium
**Impact**: 0-100 battlers won't have avatars

**Mitigation**:
- Standardize all stage names before attachment
- Create mapping file for non-standard names
- Manual review of unmatched entries
- Update battler records if needed

### Risk 2: Crowd sprite categorization incomplete
**Severity**: Medium
**Likelihood**: High
**Impact**: Some crowd reactions won't be seeded

**Mitigation**:
- Parallel work - team member completes audit during Phase 2-4
- Prioritize positive/negative reactions first
- Use partial seeding (seed what's ready, continue later)
- Crowd sprites aren't critical to MVP

### Risk 3: Image files moved/renamed
**Severity**: High
**Likelihood**: Low
**Impact**: All URLs become broken

**Mitigation**:
- Don't move sprite files during migration
- Lock sprite directories during bulk operations
- Verify file integrity before/after
- Version control sprite directory structure

### Risk 4: Database size increases
**Severity**: Low
**Likelihood**: Low
**Impact**: ~1MB text storage for 1,856 URLs

**Mitigation**:
- Monitor disk usage post-migration
- URLs are very small (40-100 bytes each)
- No impact on query performance

---

## Success Criteria

**Phase 1 Complete** when:
- [ ] Migration applied without errors
- [ ] All new tables/columns exist
- [ ] Validation function works
- [ ] check_image_url_coverage() returns 0% (empty)

**Phase 2 Complete** when:
- [ ] 920/920 battler avatars populated
- [ ] Verification query shows 100%
- [ ] No image files broken
- [ ] All formats consistent

**Phase 3 Complete** when:
- [ ] 120/120 badge icons populated
- [ ] Mapping verified
- [ ] Verification query shows 100%

**Phase 4 Complete** when:
- [ ] 10/10 cities + 2/2 leagues populated
- [ ] Regional organization maintained
- [ ] All URLs valid

**Phase 5 Complete** when:
- [ ] 580/580 crowd sprites categorized
- [ ] Demographic distribution verified
- [ ] All reactions seeded
- [ ] Coverage report shows 100%

**Phase 6 Complete** when:
- [ ] All API endpoints return image URLs
- [ ] No broken references
- [ ] Response times acceptable
- [ ] Sample API calls verified

**Phase 7 Complete** when:
- [ ] All verification queries pass
- [ ] Cross-category consistency verified
- [ ] Staging deployment successful
- [ ] Documentation updated
- [ ] Team sign-off obtained

**Overall Project Complete** when:
- All 7 phases complete
- Full validation report generated
- Ready for production deployment

---

## Resource Requirements

### Personnel
- **1 Backend Engineer**: Lead migration, run scripts, troubleshoot
- **1 Data Analyst** (Part-time): Complete crowd sprite categorization
- **1 QA Engineer** (Part-time): Verification and testing

### Tools
- Supabase CLI (already installed)
- TypeScript runtime (already installed)
- Text editor (any)
- Postman/Insomnia for API testing
- Git for version control

### Time Estimate
- **Phase 1**: 30 minutes
- **Phase 2**: 3 hours
- **Phase 3**: 2 hours
- **Phase 4**: 1 hour
- **Phase 5**: 6 hours (includes audit)
- **Phase 6**: 3 hours
- **Phase 7**: 2 hours
- **Total**: ~18 hours

**Timeline**: 5-7 calendar days (assuming parallel work on phases 2-5)

---

## Post-Migration Validation

### Daily Checks (First Week)
```sql
-- Check for new NULL values
SELECT COUNT(*) as null_avatars FROM battlers WHERE avatar_url IS NULL;
SELECT COUNT(*) as null_icons FROM badge_costs WHERE icon_url IS NULL;
SELECT COUNT(*) as null_logos FROM leagues WHERE logo_url IS NULL;
SELECT COUNT(*) as null_backgrounds FROM cities WHERE background_url IS NULL;

-- Verify image paths are reachable
SELECT DISTINCT SUBSTRING(avatar_url, 1, 30) FROM battlers LIMIT 5;
```

### Weekly Checks (First Month)
```sql
-- Query coverage by category
SELECT * FROM check_image_url_coverage();

-- Monitor database growth
SELECT pg_size_pretty(pg_total_relation_size('battlers'));
SELECT pg_size_pretty(pg_total_relation_size('badge_costs'));

-- API response times
-- (Monitor via application metrics)
```

### Monthly Checks
- Review image delivery performance
- Check for broken image references
- Validate cache hit rates (if using CDN)
- Plan for future sprite additions

---

## Documentation Updates

After completion, update these documents:
- [ ] README.md: Add image serving section
- [ ] API.md: Document new image URL fields
- [ ] CLAUDE.md: Update database schema section
- [ ] Database schema diagrams (if exists)
- [ ] Deployment checklist

---

## Rollback Plan

If critical issues discovered:

```bash
# 1. Stop application
# 2. Restore database from backup
# 3. Revert migration

supabase db reset

# 4. Investigate issue
# 5. Fix and re-apply migration
```

Estimated rollback time: 15 minutes

---

## Dependencies & Prerequisites

### Required
- Supabase local environment running
- Supabase CLI installed
- TypeScript/Node.js environment
- Database backup taken
- All sprite files in `/public/sprites/`

### Optional
- Postman/Insomnia for API testing
- Image viewer (verify sprite files)
- Database GUI tool (optional)

---

## Next Steps

1. **Review** all 5 deliverable documents
2. **Assign** resources to each phase
3. **Verify** sprite directory integrity
4. **Apply** Phase 1 migration
5. **Execute** BULK_ATTACH_SCRIPT.ts with --dry-run
6. **Review** results and adjust as needed
7. **Execute** actual attachment
8. **Validate** results
9. **Update** API endpoints
10. **Deploy** to staging/production

---

## Support & Troubleshooting

### Issues During Execution

**Q: Script says "No matches found"**
A: Check naming consistency between database and sprite files. Run with --verbose for detailed output.

**Q: Database migration failed**
A: Check migration logs: `supabase status`. Verify database is running. Try again with --verbose.

**Q: Image URLs in database but images not loading**
A: Verify files exist at paths: `ls -la [path]`. Check file permissions. Verify Next.js public folder included in build.

**Q: Uneven distribution across demographics**
A: Expected - crowd sprites were randomly generated. Use reaction categories for variety, not demographics exclusively.

---

## Conclusion

This implementation plan provides a complete, phased approach to attaching 1,856 sprite images to the BattleRap University database with:

- **Zero breaking changes** to existing code
- **Backward compatible** API responses
- **Future-proof** storage strategy (can migrate to Supabase Storage later)
- **Comprehensive** validation and testing
- **Clear** success criteria and rollback plans

**Estimated completion**: 1 Sprint (5-7 days)

**Risk level**: Low (mostly data operations, no logic changes)

**Next action**: Apply Phase 1 migration and begin Phase 2 ➜
