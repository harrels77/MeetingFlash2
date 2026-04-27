# MeetingFlash — AI Context (Claude.ai + Claude Code)

## AI CONTEXT (IMPORTANT)
This project is assisted by AI coding agents (Claude Code + Claude.ai).

### Rules for AI:
- Always read this file first before making changes
- Never assume missing architecture decisions
- If context is unclear, ask before modifying core logic
- Update this file when new decisions are made
- This file is the single source of truth

---

## Product
Post-meeting execution SaaS. Transforms raw meeting notes into a complete
Execution Pack in under 20 seconds. Users paste raw notes and get 7 structured
outputs: decisions, action items, open questions, risks, follow-up email,
Slack message, and next agenda.

Target: agencies, freelancers, small product teams who want to eliminate
post-meeting admin work. Key differentiator vs ChatGPT: zero prompts required,
persistent project memory, structured ready-to-use outputs.

**Current status:** MVP deployed on Vercel. Stripe live mode active. Auth working. Blog live. Domain `meetingflash.work` active. Email pending (Resend account flagged, awaiting resolution).

---

## Tech Stack
- **Frontend:** Next.js 14 App Router + TypeScript
- **Styling:** CSS Modules (no Tailwind)
- **Auth:** Supabase Auth (Google OAuth + email/password)
- **Database:** Supabase PostgreSQL + RLS
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514) with prompt caching
- **Payments:** Stripe (subscriptions) — apiVersion: 2026-03-25.dahlia
- **Email:** Resend — `hello@meetingflash.work` — domain verified, API key set, but Resend account flagged (awaiting support response)
- **Deployment:** Vercel

---

## Design System
- Background: `#060C18`
- Surface: `#111D35`
- Blue primary: `#2563EB`
- Blue bright: `#3B82F6`
- Accent: `#60A5FA`
- Text: `#F8FAFC`
- Muted: `#94A3B8`
- Fonts: Plus Jakarta Sans + Instrument Serif + JetBrains Mono
- All CSS variables defined in `src/styles/globals.css`
- Dark/light theme via `[data-theme="light"]` on `<html>` — CSS vars override in globals.css

### Design Decisions (do not revert)
- Ambient glow blobs: opacity ~0.22 (NOT 0.12 — was too subtle, intentionally bolder)
- Pricing featured card: elevated with `translateY(-4px)` + double box-shadow glow
- Logo bar label: "Works alongside your existing stack" (NOT "Trusted by teams using")
- Logo bar tools: meeting tools only (Zoom, Teams, Google Meet, Loom, etc.) — no Stripe/Vercel
- Nav logo: 36px (NOT 28px — was too small)

---

## All Pages & Routes
src/
├── app/
│   ├── page.tsx                     ← Landing page (hero, demo, features, testimonials, pricing)
│   ├── layout.tsx                   ← Root layout + AuthProvider + Analytics + theme FOUC script
│   ├── app/page.tsx                 ← Flash tool (main product)
│   ├── blog/
│   │   ├── page.tsx                 ← Blog index (4 articles)
│   │   └── [slug]/page.tsx          ← Article page (static)
│   ├── dashboard/
│   │   ├── page.tsx                 ← Dashboard (recent packs + projects tabs)
│   │   ├── pack/[id]/page.tsx       ← Pack detail + task tracker
│   │   ├── project/[id]/page.tsx    ← Project memory (decisions + tasks)
│   │   ├── search/page.tsx          ← Smart search across meetings
│   │   └── settings/page.tsx        ← Account settings
│   ├── api/
│   │   ├── flash/route.ts           ← Core AI route (Claude API)
│   │   ├── checkout/route.ts        ← Stripe checkout session
│   │   ├── webhook/route.ts         ← Stripe webhook handler
│   │   ├── email/
│   │   │   ├── welcome/route.ts     ← Welcome email via Resend (new accounts)
│   │   │   └── nudge/route.ts       ← Upgrade nudge email (free limit reached)
│   │   └── cron/
│   │       └── reset-uses/route.ts  ← Monthly reset of uses_this_month (Vercel cron)
│   ├── auth/callback/route.ts       ← OAuth callback → redirect /
│   ├── login/page.tsx               ← Login (email + Google OAuth)
│   ├── signup/page.tsx              ← Signup
│   ├── share/[token]/page.tsx       ← Public shareable pack + sticky CTA banner
│   ├── privacy/page.tsx             ← Privacy Policy
│   └── terms/page.tsx               ← Terms of Service
├── components/
│   ├── MobileNav.tsx                ← Nav with auth state + dark/light toggle
│   ├── HeroCta.tsx                  ← Smart CTA (4 states based on auth)
│   ├── ProductShowcase.tsx          ← 3-tab static mockups on landing page (App / Dashboard / Pack)
│   └── FooterAccount.tsx            ← Footer with dynamic auth state
└── lib/
    ├── supabase.ts                  ← Supabase client singleton
    ├── AuthProvider.tsx             ← Global auth context (useAuth hook)
    └── blog.ts                      ← Blog articles data (4 articles, static)

---

## Important Decisions

### Authentication
- Handled via Supabase Auth (Google OAuth + email/password)
- Google OAuth consent screen branded as "MeetingFlash" (verified, in production) — authorized domains include `meetingflash.work`, `supabase.co`, and Vercel preview domains
- Global session managed by `AuthProvider.tsx` — most components use `useAuth()`
- **EXCEPTION:** `src/app/app/page.tsx` (flash tool) does NOT use `useAuth()` — it has its own `supabase.auth.getSession()` + `onAuthStateChange` directly, with local `isLoggedIn` state. Do not refactor this without careful testing.
- After login/signup: redirect to `/` (not `/dashboard`)
- OAuth callback route: `src/app/auth/callback/route.ts`
- `AuthProvider` calls both `getSession()` AND `onAuthStateChange` — both can call `loadProfile` simultaneously (known race condition in prod, do not change without testing)
- `signOut` in AuthProvider: `async`, awaits `supabase.auth.signOut()`, then does `window.location.replace('/')` — full page reload to clear state
- **Welcome email trigger:** when `loadProfile` creates a new profile (first time, no existing row), it calls `fetch('/api/email/welcome', ...)` fire-and-forget. Currently fails silently (no domain yet).

### Database (Supabase PostgreSQL)
Tables: `profiles`, `projects`, `meetings`, `tasks`

Key schema:
- `meetings.pack` = JSONB with keys: `decisions`, `actions`, `questions`,
  `risks`, `email`, `slack`, `agenda`, `tasks[]`
- `meetings.share_token` = string (nullable) — for public share links
- `profiles.plan` = `'free'` | `'pro'` | `'team'`
- `profiles.uses_this_month` = integer (reset monthly via Vercel cron)
- `tasks` = `{ user_id, meeting_id, text, owner, deadline, priority, status }`
- RLS enabled on all tables
- Auto-profile creation via `handle_new_user()` trigger
- **IMPORTANT:** webhook + cron use `SUPABASE_SERVICE_ROLE_KEY` (not anon key) to bypass RLS

### AI — /api/flash
- Model: `claude-sonnet-4-20250514`
- max_tokens: 4000
- Called via direct `fetch('https://api.anthropic.com/v1/messages')` — NOT the Anthropic SDK
- Headers: `x-api-key`, `anthropic-version: 2023-06-01`, `anthropic-beta: prompt-caching-2024-07-31`
- System message has `cache_control: { type: 'ephemeral' }` for prompt caching
- Rate limiting: 10 requests/minute per IP (in-memory Map, resets on server restart)
- Response format: raw JSON (no markdown, no backticks) — strips ```json if present
- Pack includes `tasks[]` array — saved separately to `tasks` table with `status: 'todo'`
- Tasks insert uses meeting ID from `.select('id').single()` on the meetings insert
- Saves meeting + tasks to DB if `Authorization: Bearer <token>` header present
- Supabase client in this route: created per-request with user's auth header, uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Calls `supabase.rpc('increment_uses', { user_id: user.id })` after each successful flash
- After increment, fetches profile to check if free user hit 3 uses → sends nudge email (fire-and-forget)

### Payments (Stripe)
- Pro: $12/month or $8/month billed annually ($96/yr)
- Team: $25/month for 5 seats or $20/month billed annually ($240/yr)
- Monthly price IDs: `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`, `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID`
- Annual price IDs: `NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID`, `NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID`
- **All keys are LIVE mode** (`sk_live_`, `pk_live_`) — real payments active
- Checkout sends `metadata: { userId, priceId }` — both are needed
- Checkout: `success_url` → `/dashboard?upgraded=true`, `cancel_url` → `/#pricing`
- Webhook uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) — client created fresh per request
- **Webhook team detection:** checks if priceId is in `[NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID, NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID]` — covers both monthly and annual
- On `checkout.session.completed`: updates plan + saves userId to Stripe customer metadata
- On `customer.subscription.deleted` / `invoice.payment_failed`: looks up by userId from customer metadata, falls back to email

### Free Trial Logic
- Guest (not logged in): 1 free pack via `localStorage('mf_guest_used')`
- Free plan: 3 packs/month tracked in `profiles.uses_this_month`
- Reset: Vercel cron job hits `GET /api/cron/reset-uses` on the 1st of each month at midnight
- Cron protected by `Authorization: Bearer CRON_SECRET` header
- When limit reached: show upgrade modal (not just an error message)

### Email (Resend) — BLOCKED until domain acquired
- Routes exist: `/api/email/welcome` and `/api/email/nudge`
- Both use `from: 'MeetingFlash <hello@meetingflash.work>'`
- Domain `meetingflash.work` purchased and connected to Vercel
- All email calls are fire-and-forget with `.catch(() => {})` — fail silently until activated
- Domain verified in Resend, `RESEND_API_KEY` added to Vercel — but account flagged by Resend, awaiting support resolution
- Welcome triggers: `AuthProvider.loadProfile` when inserting new profile
- Nudge triggers: `/api/flash` after `increment_uses` when `plan === 'free' && uses_this_month >= 3`

### Dark / Light Mode
- Toggle button (☀/☾) in MobileNav, desktop and mobile
- State persisted in `localStorage('mf_theme')`
- Applied via `document.documentElement.setAttribute('data-theme', ...)`
- FOUC prevention: inline script in `<head>` in layout.tsx reads localStorage and sets attribute before paint
- Light theme CSS vars defined in `[data-theme="light"]` block in globals.css
- **In light mode, blue accents are darkened**: `--blue` → #1D4ED8, `--blue2` → #2563EB, `--blue3` → #1E40AF (otherwise blue3 #60A5FA had poor contrast on white)
- **Nav-specific vars**: `--nav-bg` and `--nav-text` adapt to theme so the nav doesn't stay dark in light mode
- All hardcoded colors in MobileNav.module.css were replaced with CSS variables

### Product Showcase
- `src/components/ProductShowcase.tsx` — 3-tab static mockup on the landing page (after the Live Demo section)
- Tabs: Flash tool / Dashboard / Pack + Tasks
- All visuals built with theme variables — adapts to dark/light mode automatically
- Responsive: stacks columns on mobile, hides sidebar on dashboard mockup, tighter padding

### Blog
- 4 static articles in `src/lib/blog.ts` (Article[] data array)
- SEO slugs: `how-to-write-effective-meeting-notes`, `post-meeting-workflow-for-teams`, `how-to-write-follow-up-email-after-meeting`, `meeting-action-items-best-practices`
- Blog index at `/blog`, articles at `/blog/[slug]`
- `generateStaticParams()` used — pre-rendered at build time
- Each article ends with a CTA block linking to `/app`
- "Blog" link added to MobileNav (desktop + mobile)

### HeroCta Labels (src/components/HeroCta.tsx)
- Guest, no pack used → `'Try with sample notes →'`
- Guest, pack used → `'Continue Flashing →'`
- Logged in, 0 meetings → `'Try with sample notes →'` (queries DB)
- Logged in, has meetings → `'Continue →'` (queries DB)

### Share Page
- Public read-only pack view at `/share/[token]`
- Sticky banner fixed at bottom: "Turn your own meeting notes into an Execution Pack — Try free →"
- Banner links to `/app`

---

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY               ← used in webhook + cron to bypass RLS
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL                     ← used in email links
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID         ← price_xxx (monthly)
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID        ← price_xxx (monthly)
NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID  ← price_xxx (annual)
NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID ← price_xxx (annual)
CRON_SECRET                             ← random string, protects /api/cron/reset-uses
RESEND_API_KEY                          ← get from resend.com (needs custom domain to work)

---

## Features Completed ✅
- Google OAuth + email/password auth
- Flash tool — 7 outputs via Claude API
- Auto-save packs if logged in
- Guest free trial (1 pack without account)
- Dashboard — recent packs + projects tabs
- Pack hover preview (summary from decisions + actions)
- Task tracker — todo/in_progress/done per pack
- Project memory — decisions + tasks across meetings
- Smart search — full-text across all meetings
- Shareable recap — public link per meeting + sticky CTA banner
- Export PDF via window.print()
- Templates — sprint, client, standup, product
- Real usage counter from Supabase
- New project inline in /app
- Rename/delete/share on packs and projects
- Multi-select for batch delete
- Settings page — profile, plan, usage, delete account
- Mobile responsive — hamburger nav
- MobileNav + FooterAccount with auth state via useAuth
- Stripe checkout + webhook (all 3 events handled, team detection covers monthly + annual)
- Rate limiting on /api/flash (10 req/min per IP)
- Prompt caching on Claude API (~80% cost reduction)
- Upgrade modal when free limit reached
- Annual/monthly pricing toggle — wired to Stripe annual Price IDs
- SEO meta tags + OpenGraph in layout.tsx
- Vercel Analytics (`<Analytics />` in layout.tsx)
- Monthly usage reset — Vercel cron job (1st of month, midnight)
- Dark/light mode toggle — nav button, localStorage, FOUC-free
- Blog — 4 SEO articles, static, linked from nav
- Email routes (Resend) — built, blocked (Resend account flagged, awaiting support)
- Sitemap + robots.txt for SEO indexing (`src/app/sitemap.ts`, `src/app/robots.ts`)
- Favicon tight-cropped (was 1536×1024 with 70% whitespace, now 512×512 transparent)
- Light-mode contrast fix on blue accents + nav (was hardcoded dark)
- Product showcase section on landing page — 3 interactive mockups

## Features Pending ⏳
- Activate email (Resend) — account flagged, awaiting Resend support response
- Slack integration
- Notion integration
- Google Calendar integration
- SEO: add more blog articles over time

---

*Last updated: April 2026*
*Primary AI assistant: Claude (claude.ai + Claude Code)*
