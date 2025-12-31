# Battle Rap University - Launch Prep Checklist

**Version**: 1.0
**Date**: November 30, 2025
**Status**: Pre-Launch Verification
**Target Audience**: Battle rap fans (YouTube ad campaign)

---

## Overview

This checklist ensures Battle Rap University is ready for public launch. All items marked CRITICAL must pass before launch. High Priority items should be completed or have documented workarounds. Medium Priority items can be addressed post-launch.

**Estimated Time to Complete**: 4-6 hours

---

## 1. BUILD & DEPLOYMENT VERIFICATION

### 1.1 Production Build [CRITICAL]

- [ ] **Build completes without errors**
  ```bash
  cd ai-battlerap
  npm run build
  ```
  **Expected**: ✓ Compiled successfully with 0 errors
  **Status**: ✅ PASSING (as of Nov 30, 2025)

- [ ] **No TypeScript errors**
  ```bash
  npx tsc --noEmit
  ```
  **Expected**: No errors found

- [ ] **No console errors in browser**
  - Open dev tools (F12)
  - Navigate through all pages
  - Check for red errors in console
  **Expected**: Only warnings OK, no errors

### 1.2 Environment Variables [CRITICAL]

- [ ] **Production Supabase project created**
  - Go to supabase.com
  - Create new project
  - Note project URL and keys

- [ ] **Environment variables configured**
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
  SUPABASE_SERVICE_ROLE_KEY=[service_role_key]
  INTERNAL_API_SECRET=[random_secure_string]
  NEXT_PUBLIC_APP_URL=https://[your-domain].com
  ```

- [ ] **Vercel deployment configured**
  - Connect GitHub repo
  - Set all environment variables
  - Enable automatic deployments
  - Configure custom domain (optional)

### 1.3 Database Setup [CRITICAL]

- [ ] **Migrations applied to production**
  ```bash
  npx supabase db push
  ```
  **Expected**: 7 migrations applied successfully

- [ ] **Seed data loaded**
  - 2 leagues (Small Room Circuit, Main Stage Arena)
  - 28 AI battlers
  - All badge definitions
  **Verification**: Query `leagues` and `battlers` tables

- [ ] **RLS policies enabled**
  - Check Supabase dashboard
  - Verify policies exist on all user-facing tables
  **Expected**: Green checkmarks on all tables

---

## 2. FUNCTIONALITY TESTING

### 2.1 Authentication Flow [CRITICAL]

- [ ] **User signup works**
  1. Go to /login
  2. Enter email
  3. Check inbox for magic link
  4. Click link
  5. Verify redirect to /auth/confirm
  6. Verify redirect to /onboarding
  **Expected**: Smooth flow, no errors

- [ ] **User login works**
  1. Logout if needed
  2. Return to /login
  3. Enter same email
  4. Get magic link
  5. Click link
  **Expected**: Redirect to /dashboard (existing user)

- [ ] **Protected routes enforce auth**
  1. Open incognito window
  2. Try to access /dashboard directly
  **Expected**: Redirect to /login

### 2.2 Battler Creation [CRITICAL]

- [ ] **Onboarding wizard completes**
  1. Login as new user
  2. Step 1: Enter battler name
  3. Step 2: Choose league
  4. Step 3: Select 3 style tags
  5. Click "Complete Onboarding"
  **Expected**: Redirect to /dashboard with battler created

- [ ] **Attributes initialized correctly**
  - Navigate to /dashboard
  - Check battler stats display
  **Expected**: All attributes at 4.0/10

- [ ] **Starting rating assigned**
  **Expected**: Rating: 1200

### 2.3 Battle Offer Flow [CRITICAL]

- [ ] **Offers generated**
  ```bash
  curl -X POST https://[your-domain]/api/internal/generate-battle-offers \
    -H "Authorization: Bearer [INTERNAL_API_SECRET]"
  ```
  **Expected**: 200 response, offers created

- [ ] **Offers display on /battle/offers**
  - Navigate to /battle/offers
  - See list of available battles
  **Expected**: At least 1 offer visible

- [ ] **Accept battle works**
  1. Click "ACCEPT BATTLE" on an offer
  2. Verify redirect to /battle/[id]/prep
  **Expected**: Battle status changes to 'accepted'

- [ ] **Decline battle works**
  1. Click "DECLINE" on an offer
  2. Verify offer disappears
  3. Check reputation penalty applied
  **Expected**: Reputation decreases slightly

### 2.4 Prep Calendar [CRITICAL]

- [ ] **Prep calendar loads**
  1. Accept a battle
  2. Navigate to /battle/[id]/prep
  **Expected**: Calendar with days from acceptance to lock date

- [ ] **Focus selection saves**
  1. Select "Writing" for day 1
  2. Select "Performance" for day 2
  3. Refresh page
  **Expected**: Selections persist

- [ ] **Prep summary updates**
  - Fill out 3-5 days
  - Check prep summary card
  **Expected**: Counts match selections (e.g., "Writing: 2 days")

- [ ] **Lock enforcement works**
  1. Set battle to scheduled_at in past (use Supabase Studio)
  2. Try to change prep focus
  **Expected**: Changes blocked after lock_prep_at

### 2.5 Battle Simulation [CRITICAL]

- [ ] **Battle simulates on schedule**
  ```bash
  curl -X POST https://[your-domain]/api/internal/run-due-battles \
    -H "Authorization: Bearer [INTERNAL_API_SECRET]"
  ```
  **Expected**: Battles with `scheduled_at <= now()` simulate

- [ ] **Battle results display**
  1. Navigate to /battle/[id] (completed battle)
  2. View round-by-round results
  3. Check segment timeline
  **Expected**: Winner declared, scores shown

- [ ] **Rating updates after battle**
  - Check /dashboard
  - Verify rating changed
  **Expected**: Rating increases (win) or decreases (loss)

### 2.6 Life Events [HIGH PRIORITY]

- [ ] **Life events trigger**
  1. Complete a battle
  2. Navigate to /dashboard
  3. Check for notification bell
  **Expected**: Notification appears for new life event (if conditions met)

- [ ] **Life event choices work**
  1. Click notification
  2. Navigate to /life-events/[id]
  3. Select a choice
  4. Click "MAKE CHOICE"
  **Expected**: Consequences applied to attributes

- [ ] **Life event history displays**
  - Navigate to /life-events/history
  **Expected**: List of past events with choices made

### 2.7 Notifications [HIGH PRIORITY]

- [ ] **Notification bell shows count**
  - Complete actions that trigger notifications
  - Check top-right bell icon
  **Expected**: Red badge with count

- [ ] **Clicking notification navigates**
  1. Click bell icon
  2. Click a notification
  **Expected**: Navigate to relevant page

- [ ] **Mark as read works**
  1. Click notification
  2. Return to bell icon
  **Expected**: Notification marked as read (no bold text)

### 2.8 Tournaments [MEDIUM PRIORITY]

- [ ] **Tournament registration works**
  1. Navigate to /tournaments
  2. Click "REGISTER" on available tournament
  **Expected**: Registration confirmed

- [ ] **Tournament bracket displays**
  1. Navigate to /tournaments/[id]
  2. View bracket
  **Expected**: Matches shown in tree structure

- [ ] **Tournament battles complete**
  - Wait for tournament battles to simulate
  - Check bracket updates
  **Expected**: Winners advance, losers eliminated

---

## 3. VISUAL POLISH

### 3.1 Dark Theme Consistency [CRITICAL]

- [ ] **All pages use dark theme**
  - Visit every page: /login, /dashboard, /battle/offers, /media, etc.
  **Expected**: bg-zinc-950/900 everywhere, NO white backgrounds

- [ ] **Text colors consistent**
  - Primary text: text-zinc-100
  - Secondary text: text-zinc-400/500
  - Accent: text-orange-500
  **Expected**: No black text on dark backgrounds

- [ ] **Border colors consistent**
  **Expected**: border-zinc-800 throughout

### 3.2 Battle Rap Terminology [HIGH PRIORITY]

- [ ] **3-0 victory displays as "BODYBAG"**
  - Complete a 3-0 battle
  - Check results page
  **Expected**: "BODYBAG" badge or label

- [ ] **Close 2-1 displays as "DEBATABLE"**
  - Complete a close 2-1 battle
  **Expected**: "DEBATABLE" label

- [ ] **W/L slang used**
  **Expected**: "TOOK THE W" (win), "CAUGHT THE L" (loss)

### 3.3 Typography [MEDIUM PRIORITY]

- [ ] **Headers are bold and uppercase**
  **Expected**: font-black, uppercase, tracking-tighter

- [ ] **Body text readable**
  **Expected**: font-bold, uppercase, tracking-wider

- [ ] **Small text legible**
  **Expected**: text-xs minimum, good contrast

---

## 4. MOBILE RESPONSIVENESS

### 4.1 Core Pages [CRITICAL]

Test on 375px viewport (iPhone SE) or real mobile device:

- [ ] **/login page**
  - Form fits screen
  - No horizontal scroll
  - Touch targets ≥44px
  **Expected**: Fully usable on mobile

- [ ] **/dashboard page**
  - Stats cards stack vertically
  - Battles list readable
  - Navigation accessible
  **Expected**: No layout breaks

- [ ] **/battle/offers page**
  - Offer cards stack
  - Buttons tappable
  **Expected**: Smooth scrolling

- [ ] **/battle/[id]/prep page**
  - Calendar scrolls horizontally (OK)
  - Dropdowns work on touch
  **Expected**: Prep selection works

- [ ] **/battle/[id] results page**
  - Segment timeline readable
  - Round scores visible
  **Expected**: Results clear on small screen

### 4.2 Navigation [HIGH PRIORITY]

- [ ] **Mobile menu works**
  - Hamburger icon visible
  - Menu slides out
  - Links work
  **Expected**: Easy navigation on mobile

- [ ] **Notification bell accessible**
  **Expected**: Top-right corner, tappable

---

## 5. PERFORMANCE

### 5.1 Page Load Speed [CRITICAL]

Use Chrome DevTools (Network tab, slow 3G throttling):

- [ ] **/dashboard loads <2s**
  **Expected**: Stats visible quickly

- [ ] **/battle/offers loads <1s**
  **Expected**: Offer list appears fast

- [ ] **/battle/[id] loads <2s**
  **Expected**: Results render promptly

### 5.2 Database Query Optimization [HIGH PRIORITY]

- [ ] **Dashboard uses Promise.all()**
  - Check code: `components/battler/DashboardClient.tsx`
  **Expected**: 8 queries run in parallel (already implemented ✅)

- [ ] **No N+1 query patterns**
  - Enable Supabase query logging
  - Navigate through app
  **Expected**: No repeated queries for same data

### 5.3 Loading States [MEDIUM PRIORITY]

- [ ] **Loading spinners present**
  - Navigate between pages
  **Expected**: Spinners show during data fetching

- [ ] **No blank screens**
  **Expected**: Always show UI (skeleton or spinner)

---

## 6. SECURITY

### 6.1 Input Validation [CRITICAL]

- [ ] **Battler name sanitized**
  1. Try creating battler with `<script>alert('XSS')</script>`
  **Expected**: HTML escaped, no script execution

- [ ] **Prep calendar validates dates**
  1. Try to set prep after lock date (via API)
  **Expected**: 400 error, changes rejected

- [ ] **SQL injection prevented**
  - All queries use Supabase client (parameterized)
  **Expected**: No raw SQL with user input

### 6.2 Authentication [CRITICAL]

- [ ] **RLS policies prevent data leaks**
  1. Login as User A
  2. Try to access User B's battler (via API)
  **Expected**: 403 or empty result

- [ ] **Service role only in internal APIs**
  - Check `/api/internal/*` routes
  **Expected**: Use `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **User client in user-facing APIs**
  - Check `/api/battler/*` and `/api/battles/*`
  **Expected**: Use `createServerSupabaseClient()`

### 6.3 API Security [HIGH PRIORITY]

- [ ] **Internal API secret required**
  ```bash
  curl -X POST https://[your-domain]/api/internal/generate-battle-offers
  ```
  **Expected**: 401 Unauthorized (without secret)

- [ ] **No API keys in client code**
  - Search codebase for `SUPABASE_SERVICE_ROLE_KEY`
  **Expected**: Only in server-side code

---

## 7. CONTENT QUALITY

### 7.1 AI-Generated Content [HIGH PRIORITY]

- [ ] **Battle recaps sound authentic**
  1. Complete a battle
  2. Navigate to /media
  3. Read generated article
  **Expected**: Realistic battle rap journalism tone

- [ ] **Life event descriptions engaging**
  1. Trigger life event
  2. Read event description
  **Expected**: Immersive storytelling

- [ ] **No placeholder text**
  - Search for "TODO", "Lorem ipsum", "[PLACEHOLDER]"
  **Expected**: All content production-ready

### 7.2 Badge System [MEDIUM PRIORITY]

- [ ] **Badges display correctly**
  - Navigate to /badges
  **Expected**: 105 badges shown with descriptions

- [ ] **Badge icons/images present**
  **Expected**: Visual representation for each badge (if designed)

---

## 8. DATA INTEGRITY

### 8.1 Seed Data [CRITICAL]

- [ ] **28 AI battlers seeded**
  ```sql
  SELECT COUNT(*) FROM battlers WHERE is_ai = true;
  ```
  **Expected**: 28

- [ ] **2 leagues configured**
  ```sql
  SELECT * FROM leagues;
  ```
  **Expected**: Small Room Circuit, Main Stage Arena

- [ ] **105 badge definitions**
  - Check `lib/game/badges.ts`
  **Expected**: All badges coded

### 8.2 Migrations [CRITICAL]

- [ ] **All 7 migrations applied**
  ```bash
  npx supabase db diff --schema public
  ```
  **Expected**: No differences (all applied)

- [ ] **Foreign keys intact**
  ```sql
  SELECT * FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY';
  ```
  **Expected**: All FK constraints active

---

## 9. BATTLE RAP AUTHENTICITY

### 9.1 Culture Check [HIGH PRIORITY]

- [ ] **Terminology feels authentic**
  - Battlers say "body" not "3-0 sweep"
  - Close wins are "debatable"
  - Battles are "matches" or "events"
  **Expected**: Battle rap community would recognize language

- [ ] **Attribute names resonate**
  - Lyricism, Wordplay, Creativity (not "Writing")
  - Stage Presence, Delivery, Crowd Control (not "Performance")
  **Expected**: Mirrors real battle rap skills

- [ ] **Badge names authentic**
  - "Punch God" not "Good at Punchlines"
  - "Choker" not "Nervous Performer"
  **Expected**: Matches battle rap culture

### 9.2 Simulation Realism [MEDIUM PRIORITY]

- [ ] **Choke rates feel realistic**
  - Average battler: ~7% choke rate
  - Known Choker: ~45% choke rate
  **Expected**: Not too frequent, not too rare

- [ ] **Body vs Debatable ratios**
  - Bodies: 20-30% of battles
  - Debatables: 40-50% of battles
  **Expected**: Most battles are close

- [ ] **Prep impact noticeable**
  - 0 prep days vs 10 prep days
  **Expected**: Significant performance difference

---

## 10. POST-LAUNCH MONITORING

### 10.1 Error Logging [CRITICAL]

- [ ] **Sentry (or similar) configured**
  - Install error tracking
  - Test error capture
  **Expected**: Errors logged to dashboard

- [ ] **Supabase logs enabled**
  - Enable query logging
  - Enable error logging
  **Expected**: Can debug production issues

### 10.2 Analytics [MEDIUM PRIORITY]

- [ ] **Google Analytics (or Plausible) installed**
  - Track page views
  - Track user flows
  **Expected**: Can measure user engagement

- [ ] **Key events tracked**
  - Battler creation
  - Battle completion
  - Tournament registration
  **Expected**: Conversion funnel visible

### 10.3 Database Monitoring [HIGH PRIORITY]

- [ ] **Database backups enabled**
  - Supabase automatic backups ON
  **Expected**: Daily backups retained 7 days

- [ ] **Query performance monitoring**
  - Enable slow query log
  **Expected**: Alerts on queries >500ms

---

## 11. KNOWN LIMITATIONS

Document these in user-facing FAQ or knowledge base:

- [ ] **Badge earning partially implemented**
  - Users can SELECT badges at creation
  - Earning badges via performance: DESIGNED but not fully implemented
  **Impact**: Low (users can still play, just can't earn new badges yet)

- [ ] **XP/Level system partial**
  - XP gains after battles: WORKING
  - Level-up rewards: DESIGNED but not fully implemented
  **Impact**: Medium (users see XP but no level-up ceremony)

- [ ] **Life event consequences need tuning**
  - Events trigger correctly
  - Attribute changes may feel too small/large
  **Impact**: Medium (needs playtesting data to balance)

- [ ] **Sprite attachment not implemented**
  - User can upload profile image
  - Sprite database system: DESIGNED but not implemented
  **Impact**: Low (manual uploads work)

---

## 12. CRON JOBS / SCHEDULED TASKS

### 12.1 Battle Offer Generation [CRITICAL]

- [ ] **Cron configured**
  - Frequency: Daily at 12:00 UTC
  - Endpoint: POST /api/internal/generate-battle-offers
  - Auth: Bearer [INTERNAL_API_SECRET]
  **Expected**: 3-5 new offers per day per active user

### 12.2 Battle Simulation [CRITICAL]

- [ ] **Cron configured**
  - Frequency: Every 5 minutes
  - Endpoint: POST /api/internal/run-due-battles
  - Auth: Bearer [INTERNAL_API_SECRET]
  **Expected**: Battles simulate when scheduled_at passes

### 12.3 Verification

- [ ] **Test manual trigger**
  ```bash
  curl -X POST https://[your-domain]/api/internal/generate-battle-offers \
    -H "Authorization: Bearer [INTERNAL_API_SECRET]"
  ```
  **Expected**: 200 OK, offers created

- [ ] **Check Supabase cron logs**
  **Expected**: Executions logged, no errors

---

## 13. DEPLOYMENT NOTES

### 13.1 Pre-Deploy Checklist

- [ ] **Git tag release**
  ```bash
  git tag -a v1.0.0 -m "Initial public launch"
  git push origin v1.0.0
  ```

- [ ] **Create deployment branch**
  ```bash
  git checkout -b production
  git push origin production
  ```

- [ ] **Vercel production deployment**
  - Merge to main (or production branch)
  - Verify auto-deploy triggered
  **Expected**: Live site at custom domain

### 13.2 Post-Deploy Verification

- [ ] **Run full checklist on production URL**
  - Test all flows on live site
  **Expected**: Everything works as on staging

- [ ] **Monitor error logs for 1 hour**
  - Watch Sentry/Supabase logs
  **Expected**: No critical errors

- [ ] **Test from mobile device**
  - iPhone and Android
  **Expected**: Responsive, functional

---

## 14. MARKETING READINESS

### 14.1 Landing Page [HIGH PRIORITY]

- [ ] **Homepage explains game**
  - Clear value proposition
  - Screenshots/demo
  - CTA: "Create Your Battler"
  **Expected**: Visitors understand what the game is

- [ ] **Signup friction minimized**
  - Magic link (no password)
  - Fast onboarding (3 steps)
  **Expected**: <2 minutes from landing to playing

### 14.2 YouTube Ad Campaign [CRITICAL]

- [ ] **Landing page optimized for ad traffic**
  - Fast load (<2s)
  - Mobile-first design
  - Clear next step
  **Expected**: High conversion rate

- [ ] **Tracking pixels installed**
  - YouTube conversion pixel
  - Retargeting pixel
  **Expected**: Can measure ROI

- [ ] **Target audience validated**
  - Battle rap keywords
  - Genre interests
  **Expected**: Ads shown to relevant users

---

## 15. FINAL GO/NO-GO CHECKLIST

### Before Launch [ALL MUST PASS]

- [ ] All CRITICAL items completed
- [ ] Build succeeds with 0 errors
- [ ] Production database seeded
- [ ] Auth flow tested end-to-end
- [ ] Battle simulation tested
- [ ] Mobile responsiveness verified
- [ ] Security audit passed
- [ ] Cron jobs configured
- [ ] Error logging active
- [ ] No placeholder text

### Nice-to-Have (Can Launch Without)

- [ ] All HIGH PRIORITY items completed
- [ ] Analytics installed
- [ ] Badge earning fully implemented
- [ ] Level-up rewards implemented
- [ ] Sprite attachment system

### Post-Launch Priorities

1. Monitor error logs (first 24 hours)
2. Collect user feedback
3. Watch battle simulation edge cases
4. Tune life event consequences
5. Measure choke/stumble rates in production
6. Implement badge earning logic
7. Add level-up ceremony

---

## Completion Summary

**Total Items**: 150+
**Critical Items**: 45
**High Priority**: 35
**Medium Priority**: 25

**Estimated Completion Time**: 4-6 hours for experienced developer

---

## Emergency Rollback Plan

If critical issues arise post-launch:

1. **Revert Vercel deployment**
   - Go to Vercel dashboard
   - Redeploy previous version
   - ETA: 5 minutes

2. **Database rollback**
   - Restore from latest Supabase backup
   - Re-apply migrations if needed
   - ETA: 15 minutes

3. **Communication**
   - Post maintenance notice on landing page
   - Notify users via email (if collected)
   - ETA: 30 minutes

---

**Document Version**: 1.0
**Last Updated**: November 30, 2025
**Next Review**: Post-launch (7 days)
