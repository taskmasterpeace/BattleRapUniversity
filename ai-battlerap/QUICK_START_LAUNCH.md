# Quick Start Launch Guide

**Battle Rap University - Launch in 3 Hours**

This is the express version for experienced developers who want to launch quickly. For detailed instructions, see the full documentation.

---

## Prerequisites (What You Need)

- GitHub account
- Vercel account (free tier OK initially)
- Supabase account (free tier OK initially)
- Domain name (optional, can use vercel.app subdomain)
- 3 hours of uninterrupted time

---

## Step 1: Supabase Setup (30 minutes)

### 1.1 Create Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: "Battle Rap University"
4. Region: Choose closest to target users
5. Database Password: Strong password, save it
6. Click "Create new project"
7. Wait 2-3 minutes for provisioning

### 1.2 Apply Migrations

```bash
cd ai-battlerap

# Link to your project
npx supabase link --project-ref [your-project-ref]

# Push all migrations
npx supabase db push
```

**Expected**: "Finished supabase db push"

### 1.3 Run Seed Data

1. Open Supabase SQL Editor (sidebar → SQL Editor)
2. Copy all contents from `supabase/seed.sql`
3. Paste into editor
4. Click "Run"
5. Wait ~10 seconds

**Verify**:
```sql
SELECT COUNT(*) FROM leagues; -- Should be 2
SELECT COUNT(*) FROM battlers WHERE is_ai = true; -- Should be 28
```

### 1.4 Get API Keys

1. Go to Project Settings → API
2. Copy these values:
   - `Project URL`
   - `anon public` key
   - `service_role` key (show value, copy)

---

## Step 2: Vercel Deployment (30 minutes)

### 2.1 Push to GitHub

```bash
cd ai-battlerap
git add .
git commit -m "Ready for launch"
git push origin main
```

### 2.2 Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Root Directory: `ai-battlerap`
5. Framework Preset: Next.js (auto-detected)
6. Click "Deploy" (will fail without env vars, that's OK)

### 2.3 Set Environment Variables

1. Go to Project Settings → Environment Variables
2. Add these:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key-from-step-1.4]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key-from-step-1.4]
INTERNAL_API_SECRET=[generate-random-32-char-string]
NEXT_PUBLIC_APP_URL=https://[your-project].vercel.app
```

**Generate Random Secret**:
```bash
openssl rand -base64 32
# Or use: https://www.random.org/strings/
```

3. Click "Save"
4. Go to Deployments tab
5. Click "..." on latest deployment → "Redeploy"

**Expected**: Build succeeds, site live at `https://[your-project].vercel.app`

---

## Step 3: Configure Cron Jobs (20 minutes)

### Option A: External Cron (Free, Recommended for Testing)

1. Go to https://cron-job.org/en/
2. Create free account
3. Create Job #1:
   - Title: "Generate Battle Offers"
   - URL: `https://[your-project].vercel.app/api/internal/generate-battle-offers`
   - Schedule: Daily at 12:00
   - Request Method: POST
   - Headers: Add `Authorization: Bearer [your-INTERNAL_API_SECRET]`
   - Click "Create cronjob"

4. Create Job #2:
   - Title: "Run Due Battles"
   - URL: `https://[your-project].vercel.app/api/internal/run-due-battles`
   - Schedule: Every 5 minutes
   - Request Method: POST
   - Headers: Add `Authorization: Bearer [your-INTERNAL_API_SECRET]`
   - Click "Create cronjob"

### Option B: Vercel Cron (Requires Pro Plan $20/mo)

1. Create `vercel.json` in `ai-battlerap/` directory:
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

2. Commit and push:
```bash
git add vercel.json
git commit -m "Add cron jobs"
git push origin main
```

**Note**: Vercel cron includes auth automatically in production

---

## Step 4: Test Everything (60 minutes)

### 4.1 Smoke Test (10 minutes)

1. Visit `https://[your-project].vercel.app`
2. Click "Login" → Enter your email
3. Check email → Click magic link
4. Should redirect to onboarding
5. Create battler:
   - Enter name
   - Choose league
   - Select 3 badges
6. Should redirect to dashboard

**If this works, core flow is functional ✅**

### 4.2 Generate Test Battle Offer (5 minutes)

```bash
curl -X POST https://[your-project].vercel.app/api/internal/generate-battle-offers \
  -H "Authorization: Bearer [your-INTERNAL_API_SECRET]"
```

**Expected**: `{"success":true,"offersGenerated":3}`

### 4.3 Accept and Prep Battle (10 minutes)

1. Go to `/battle/offers`
2. Click "ACCEPT BATTLE" on first offer
3. Should redirect to `/battle/[id]/prep`
4. Select prep focus for 3-5 days
5. Each selection should auto-save

**Verify**: Refresh page, selections persist

### 4.4 Simulate Battle (5 minutes)

```bash
# Get battle ID from URL or database
curl -X POST "https://[your-project].vercel.app/api/internal/run-due-battles?battle_id=[battle-id]" \
  -H "Authorization: Bearer [your-INTERNAL_API_SECRET]"
```

**Expected**: `{"success":true,"battlesSimulated":1}`

### 4.5 View Results (5 minutes)

1. Navigate to `/battle/[id]`
2. Should see:
   - Winner announced
   - Round scores
   - Segment timeline
   - Post-battle summary (XP, rating change)

**If all segments have scores, simulation works ✅**

### 4.6 Mobile Test (10 minutes)

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone SE"
4. Test:
   - Dashboard loads
   - Battle offers readable
   - Prep calendar works (horizontal scroll OK)
   - Battle results display correctly

**Or use real mobile device**

### 4.7 Check for Errors (5 minutes)

1. Open Console (F12 → Console tab)
2. Navigate through all pages
3. Look for red errors (warnings OK)

**Expected**: No critical errors

---

## Step 5: Enable Monitoring (Optional, 30 minutes)

### 5.1 Sentry (Error Tracking)

```bash
cd ai-battlerap
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Follow prompts, get DSN, add to Vercel environment variables:
```
NEXT_PUBLIC_SENTRY_DSN=[your-sentry-dsn]
```

### 5.2 Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Enable query logging
3. Set retention: 7 days

### 5.3 Vercel Analytics (Optional Pro Feature)

1. Go to Vercel Dashboard → Project → Analytics
2. Enable if on Pro plan

---

## Step 6: Launch! (10 minutes)

### 6.1 Final Checks

- [ ] Site loads at production URL
- [ ] User can signup and create battler
- [ ] Battle offers generate
- [ ] Battles simulate
- [ ] No console errors
- [ ] Mobile works

### 6.2 Announce

- Post on social media
- Start YouTube ad campaign
- Share with battle rap communities

### 6.3 Monitor Closely (First 24 Hours)

**Check every hour**:
- Vercel deployment status
- Supabase database health
- Sentry error count (if installed)
- New user signups

**Red flags**:
- Site returns 500 errors → Rollback via Vercel
- Database CPU >90% → Upgrade Supabase plan
- Cron jobs not running → Check cron-job.org logs

---

## Troubleshooting

### "Build failed" on Vercel
- Check build logs for specific error
- Verify all env variables set
- Try: `npm run build` locally first

### "Magic link not arriving"
- Check Supabase → Authentication → Email Templates
- Check spam folder
- Try different email provider

### "Battle simulation returns 500"
- Check Vercel function logs
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check battle is in 'accepted' or 'locked' status

### "Cron jobs not running"
- Test manually with curl (see Step 4.2)
- Verify Authorization header is set
- Check cron-job.org execution history

### "No battle offers appearing"
- Run generate-battle-offers manually (Step 4.2)
- Check database: `SELECT * FROM battles WHERE status = 'offered'`
- Verify user has battler created

---

## Rollback Plan

If something goes wrong:

1. **Immediate rollback** (2 minutes):
   - Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Database rollback** (10 minutes):
   - Supabase Dashboard → Backups
   - Select backup before issue
   - Click "Restore"

---

## What's Next?

### First Week
- Monitor user signups
- Watch battle statistics (choke rate, body rate)
- Collect user feedback
- Fix any bugs that emerge

### First Month
- Implement badge earning logic
- Add level-up ceremony
- Tune life event consequences
- Add opponent info to battle offers

---

## Success Metrics

**Week 1 Goals**:
- 100+ signups
- 50+ battlers created
- 200+ battles completed
- <1% error rate
- 99%+ uptime

---

## Support Resources

**Documentation**:
- Full checklist: `LAUNCH_PREP_CHECKLIST.md`
- Known issues: `KNOWN_ISSUES.md`
- Testing guide: `TESTING_GUIDE.md`
- Deployment notes: `DEPLOYMENT_NOTES.md`

**External**:
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs

**Get Help**:
- Vercel support: vercel.com/support
- Supabase Discord: supabase.com/discord

---

## Estimated Costs

### Free Tier (0-100 users)
- Vercel: Free (100 GB bandwidth)
- Supabase: Free (500 MB database, 2 GB bandwidth)
- Cron-job.org: Free
- **Total: $0/month**

### Scaling Up (100-1000 users)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Sentry: $26/month (optional)
- **Total: ~$45-70/month**

---

**You're ready to launch! 🚀**

Total time: ~3 hours
Expected result: Live, functional battle rap game

For questions or issues, refer to full documentation or create GitHub issue.

Good luck!
