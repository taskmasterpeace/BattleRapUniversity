# Storage Bucket Setup Guide

## Overview

This document outlines two strategies for serving 1,856 sprite images:

1. **Option A: Static Public URLs (RECOMMENDED FOR V1)**
2. **Option B: Supabase Storage Buckets (RECOMMENDED FOR V2+)**

---

## Option A: Static Public URLs (CURRENT RECOMMENDATION)

### Advantages
- Zero database overhead
- Maximum performance (browser caching, CDN-friendly)
- Works immediately with existing Next.js public folder
- No upload/sync complexity
- Simplest implementation

### Disadvantages
- No access control
- Cannot track usage/analytics
- Sprites tied to file system
- Bulk operations require file system changes

### Implementation

#### 1. URL Pattern
All sprites accessible via relative paths from public folder:

```
https://battlerapuniversity.com/sprites/characters/[subdir]/[name].png
https://battlerapuniversity.com/sprites/badges/[subdir]/badge_001.png
https://battlerapuniversity.com/sprites/leagues/[subdir]/league_001.png
https://battlerapuniversity.com/sprites/cities/[region]/[city].png
https://battlerapuniversity.com/sprites/crowd/[reaction]/[name].png
```

#### 2. Database Storage
```sql
-- Battler avatar
UPDATE battlers SET avatar_url = '/sprites/characters/image_1764146494580/tru_foe.png'
WHERE id = 'some-uuid';

-- Badge icon
UPDATE badge_costs SET icon_url = '/sprites/badges/image_1764193677602/badge_041.png'
WHERE badge_code = 'wordplay_wizard';

-- League logo
UPDATE leagues SET logo_url = '/sprites/leagues/image_1764195526092/small_room_circuit.png'
WHERE short_code = 'SRC';

-- City background
UPDATE cities SET background_url = '/sprites/cities/east-coast/new_york_city.png'
WHERE name = 'New York City';

-- Crowd reaction
INSERT INTO crowd_reactions (sprite_url, ...)
VALUES ('/sprites/crowd/hype/crowd_black_hype_001.png', ...);
```

#### 3. Next.js Configuration
No special configuration needed - sprite files are already in `public/` directory.

#### 4. API Responses
```typescript
// Example API endpoint response
interface BattlerResponse {
  id: string;
  stage_name: string;
  avatar_url: string; // e.g., "/sprites/characters/.../tru_foe.png"
}

// Usage in API route:
const { data: battler } = await supabase
  .from('battlers')
  .select('id, stage_name, avatar_url')
  .eq('id', battleId)
  .single();

// Returns:
{
  id: "uuid-123",
  stage_name: "Tru Foe",
  avatar_url: "/sprites/characters/image_1764146494580/tru_foe.png"
}
```

#### 5. Frontend Usage
```typescript
// React component
<img
  src={battler.avatar_url}
  alt={battler.stage_name}
  className="w-32 h-32 rounded-lg"
/>

// Next Image component
import Image from 'next/image';

<Image
  src={battler.avatar_url}
  alt={battler.stage_name}
  width={128}
  height={128}
/>
```

#### 6. Deployment Considerations
- Ensure `/public/sprites/` directory is included in build
- No secret access required
- Sprites automatically served by Next.js static handler
- Consider CDN caching headers in `next.config.js`:

```javascript
// next.config.js
module.exports = {
  headers: async () => {
    return [
      {
        source: '/sprites/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year cache
          },
        ],
      },
    ];
  },
};
```

---

## Option B: Supabase Storage Buckets (FUTURE OPTION)

### Advantages
- Built-in access control (can restrict who sees certain images)
- CDN delivery via Supabase edge network
- Usage analytics and bandwidth tracking
- Automatic backups
- Organized by category/tenant
- Can implement signed URLs for temporary access

### Disadvantages
- Additional setup complexity
- Storage costs (though minimal for images)
- Requires upload/sync process
- Slightly slower first-load than static files

### Implementation (NOT REQUIRED FOR V1)

#### 1. Create Storage Buckets (via Supabase CLI)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Create project-level buckets
supabase storage create-bucket sprites --public

# Create category buckets (optional, for organization)
supabase storage create-bucket sprites-characters --public
supabase storage create-bucket sprites-badges --public
supabase storage create-bucket sprites-leagues --public
supabase storage create-bucket sprites-cities --public
supabase storage create-bucket sprites-crowd --public
```

#### 2. Create Buckets via SQL

If CLI isn't available, create via direct SQL:

```sql
-- Create main sprites bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('sprites', 'sprites', true);

-- Create category buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('sprites-characters', 'sprites-characters', true),
  ('sprites-badges', 'sprites-badges', true),
  ('sprites-leagues', 'sprites-leagues', true),
  ('sprites-cities', 'sprites-cities', true),
  ('sprites-crowd', 'sprites-crowd', true);

-- Set bucket policies for public read access
CREATE POLICY "Public sprite access" ON storage.objects
  FOR SELECT USING (bucket_id LIKE 'sprites%');

CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id LIKE 'sprites%'
  );
```

#### 3. Upload Sprites (Batch Script)

```typescript
// scripts/upload-sprites-to-storage.ts
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function uploadSprites() {
  const spritesRoot = "public/sprites";
  const categories = ["characters", "badges", "leagues", "cities", "crowd"];

  for (const category of categories) {
    const categoryPath = path.join(spritesRoot, category);
    const files = fs.readdirSync(categoryPath, { recursive: true });

    for (const file of files) {
      if (!file.toString().endsWith(".png")) continue;

      const filePath = path.join(categoryPath, file.toString());
      const fileBuffer = fs.readFileSync(filePath);
      const remoteFilePath = `${category}/${file}`;

      const { error } = await supabase.storage
        .from("sprites")
        .upload(remoteFilePath, fileBuffer, {
          cacheControl: "31536000", // 1 year
          upsert: true,
        });

      if (error) {
        console.error(`Failed to upload ${remoteFilePath}:`, error);
      } else {
        console.log(`Uploaded: ${remoteFilePath}`);
      }
    }
  }
}

uploadSprites();
```

#### 4. URL Generation

```typescript
// Supabase storage URLs follow pattern:
// https://[PROJECT_ID].supabase.co/storage/v1/object/public/[BUCKET]/[PATH]

// Example:
const battlerAvatarUrl = supabase.storage
  .from("sprites")
  .getPublicUrl("characters/image_1764146494580/tru_foe.png").data.publicUrl;

// Returns:
// https://abcdefg.supabase.co/storage/v1/object/public/sprites/characters/image_1764146494580/tru_foe.png

// For signed URLs (temporary access):
const { data } = supabase.storage
  .from("sprites")
  .createSignedUrl("characters/image_1764146494580/tru_foe.png", 3600); // 1 hour expiry

// Returns: { signedUrl: "https://...", error: null }
```

#### 5. Database Storage (Storage URLs)

```sql
-- Same structure as Option A, but with Supabase URLs:
UPDATE battlers SET avatar_url =
  'https://[PROJECT].supabase.co/storage/v1/object/public/sprites/characters/image_1764146494580/tru_foe.png'
WHERE id = 'uuid-123';

-- Or store relative path and construct URL in app:
UPDATE battlers SET avatar_url = 'characters/image_1764146494580/tru_foe.png';

-- Then in code:
const fullUrl = supabase.storage.from("sprites").getPublicUrl(battler.avatar_url).data.publicUrl;
```

#### 6. Signed URLs for Restricted Access

```typescript
// If you wanted to restrict image access:
CREATE POLICY "Users can only see their battler images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'sprites' AND
    auth.uid() IN (
      SELECT user_id FROM battlers
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

// Then generate signed URLs:
async function getBattlerImage(battlerId: string) {
  const { data, error } = await supabase.storage
    .from("sprites")
    .createSignedUrl(`characters/${battlerId}.png`, 300); // 5 min expiry

  return data?.signedUrl;
}
```

---

## Migration Path: Option A → Option B

If starting with Option A and later migrating to Option B:

### Step 1: Upload all existing files
```bash
npm run upload-sprites-to-supabase
```

### Step 2: Verify uploads completed
```sql
SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'sprites';
-- Should return: 1856
```

### Step 3: Update database URLs
```typescript
// Update stored URLs to use Supabase paths
const PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_URL.split('.')[0];
const BASE_URL = `https://${PROJECT_ID}.supabase.co/storage/v1/object/public/sprites`;

// Battlers
UPDATE battlers
SET avatar_url = CONCAT('${BASE_URL}/', SUBSTRING(avatar_url, 10))
WHERE avatar_url LIKE '/sprites/%';

// Similarly for other tables...
```

### Step 4: Test and verify
- Check that all images load correctly
- Verify no broken links
- Test caching behavior

### Step 5: Remove static files (optional)
- Once fully migrated, can remove `/public/sprites/` to save disk space
- Keep in VCS for backup

---

## Comparison Table

| Aspect | Option A (Static) | Option B (Storage) |
|--------|-------------------|-------------------|
| **Setup Time** | 5 minutes | 30 minutes |
| **Cost** | Disk space | ~$5-10/month |
| **Performance** | Excellent (instant CDN) | Good (Supabase CDN) |
| **Access Control** | None | Advanced |
| **Analytics** | Manual | Built-in |
| **Scalability** | Limited by disk | Unlimited |
| **Deployment** | Include in build | Upload separately |
| **V1 Recommended** | ✅ YES | ⏳ No (future) |

---

## Recommendation for V1

**Use Option A (Static Public URLs)**

### Reasoning:
1. All 1,856 sprites are already in `/public/sprites/`
2. Zero additional setup required
3. Maximum performance for V1 scope
4. Can migrate to Option B later without code changes (just update URLs)
5. Reduces operational complexity during launch

### Implementation Checklist:
- [ ] Apply migration: `20251201000000_add_sprite_image_columns.sql`
- [ ] Execute bulk attachment: `IMAGE_ATTACHMENT_MIGRATION.sql`
- [ ] Run validation: `check_image_url_coverage()`
- [ ] Update API responses to include `*_url` columns
- [ ] Test image loading in browser
- [ ] Configure cache headers in `next.config.js`
- [ ] Deploy and verify on staging

---

## CDN Configuration (Next.js)

### Vercel Deployment (Recommended)

Images on Vercel are automatically served via their global CDN:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: [], // Static files don't need domain config
    formats: ['image/webp', 'image/avif'], // Optional: enable modern formats
  },
  headers: async () => {
    return [
      {
        source: '/sprites/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Self-Hosted Deployment

If self-hosting, add cache headers to server:

```nginx
# nginx.conf
location /sprites/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Troubleshooting

### Images Not Loading
1. Verify file paths in database match actual files
2. Check that `/public/sprites/` exists in deployed build
3. Verify image file exists: `ls /public/sprites/characters/*/tru_foe.png`

### Broken Links in Database
```sql
-- Find records with invalid URLs
SELECT * FROM battlers WHERE avatar_url IS NULL OR avatar_url = '';
SELECT * FROM leagues WHERE logo_url IS NULL OR logo_url = '';
SELECT * FROM cities WHERE background_url IS NULL OR background_url = '';
SELECT * FROM badge_costs WHERE icon_url IS NULL OR icon_url = '';
```

### Slow Image Loading
1. Enable CDN caching (see CDN Configuration)
2. Consider optimizing image file sizes (PNGs are large)
3. Monitor browser network tab for slow requests

---

## Summary

**V1 Implementation**: Use static public URLs from `/public/sprites/`

**Database Schema**: Columns added to store relative paths (`/sprites/...`)

**Performance**: Excellent (browser native file caching + CDN)

**Cost**: Zero (files already on disk)

**Future Migration**: Can switch to Supabase Storage without code changes

**Next Step**: Apply migration and run bulk attachment script
