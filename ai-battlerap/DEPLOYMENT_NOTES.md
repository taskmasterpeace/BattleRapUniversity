# Battle Rap University - Deployment Notes

**Version**: 1.0
**Last Updated**: November 30, 2025
**Status**: Pre-Production

---

## Overview

This document provides critical information for deploying Battle Rap University to production and monitoring it post-launch.

---

## PRE-DEPLOYMENT CHECKLIST

### 1. Environment Configuration

#### Supabase Production Project

- [ ] **Create Production Project**
  - Go to supabase.com/dashboard
  - Click "New Project"
  - Name: "Battle Rap University - Production"
  - Region: Closest to target users (US East recommended for US users)
  - Database password: Strong, save to password manager

- [ ] **Apply Migrations**
  ```bash
  # Link to production project
  npx supabase link --project-ref [your-project-ref]

  # Push migrations
  npx supabase db push
  ```
  **Expected**: All 7 migrations applied successfully

- [ ] **Run Seed Data**
  ```bash
  # Option 1: Via Supabase SQL Editor
  # Copy contents of supabase/seed.sql
  # Paste into SQL Editor
  # Execute

  # Option 2: Via CLI (if configured)
  npx supabase db reset --db-url [your-production-url]
  ```
  **Verification**: Check `leagues` and `battlers` tables have data

- [ ] **Enable RLS**
  - Go to Supabase Dashboard → Authentication → Policies
  - Verify all tables have RLS policies enabled
  - Test policies don't block legitimate queries

- [ ] **Configure Auth**
  - Go to Authentication → Settings
  - Email Templates: Customize magic link email
  - Site URL: Set to production domain
  - Redirect URLs: Add production URLs

#### Vercel Deployment

- [ ] **Connect GitHub Repository**
  - Go to vercel.com/dashboard
  - Click "New Project"
  - Import from GitHub
  - Select `battlerapuniversity` repo
  - Root directory: `ai-battlerap/`

- [ ] **Set Environment Variables**
  ```env
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
  SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

  # App
  NEXT_PUBLIC_APP_URL=https://[your-domain].com
  INTERNAL_API_SECRET=[generate-random-string-here]

  # Optional: Analytics
  NEXT_PUBLIC_GA_ID=[google-analytics-id]
  ```

- [ ] **Configure Build Settings**
  - Framework Preset: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
  - Node Version: 20.x

- [ ] **Set Up Custom Domain** (Optional)
  - Add domain in Vercel dashboard
  - Update DNS records as instructed
  - Enable SSL (automatic with Vercel)

### 2. Cron Jobs / Scheduled Tasks

**CRITICAL**: Battle offers and simulations rely on scheduled tasks.

#### Option A: Vercel Cron (Recommended)

Create `vercel.json` in project root:
```json
{
  "crons": [
    {
      "path": "/api/internal/generate-battle-offers",
      "schedule": "0 12 * * *"
    },
    {
      "path": "/api/internal/run-due-battles",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Headers**: Must include `Authorization: Bearer [INTERNAL_API_SECRET]`

**Note**: Vercel Cron requires Pro plan ($20/month)

#### Option B: External Cron (Free Alternative)

Use cron-job.org or similar:

1. Create account at cron-job.org
2. Add job: "Generate Battle Offers"
   - URL: `https://[your-domain]/api/internal/generate-battle-offers`
   - Schedule: Daily at 12:00 UTC
   - HTTP Method: POST
   - Header: `Authorization: Bearer [INTERNAL_API_SECRET]`

3. Add job: "Run Due Battles"
   - URL: `https://[your-domain]/api/internal/run-due-battles`
   - Schedule: Every 5 minutes
   - HTTP Method: POST
   - Header: `Authorization: Bearer [INTERNAL_API_SECRET]`

#### Option C: Supabase pg_cron (Advanced)

Use Supabase's built-in cron:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule battle offers (daily at 12:00 UTC)
SELECT cron.schedule(
  'generate-battle-offers',
  '0 12 * * *',
  $$
  SELECT net.http_post(
    url:='https://[your-domain]/api/internal/generate-battle-offers',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [INTERNAL_API_SECRET]"}'::jsonb
  )
  $$
);

-- Schedule battle simulations (every 5 minutes)
SELECT cron.schedule(
  'run-due-battles',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://[your-domain]/api/internal/run-due-battles',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [INTERNAL_API_SECRET]"}'::jsonb
  )
  $$
);
```

### 3. Monitoring & Logging

#### Error Tracking (Recommended: Sentry)

- [ ] **Install Sentry**
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

- [ ] **Configure Sentry**
  ```javascript
  // sentry.client.config.ts
  import * as Sentry from "@sentry/nextjs";

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
  ```

- [ ] **Set Environment Variable**
  ```env
  NEXT_PUBLIC_SENTRY_DSN=[your-sentry-dsn]
  ```

#### Supabase Logging

- [ ] **Enable Logs**
  - Go to Supabase Dashboard → Logs
  - Enable query logging (useful for debugging)
  - Set retention: 7 days minimum

- [ ] **Set Up Alerts**
  - Go to Project Settings → Alerts
  - Enable:
    - Database CPU > 80%
    - Database memory > 80%
    - Error rate spike

#### Analytics (Optional: Google Analytics or Plausible)

- [ ] **Install Analytics**
  ```bash
  # For Google Analytics
  npm install @next/third-parties
  ```

- [ ] **Add Tracking Code**
  ```javascript
  // app/layout.tsx
  import { GoogleAnalytics } from '@next/third-parties/google'

  export default function RootLayout({ children }) {
    return (
      <html>
        <body>{children}</body>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </html>
    )
  }
  ```

### 4. Database Backups

- [ ] **Enable Supabase Automatic Backups**
  - Go to Database → Backups
  - Enable automatic daily backups
  - Retention: 7 days (free tier) or 30 days (pro)

- [ ] **Test Backup Restore** (Before Launch!)
  - Download a backup
  - Restore to test project
  - Verify data integrity

### 5. Security Audit

- [ ] **Verify RLS Policies**
  ```sql
  -- Test: User A can't access User B's data
  -- Login as User A
  SELECT * FROM battlers WHERE user_id != '[user A id]' AND is_ai = false;
  -- Should return 0 rows
  ```

- [ ] **Check API Secrets**
  - Ensure `INTERNAL_API_SECRET` is strong (32+ characters)
  - Verify it's not exposed in client code
  - Test internal APIs reject requests without secret

- [ ] **Input Validation**
  - Test XSS: Try `<script>alert('xss')</script>` in battler name
  - Test SQL injection: Try `'; DROP TABLE users; --` in inputs
  - All should be sanitized/escaped

- [ ] **Rate Limiting** (Optional but recommended)
  - Add rate limiting to API routes
  - Use Vercel's Edge Config or Upstash Redis
  - Example: 100 requests per minute per IP

---

## DEPLOYMENT PROCEDURE

### Step 1: Final Code Review

```bash
# Ensure all changes committed
git status

# Run tests (if implemented)
npm test

# Build locally to catch errors
npm run build

# Check for console.logs (should remove for production)
grep -r "console.log" app/ lib/ components/
```

### Step 2: Deploy to Vercel

```bash
# Option A: Automatic (recommended)
git push origin main
# Vercel auto-deploys on push

# Option B: Manual via CLI
npm install -g vercel
vercel --prod
```

### Step 3: Verify Deployment

- [ ] **Check Deployment Logs**
  - Go to Vercel Dashboard → Deployments
  - Click latest deployment
  - Check build logs for errors

- [ ] **Test Production URL**
  ```bash
  curl https://[your-domain].com
  # Should return HTML
  ```

- [ ] **Smoke Test**
  - Visit `/login`
  - Visit `/dashboard` (should redirect to login)
  - Visit `/api/debug` (if enabled)

### Step 4: Seed Production Data

- [ ] **Verify Seed Data**
  ```sql
  SELECT COUNT(*) FROM leagues;
  -- Should return: 2

  SELECT COUNT(*) FROM battlers WHERE is_ai = true;
  -- Should return: 28
  ```

- [ ] **Create Test User**
  - Signup via `/login`
  - Create battler
  - Accept battle
  - Verify flow works end-to-end

### Step 5: Enable Cron Jobs

- [ ] **Test Cron Manually**
  ```bash
  curl -X POST https://[your-domain]/api/internal/generate-battle-offers \
    -H "Authorization: Bearer [INTERNAL_API_SECRET]"
  # Should return: {"success": true, "offersGenerated": X}
  ```

- [ ] **Enable Scheduled Tasks**
  - If using Vercel Cron: Commit `vercel.json`, redeploy
  - If using external: Enable jobs on cron-job.org
  - If using pg_cron: Run SQL commands above

- [ ] **Verify Cron Execution**
  - Wait 5 minutes
  - Check database for new battle offers
  - Check Vercel logs for cron execution

---

## POST-LAUNCH MONITORING

### First 24 Hours

#### Critical Metrics to Watch

**System Health**:
- [ ] Monitor Vercel deployment status (should stay green)
- [ ] Monitor Supabase database CPU/memory (should stay <50%)
- [ ] Monitor error rate (Sentry dashboard)
- [ ] Check cron job execution logs

**User Activity**:
- [ ] New user signups
- [ ] Battler creations
- [ ] Battles accepted
- [ ] Battles completed
- [ ] Life events triggered

**Database Queries**:
- [ ] Slow query log (Supabase dashboard)
- [ ] Connection pool usage (should not max out)
- [ ] RLS policy performance

#### Hourly Checks (First 6 Hours)

**Every hour, verify**:
1. No 500 errors in Vercel logs
2. No critical errors in Sentry
3. New users can signup
4. Battles are simulating on schedule
5. Notifications are being created

#### Common Issues in First 24 Hours

**Issue**: Cron jobs not running
- **Check**: Vercel Cron logs or external cron service
- **Fix**: Verify Authorization header is set correctly

**Issue**: Database connection errors
- **Check**: Supabase connection pool usage
- **Fix**: Increase pool size in Supabase settings (or upgrade plan)

**Issue**: Slow page loads
- **Check**: Vercel analytics for TTFB (Time to First Byte)
- **Fix**: Enable Vercel Edge caching, optimize database queries

**Issue**: High error rate
- **Check**: Sentry for error patterns
- **Fix**: Hotfix and redeploy, or rollback to previous version

### Week 1 Monitoring

#### Daily Checks

- [ ] **User Growth**
  - New signups per day
  - Retention rate (D1, D7)
  - Churn rate

- [ ] **Battle Statistics**
  - Battles per user (average)
  - Choke rate (should be ~7%)
  - Body rate (should be 20-30%)
  - Upset rate (should be 15-25%)

- [ ] **Performance Metrics**
  - Average page load time
  - API response times
  - Database query performance

- [ ] **Error Tracking**
  - Total errors per day
  - Unique errors
  - Critical vs warnings

#### Red Flags to Watch For

🚨 **Immediate Action Required**:
- Error rate >5% of requests
- Database CPU >90%
- Cron jobs failing
- Data corruption (NaN values, null winners)

⚠️ **Investigate Soon**:
- Choke rate >15% or <3%
- Page load time >3 seconds
- User retention <20% D1
- Signup abandonment >50%

✅ **Good to Know**:
- Slow queries (>500ms)
- Feature usage patterns
- Popular leagues/styles

---

## ROLLBACK PROCEDURE

If critical issues arise, follow this rollback plan:

### Emergency Rollback (5 minutes)

1. **Revert Vercel Deployment**
   - Go to Vercel Dashboard → Deployments
   - Find last known good deployment
   - Click "..." → "Promote to Production"

2. **Notify Users** (if possible)
   - Add banner to site: "We're experiencing technical difficulties. Working on a fix."
   - Post on social media (if exists)
   - Email users (if email collection implemented)

3. **Investigate**
   - Check Sentry for error patterns
   - Review Vercel logs
   - Check Supabase logs
   - Identify root cause

### Database Rollback (15 minutes)

⚠️ **Use only if data corruption occurred**

1. **Stop All Writes**
   - Disable cron jobs
   - Put site in maintenance mode (if implemented)

2. **Restore Backup**
   - Go to Supabase Dashboard → Backups
   - Select backup from before issue
   - Click "Restore"

3. **Re-apply Migrations** (if needed)
   ```bash
   npx supabase db push
   ```

4. **Verify Data Integrity**
   ```sql
   SELECT COUNT(*) FROM battlers;
   SELECT COUNT(*) FROM battles;
   SELECT COUNT(*) FROM rankings;
   ```

5. **Resume Operations**
   - Re-enable cron jobs
   - Remove maintenance mode
   - Monitor closely

---

## PERFORMANCE OPTIMIZATION

### If Page Loads Are Slow

**Dashboard Optimization**:
```typescript
// Already implemented in DashboardClient.tsx
// Uses Promise.all() for parallel queries
const [battler, nextBattle, recentBattles, ...] = await Promise.all([...]);
```

**Battle Results Optimization**:
- Add database index on `battles.scheduled_at`
- Add database index on `battle_segments.battle_id`
- Enable Next.js static generation for completed battles

**API Caching**:
```typescript
// Add to API routes
export const revalidate = 60; // Cache for 60 seconds
```

### If Database is Slow

**Add Indexes**:
```sql
-- Already should exist, but verify
CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_scheduled ON battles(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_battlers_user_id ON battlers(user_id);
CREATE INDEX IF NOT EXISTS idx_prep_blocks_battle ON prep_blocks(battle_id);
```

**Optimize Queries**:
- Use `select('specific, columns')` instead of `select('*')`
- Add `limit()` to all list queries
- Use `count()` instead of fetching all rows for counts

---

## SCALING CONSIDERATIONS

### Expected Load

**Assumptions for 1000 active users**:
- 500 battles/day
- 5000 API requests/day
- 100 MB database size
- 1 GB bandwidth/day

**This fits within**:
- Supabase Free Tier (up to 500 MB DB, 2 GB bandwidth)
- Vercel Hobby Tier (100 GB bandwidth)

### When to Upgrade

**Upgrade Supabase to Pro ($25/mo) when**:
- Database size >400 MB
- Bandwidth >1.5 GB/month
- Need longer backup retention

**Upgrade Vercel to Pro ($20/mo) when**:
- Bandwidth >80 GB/month
- Need Vercel Cron (for scheduled tasks)
- Need advanced analytics

### Scaling Strategy

**Phase 1** (0-1000 users):
- Free/Hobby tiers
- External cron jobs
- Basic monitoring

**Phase 2** (1000-10,000 users):
- Supabase Pro
- Vercel Pro
- Sentry Pro
- Advanced caching

**Phase 3** (10,000+ users):
- Database read replicas
- CDN for static assets
- Redis for caching
- Load balancing

---

## MAINTENANCE WINDOWS

### Planned Maintenance

**Best Time**: Tuesday 2-4 AM EST (lowest traffic)

**Procedure**:
1. Announce 24 hours in advance (if possible)
2. Enable maintenance mode:
   ```typescript
   // Add to middleware.ts
   if (process.env.MAINTENANCE_MODE === 'true') {
     return new Response('Maintenance in progress...', { status: 503 });
   }
   ```
3. Perform updates
4. Test thoroughly
5. Disable maintenance mode
6. Announce completion

### Emergency Maintenance

**Procedure**:
1. Immediate announcement on site
2. Rollback to last good version
3. Fix issue in development
4. Deploy fix
5. Monitor closely

---

## CONTACT & ESCALATION

### Key Services

**Vercel Support**:
- Dashboard: vercel.com/support
- Response time: 24-48 hours (Hobby), <4 hours (Pro)

**Supabase Support**:
- Dashboard: supabase.com/dashboard/support
- Discord: supabase.com/discord
- Response time: 24-48 hours (Free), <8 hours (Pro)

**Sentry Support**:
- Dashboard: sentry.io/support
- Docs: docs.sentry.io

### Internal Escalation

**Critical Issues** (site down, data loss):
1. Rollback immediately
2. Alert development team
3. Post mortem after resolution

**High Priority** (degraded performance, errors):
1. Create GitHub issue
2. Investigate within 24 hours
3. Deploy fix within 48 hours

**Medium Priority** (UX issues, minor bugs):
1. Add to backlog
2. Fix in next sprint
3. Deploy with next release

---

## LAUNCH DAY CHECKLIST

**T-24 Hours**:
- [ ] Final code review completed
- [ ] All tests passing
- [ ] Staging environment tested
- [ ] Team briefed on launch plan

**T-6 Hours**:
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Run smoke tests
- [ ] Enable monitoring

**T-1 Hour**:
- [ ] Test user signup flow
- [ ] Test battle simulation
- [ ] Verify cron jobs enabled
- [ ] Check error logs (should be empty)

**T-0 (Launch)**:
- [ ] Announce on social media
- [ ] Start YouTube ad campaign
- [ ] Monitor dashboards closely

**T+1 Hour**:
- [ ] Check first user signups
- [ ] Verify no critical errors
- [ ] Monitor performance metrics

**T+6 Hours**:
- [ ] Full system check
- [ ] Review error logs
- [ ] Check user feedback (if any)
- [ ] Adjust if needed

**T+24 Hours**:
- [ ] Post-launch review
- [ ] Collect metrics
- [ ] Plan next iteration

---

## SUCCESS METRICS

### Launch Week Goals

**User Acquisition**:
- 100+ signups
- 50+ battlers created
- 200+ battles completed

**Technical Performance**:
- 99%+ uptime
- <2s average page load
- <1% error rate

**User Engagement**:
- 40%+ D1 retention
- 5+ battles per active user
- 20%+ life event engagement

**Business Metrics** (if monetization enabled):
- Track conversion rate
- Track revenue per user
- Calculate customer acquisition cost

---

**Document Version**: 1.0
**Last Updated**: November 30, 2025
**Next Review**: Post-launch (7 days)
