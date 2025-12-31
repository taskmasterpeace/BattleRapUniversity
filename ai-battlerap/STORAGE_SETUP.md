# Supabase Storage Setup Guide

This document provides instructions for setting up Supabase Storage buckets required for the battler image upload system.

## Overview

The image upload system uses two Supabase Storage buckets:
- `battler-avatars`: For profile avatars (400x400px recommended, max 5MB)
- `battler-banners`: For profile banners (1200x300px recommended, max 10MB)

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for Local Development)

1. **Start Supabase locally** (if not already running):
   ```bash
   cd ai-battlerap
   npm run supabase:start
   ```

2. **Access Supabase Studio**:
   - Open `http://127.0.0.1:54323` in your browser
   - Navigate to **Storage** in the left sidebar

3. **Create Buckets**:

   **For `battler-avatars`:**
   - Click "Create bucket"
   - Bucket name: `battler-avatars`
   - Public bucket: **Yes** (check the box)
   - File size limit: `5242880` (5MB in bytes)
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
   - Click "Create bucket"

   **For `battler-banners`:**
   - Click "Create bucket"
   - Bucket name: `battler-banners`
   - Public bucket: **Yes** (check the box)
   - File size limit: `10485760` (10MB in bytes)
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
   - Click "Create bucket"

4. **Set up Storage Policies** (Optional - for additional security):

   For each bucket, you can add Row Level Security (RLS) policies:

   **Public Read Policy (Already enabled by making bucket public):**
   - Policy name: `Public Access`
   - SELECT: `true` (anyone can view)

   **Authenticated Upload Policy:**
   - Policy name: `Authenticated users can upload`
   - INSERT: `auth.role() = 'authenticated'`

   **Owner-only Update/Delete Policy:**
   - Policy name: `Users can manage their own images`
   - UPDATE/DELETE:
     ```sql
     auth.uid() = (
       SELECT user_id
       FROM battlers
       WHERE id = (storage.foldername(name))[1]::uuid
     )
     ```

### Option 2: Using Supabase CLI

If you prefer using the CLI, you can create buckets programmatically:

```bash
# Make sure you're in the ai-battlerap directory
cd ai-battlerap

# Create battler-avatars bucket
npx supabase storage create battler-avatars --public

# Create battler-banners bucket
npx supabase storage create battler-banners --public
```

Note: File size limits and MIME type restrictions may need to be configured via the dashboard or SQL.

### Option 3: Using SQL (Advanced)

You can also create buckets using SQL in the Supabase SQL Editor:

```sql
-- Create battler-avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'battler-avatars',
  'battler-avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create battler-banners bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'battler-banners',
  'battler-banners',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

## Production Setup

For production deployment, follow the same steps but access your production Supabase project:

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to Storage
4. Create the buckets as described above

## Verification

To verify the buckets are set up correctly:

1. **Check bucket exists**:
   - In Supabase Studio → Storage, you should see both buckets listed

2. **Test upload** (optional):
   - Navigate to `http://localhost:3000/settings/profile` (after starting the dev server)
   - Try uploading an avatar or banner image
   - Check if the image appears in the Supabase Storage bucket

3. **Check policies**:
   - In Supabase Studio → Storage → [bucket name] → Policies
   - Ensure public read access is enabled

## Troubleshooting

### Issue: "Bucket not found" error when uploading

**Solution**: Make sure the bucket names match exactly:
- `battler-avatars` (not `battler_avatars` or `battlers-avatars`)
- `battler-banners` (not `battler_banners` or `battlers-banners`)

### Issue: "Access denied" error

**Solution**:
1. Verify the bucket is set to public
2. Check that RLS policies allow authenticated users to upload
3. Ensure you're logged in (dev mode auto-logs in as `dev@test.com`)

### Issue: "File too large" error

**Solution**:
- Avatars must be ≤ 5MB
- Banners must be ≤ 10MB
- Use the built-in client-side validation or resize images before uploading

### Issue: Images not displaying after upload

**Solution**:
1. Check that the public URL is correctly generated
2. Verify CORS settings allow your Next.js app domain
3. Ensure the `avatar_url` or `banner_url` field is updated in the `battlers` table

## Storage Limits

### Local Development (Supabase Docker)
- No practical storage limits for local development
- Files are stored in Docker volumes

### Production (Supabase Cloud)
- Free tier: 1GB storage
- Pro tier: 100GB storage (expandable)
- See [Supabase Pricing](https://supabase.com/pricing) for current limits

## File Naming Convention

Files are stored with the following naming pattern:
```
{battler_id}-{timestamp}.{extension}

Example:
550e8400-e29b-41d4-a716-446655440000-1701234567890.jpg
```

This ensures:
- Unique filenames (no collisions)
- Easy tracking of which battler owns which image
- Automatic cleanup when images are replaced

## Security Considerations

1. **File Type Validation**: Only JPEG, PNG, and WebP are allowed (validated both client-side and server-side)
2. **File Size Limits**: Enforced at multiple levels (client, API, storage bucket)
3. **Authentication**: Only authenticated users can upload images
4. **Ownership**: Users can only modify images for their own battler
5. **Public Access**: Images are publicly readable (as they appear in battles/tournaments)

## Migration Notes

The database migration `20251130051000_add_battler_images.sql` adds the required columns:
- `battlers.avatar_url` (TEXT, nullable)
- `battlers.banner_url` (TEXT, nullable)

Run the migration:
```bash
cd ai-battlerap
npm run supabase:reset  # Resets DB and applies all migrations
```

Or apply just this migration:
```bash
npx supabase db reset --local
```

## API Endpoints

The image upload system provides the following endpoints:

- `POST /api/battler/upload-image`: Upload avatar or banner
- `POST /api/battler/delete-image`: Delete avatar or banner

Both endpoints require authentication and automatically manage the battler's images.

## Components

The following components are available for use:

- `<BattlerAvatar>`: Display avatar with fallback to initials
- `<BattlerBanner>`: Display banner with gradient fallback
- `<ImageUpload>`: Full upload UI with drag-and-drop

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Optimization Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing/images)
