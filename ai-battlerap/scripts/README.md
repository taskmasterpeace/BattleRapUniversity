# Scripts Directory

This directory contains utility scripts for managing the Battle Rap University game.

## Available Scripts

### mapBadgeSprites.ts

Maps badge sprite images to badge records in the database.

**Purpose**: Populates the `icon_url` field in the `badge_costs` table with paths to badge sprite images.

**Usage**:
```bash
cd ai-battlerap

# With local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
npx tsx scripts/mapBadgeSprites.ts

# Or load from .env.local
source .env.local
npx tsx scripts/mapBadgeSprites.ts
```

**What it does**:
1. Fetches all 76 badges from the `badge_costs` table
2. Maps each `badge_code` to its corresponding sprite file path
3. Updates the `icon_url` field in the database
4. Verifies all badges have valid sprite paths
5. Reports mapping statistics

**Status**: ✅ Completed - All 76 badges mapped successfully

**Results**: See `BADGE_SPRITE_MAPPING_RESULTS.md` for detailed mapping information.

## Script Development Guidelines

When creating new scripts:

1. **TypeScript**: Use TypeScript for type safety
2. **Supabase Client**: Use service role client for admin operations
3. **Error Handling**: Include proper error handling and logging
4. **Verification**: Always verify changes after execution
5. **Documentation**: Update this README and create a results document
6. **Environment**: Load environment variables from `.env.local`

## Environment Variables

Scripts typically need:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (bypasses RLS)

For local development, these are in `ai-battlerap/.env.local`.
