# MeetingFlash — AI Context (Claude.ai + Claude Code)

## AI CONTEXT (IMPORTANT)
This project is assisted by AI coding agents (Claude Code + Claude.ai).

### Rules for AI:
- Always read this file first before making changes
- Never assume missing architecture decisions
- If context is unclear, ask before modifying core logic
- Update this file when new decisions are made
- This file is the single source of truth
- **Plan mode default**: for any non-trivial change (CSS rewrite, multiple files, auth/payments touch), present a short plan before editing. Don't speculate-and-fix.

### Mistakes to NOT repeat (learned the hard way)

**Theme / CSS**
- ❌ Never hardcode colors (`#060C18`, `rgba(255,255,255,0.07)`, etc.) — they don't adapt to light mode and the user has to ask for a fix every time. Always use CSS vars from `globals.css`: `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--blue`, `--blue3`, `--nav-bg`, etc.
- ❌ Never invent new CSS vars (`--paper`, `--wire`, `--spark`, `--font-mono`, `--ash`, `--void`) — they aren't defined anywhere and break silently. Use the canonical ones already in `globals.css`. Same for non-loaded fonts (e.g. `'Fragment Mono'`, `'Cormorant Garamond'`) — only `--font` (Plus Jakarta Sans), `--serif` (Instrument Serif), `--mono` (JetBrains Mono) are loaded.
- ❌ Don't apply blue-tinted text via `--blue3` (#60A5FA) on light backgrounds without checking contrast — light mode overrides darken it to #1E40AF.
- ❌ Watch for hardcoded near-white text inside *featured/elevated cards* (e.g. `color: rgba(248,250,252,0.75)`). Looks fine in dark mode, becomes invisible on the light-blue gradient in light mode. Use `var(--muted)` instead.
- When adding a top nav with back-button + ThemeToggle, use `display: flex; justify-content: space-between` so the toggle sits at the right edge, not glued to the back arrow. **And** make sure `.backLink` is NOT `position: fixed` — fixed positioning yanks it out of the flex flow and the toggle drops below it. Either drop `position:fixed`, or position both via the wrapper instead.
- For the share page (`/share/[token]`) and any nav strip on a sub-page (e.g. `blog/blog.module.css .nav`), use `var(--nav-bg)` + `var(--nav-text)` — never `rgba(6,12,24,…)` or `var(--text)` on the nav, which goes invisible in light mode.

**Supabase free tier hangs (root cause of most "infinite loading" bugs)**
- The Supabase free instance sleeps after inactivity → `supabase.auth.getSession()` and queries can stay pending forever (no error thrown).
- ✅ `AuthProvider.tsx` has a 4s safety timeout that releases `loading=false` only if `getSession()` itself hasn't resolved (Phase 10 fix — it used to fire unconditionally and wipe profile state mid-`loadProfile`). Don't remove it. Don't make it fire mid-fetch.
- ✅ `AuthProvider.loadProfile` waits for `session.access_token` to be attached (polls up to 2s, 500ms intervals) BEFORE issuing the profile query. Without this, RLS returns 0 rows on cold start, the code thinks "new user", tries to INSERT a free profile, conflicts with the existing Pro row, and `setProfile` never runs. The "Account" placeholder in the nav was this bug. Don't refactor `loadProfile` to skip the JWT wait.
- ✅ `AuthProvider.onAuthStateChange` does NOT wipe state on a SIGNED_OUT event when `sb-*` tokens are still in localStorage. That signature distinguishes a real sign-out (our `signOut()` clears those tokens first) from a transient token-refresh failure during cold start. Without this, navigating between pages occasionally logged the user out cosmetically. Don't remove the localStorage check.
- ✅ Background recovery: a separate effect in AuthProvider polls `loadProfile` every 4s while `user` is set but `profile` is null. Self-heals if all in-flight retries happened during the worst of the cold start. Don't remove.
- ✅ `signOut` is fire-and-forget (`window.location.replace('/')` runs immediately, doesn't wait for `supabase.auth.signOut()`). It also synchronously deletes every `sb-*` / `supabase.auth*` key from localStorage BEFORE the redirect. The token-clearing is what makes the SIGNED_OUT vs transient-failure distinction work — don't break that order.
- ✅ Pages that fetch user data (dashboard, settings, pack, project, /app) should:
  1. Use `useAuth()` from AuthProvider — never call `supabase.auth.getSession()` directly for auth state inside a page useEffect (only call it to **wait for the JWT to be attached** before firing data queries).
  2. `if (authLoading) return` early.
  3. `if (!user) router.replace('/login')` — never spinner-on-no-session.
  4. Before any `supabase.from(...)` query in the data-load function, do `const { data: { session } } = await supabase.auth.getSession(); if (!session?.access_token) return false` — treat missing JWT as a retryable failure. The dashboard `loadData` and /app projects effect both follow this pattern (added Phase 10). Without it, queries fire unauthenticated, RLS silently returns `[]`, and the page renders blank with no error.
  5. Add an 8s `setTimeout` safety to force `setLoading(false)` even if data fetch hangs.
- ✅ `/api/ping` exists to keep Supabase warm; user has UptimeRobot hitting it every 5 minutes.

**Stripe**
- Test-mode and live-mode subscriptions DO NOT cross over. Switching the keys from `sk_test_` → `sk_live_` invalidates all test-mode subscriptions silently.
- Don't compare `priceId` against `STRIPE_TEAM_PRICE_ID` (which holds a `prod_` ID in `.env.local`). Use `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID` (real `price_` ID) and include the annual variant in the check.

**Auth Provider**
- `getSession()` AND `onAuthStateChange` both run on mount and can both call `loadProfile`. This is intentional (race condition that resolves itself in prod). Don't "optimize" it.
- `loadProfile` retries once after 1.5s if the first fetch returns a hard error (Supabase cold-start). Don't remove the retry — without it, downstream pages see `profile = null` and treat a Pro user as Free until next refresh.
- **The flash tool (`src/app/app/page.tsx`) NOW uses `useAuth()`** (changed in Phase 9 — previous "leave alone" rule is obsolete). The reason for the swap: the page's old self-managed `getSession()` was async and ran AFTER initial render, so a logged-in Pro user would briefly see "Free pack used" + EN-only language locks while the session resolved. Reads `user`, `profile`, `loading: authLoading` from useAuth and derives `isLoggedIn`, `plan`, `usesLeft` from those — no local auth state. While `authLoading` is true, all guest CTAs ("Free pack used", "1 free pack", post-flash guest banner) are hidden behind a neutral "Loading account…" hint to prevent flashing the wrong UI.

**Email (Resend)**
- All email sends are fire-and-forget with `.catch(() => {})`. They must not block UI. The Resend SDK is lazy-instantiated inside the route handler — never at module top-level (build fails when `RESEND_API_KEY` is missing in CI).

**Workflow**
- After non-trivial changes, run `npx tsc --noEmit` before committing. Never skip it.
- Always commit with HEREDOC for the message body. Never use `--no-verify` or `--amend` on pushed commits.
- The user is non-coder. Explain in plain language *what* changed and *why*, not *how*. Avoid jargon ("Promise.race") in user-facing replies.

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
│   ├── page.tsx                     ← Landing page (hero, live demo, ProductShowcase, features, compare, agencies, outcomes, pricing, FAQ, founder note)
│   ├── pricing/                     ← /pricing standalone page (server) + PricingClient (client island for monthly/annual toggle)
│   ├── for-agencies/                ← /for-agencies SEO landing (ICP-targeted)
│   ├── for-product-teams/           ← /for-product-teams SEO landing (ICP-targeted)
│   ├── for-freelancers/             ← /for-freelancers SEO landing (ICP-targeted)
│   ├── tools/
│   │   ├── follow-up-email-generator/        ← Free-tool SEO landing → /app
│   │   ├── meeting-action-items-extractor/   ← Free-tool SEO landing → /app
│   │   └── discovery-call-recap-tool/        ← Free-tool SEO landing → /app
│   ├── not-found.tsx                ← Global 404 page (popular-pages cards, noindex)
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
- Global session managed by `AuthProvider.tsx` — every page uses `useAuth()`. The earlier exception for `/app` was removed in Phase 9; do not reintroduce a self-managed `getSession()` in any page.
- After login/signup: redirect to `/` (not `/dashboard`)
- OAuth callback route: `src/app/auth/callback/route.ts` — also enforces single-method auth post-OAuth (see "Single-method auth enforcement" below).
- `AuthProvider` calls both `getSession()` AND `onAuthStateChange` — both can call `loadProfile` simultaneously (known race condition in prod, do not change without testing). `loadProfile` is idempotent on the result (only `setProfile` when data exists), so two concurrent calls don't fight.
- `signOut` in AuthProvider: fire-and-forget `supabase.auth.signOut()`, then synchronous wipe of every `sb-*` / `supabase.auth*` key from localStorage, then `window.location.replace('/')`. The synchronous localStorage wipe is **load-bearing** for the transient-SIGNED_OUT distinction (see Mistakes section above). Don't await the Supabase call; don't reorder the wipe.
- **Always use the canonical `useAuth().signOut`.** `dashboard/page.tsx` and `settings/page.tsx` previously had their own local sign-out that awaited `supabase.auth.signOut()` and could hang when Supabase slept. Both now call `useAuth().signOut` directly. `settings/page.tsx`'s `deleteAccount` also finishes by calling the canonical signOut. Don't reintroduce local awaiting sign-out paths.
- **Welcome email trigger:** when `loadProfile` creates a new profile (first time, no existing row CONFIRMED via PGRST116 with the JWT attached), it calls `fetch('/api/email/welcome', ...)` fire-and-forget. Currently fails silently (Resend account flagged).

### Single-method auth enforcement (Phase 10)
Prevents a single email from ending up with both a Google identity and an email/password identity, which produced the "name flicker" bug (see Phase 10 in this file).
- **RPC** `public.get_auth_providers_for_email(check_email text) returns text[]` — `SECURITY DEFINER`, callable by anon. Migration: `supabase/migrations/2026_05_03_get_auth_providers.sql` (must be applied manually). Returns the providers linked to the email or `[]`.
- **`/signup`**: pre-flight RPC. If providers exist → block with method-specific message ("Use Continue with Google" / "Sign in instead").
- **`/login` password form**: pre-flight RPC. If providers exist but `'email'` is not in them → block ("This email is registered via Google").
- **`/auth/callback`**: post-OAuth check. If `user.identities.length > 1` AND any identity was created in the last 60s (`FRESH_MS = 60_000`) → freshly-linked dual identity, sign out + redirect to `/login?error=multi_identity`. Existing legacy dual-identity accounts (no fresh identity) are allowed through to avoid permanently locking them out — they need to be cleaned up via SQL (procedure documented in "Known data issue: dual identities" section). Same freshness gate covers the brand-new-Google-on-existing-email-account case via the RPC.
- **Login page** reads `?error=use_email | use_google | multi_identity | oauth_failed` from URL and surfaces the appropriate message inline.

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
- Model: `claude-haiku-4-5-20251001` (Phase 10 swap from `claude-sonnet-4-20250514` — ~3× faster on this structured-JSON task with comparable quality, since the schema does most of the heavy lifting). Don't revert without measuring; the user feedback was specifically that packs were too slow.
- max_tokens: 2500 (lowered from 4000 in Phase 10 — the old ceiling almost never got close, and lower budget = faster response).
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
- After increment, fetches profile to check if free user hit 5 uses → sends nudge email (fire-and-forget). The nudge email's literal copy still says "3 free packs" because user said skip email infra changes; update when Resend reactivates.
- **Server-side language gate:** at the top of the route, if `lang !== 'EN'` we look up the caller's plan via the auth header. Free users / guests get `effectiveLang = 'EN'` (cannot be bypassed by the client). Only `pro` / `team` keep their requested lang. The prompt and the `meetings.lang` insert both use `effectiveLang`, never the raw `lang`.

### Payments (Stripe)
- Pro: $12/month or $8/month billed annually ($96/yr)
- Team: **landing card replaced with "Coming soon" + mailto Notify-me CTA.** No checkout button on the page anymore. Stripe price IDs (`NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID` / `_ANNUAL_PRICE_ID`) are still in env so the webhook keeps recognizing existing Team subscribers, but no new Team checkouts can be triggered from the site.
- Monthly price IDs: `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`, `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID`
- Annual price IDs: `NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID`, `NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID`
- **All keys are LIVE mode** (`sk_live_`, `pk_live_`) — real payments active
- Checkout sends `metadata: { userId, priceId }` — both are needed
- Checkout: `success_url` → `/dashboard?upgraded=true`, `cancel_url` → `/#pricing`
- Webhook uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) — client created fresh per request
- **Webhook team detection:** checks if priceId is in `[NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID, NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID]` — covers both monthly and annual
- On `checkout.session.completed`: updates plan + saves userId to Stripe customer metadata
- On `customer.subscription.deleted` / `invoice.payment_failed`: looks up by userId from customer metadata, falls back to email

### Plan Gates (truth-in-advertising — every Pro bullet on the landing must hold)
- **Free** (`profiles.plan === 'free'`):
  - 5 Execution Packs / month (enforced in `/api/flash` and surfaced in app/settings/dashboard)
  - **English output only** — UI greys out FR/ES/DE with 🔒 and opens upgrade modal; `/api/flash` server-side overrides `lang` to `EN` for free users (`effectiveLang` in route.ts).
  - **1 project max** — checked in `dashboard/page.tsx:handleCreateProject` and `app/page.tsx:createProject`; over-limit creation routes user to `/#pricing`.
  - **No smart search** — `/dashboard/search` checks plan and renders an "Upgrade to Pro" lock screen instead of the search UI.
  - **No PDF export** — pack page swaps the Export PDF button for a 🔒 link to pricing.
- **Pro / Team** (`plan === 'pro' || 'team'`): all gates above lift. There is currently no Team-only feature in code; Team is hidden as "Coming soon" on the landing.
- **DON'T** silently revert any of these gates without also rewriting the corresponding landing-page bullet — they are paired by design (the user explicitly rejected misleading bullets).

### Landing Page Anatomy (conversion-focused — don't revert these copy decisions)
The landing was rewritten in two pre-launch passes after external reviewer rounds. Each section earns its place; do not re-introduce removed elements without explicit ask.
- **Hero headline**: "Send a client-ready meeting recap before they finish their coffee." Agency + privacy positioning. Badge above is serif italic with shimmer. Don't rewrite as a generic productivity headline.
- **No fake testimonials.** Reviewer-flagged as the #1 trust killer for a solo-shipped product. The old "Sarah K. / Marcus T. / etc." block was deleted and must NOT be re-added. If real testimonials arrive, we add them with full names + verifiable links.
- **No "Watch it work" duplicate demo section.** The Live Demo + ProductShowcase already cover this — a second demo block was reviewer-flagged as redundant.
- **For Agencies section** (`#agencies`, between `compare` and outcomes): ICP-targeted block with three pain-points (discovery → recap, status updates, project memory) + a Discovery Pack mockup ("Discovery call · Acme Corp" with Decisions / Action Items / Follow-up Email) + CTA "Try it on a discovery call →". The mockup reuses the same premium multi-layer shadow + hover lift pattern as ProductShowcase. Don't dilute by making it generic — the section earns its place by being specific to agencies.
- **Three outcome cards** (replaced the testimonials slot): "20 minutes back per meeting" / "Every action has an owner" / "Recap before next meeting starts". Honest, claim-based, no fake metrics.
- **Pro card bullets (6, all backed by code)**: unlimited packs, unlimited projects + project memory, smart search, output in EN/FR/ES/DE, PDF export, priority email support. Free counter-bullets sit right next to it: 5 packs/month, English output, 1 project, copy-to-clipboard. Do not add bullets that aren't actually gated in code (see Plan Gates section).
- **Team card** = "Coming soon" + `mailto:hello@meetingflash.work?subject=Notify me about Team` CTA. No price, no checkout. (See Payments.)
- **FAQ section (6 entries)** addresses the most common reviewer objections: accuracy on messy notes, where the data goes, supported languages, cancellation behavior, "built solo" reliability concerns, and why Team is delayed. The "built solo" answer is the trust anchor — keep its tone direct, not defensive.
- **"From the maker" note** (replaced the old "Built solo and shipping fast" one-liner): named founder Simon, direct `hello@meetingflash.work` email, plain-language. This adds the human/trust dimension reviewers said was missing. Don't replace with growth-hacking copy.
- **Currency consistency**: Free is `$0` (was `
` — mixed currencies confused users since Pro is `$12`). All prices on the landing are USD.
- **Brand mark = `/logo.png` everywhere.** Login, signup, share page, dashboard sidebar, ProductShowcase mockups all use `<Image src="/logo.png" />`. The old "blue square" placeholder is gone — don't re-introduce it on new pages.

### Post-flash Guest CTA (`src/app/app/page.tsx`)
After a guest finishes their 1 free pack, the CTA copy below the result is: *"That took 20 seconds. Save this pack, and get 4 more like it this month — free, no credit card."* Button label: **"Save this pack"** (not "Create free account" — action-oriented beats generic). This is the conversion moment from guest → free signup; don't soften it back to a generic CTA.

### Activation & Stickiness (don't remove without replacement)
The user is non-coder, motivated, and worried about retention. These three pieces exist to anchor users into the product and are load-bearing for retention; redesigning them is fine, removing them isn't.
- **Time-saved toast** (`src/app/app/page.tsx`): after `setPack()`, computes `actionsCount * 3 + 10` minutes (floor 15), renders a top-right gradient card "~X minutes back — That's how long this would've taken to write by hand." auto-dismisses after 6s. This is the wow moment — anchors value at the exact second the user feels it.
- **Loader messages** rewritten to feel like cognition: "Reading your notes—", "Identifying decisions—", "Mapping owners to actions—", "Drafting your follow-up email—", "Building the next agenda—". Cycles every 1.1s. Don't revert to the old generic "Analyzing transcript—" set.
- **Open-actions widget** (`src/app/dashboard/page.tsx`, top of "Recent packs" tab): loads up to 20 tasks where `status != 'done'`, renders the top 5 with owner / deadline / meeting title, each row links to the pack page. Hidden when there are zero open tasks. This is the recurring-return hook: "I have 8 open actions sitting there."
- **ICP-targeted templates** in `app/page.tsx` `TEMPLATES` const: Discovery call (agency → prospect), Client status update, Sprint retro (product team), 1-on-1 (manager ↔ IC). Each is written as a coaching framework, not just a meeting agenda — they prompt the user to capture felt-vs-unsaid, blockers, commitments, so the resulting Pack is meaningfully richer. Don't replace with generic agenda outlines.

### Free Trial Logic
- Guest (not logged in): 1 free pack via `localStorage('mf_guest_used')`
- Free plan: 5 packs/month tracked in `profiles.uses_this_month`
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
- Nudge triggers: `/api/flash` after `increment_uses` when `plan === 'free' && uses_this_month >= 3` — the literal "3" mismatch with the new 5-pack limit is intentional (user said don't touch email infra). When Resend reactivates, also bump nudge threshold + the email body copy to "5".

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
- **9 static articles** in `src/lib/blog.ts` (Article[] data array). Slugs:
  - `how-to-write-effective-meeting-notes`
  - `post-meeting-workflow-for-teams`
  - `how-to-write-follow-up-email-after-meeting`
  - `meeting-action-items-best-practices`
  - `how-to-summarize-meeting-notes-with-ai` (AI/automation, broad)
  - `best-ai-meeting-recap-tools-for-agencies` (comparison, agency ICP)
  - `discovery-call-recap-template` (agency ICP — links to /app discovery template)
  - `sprint-retrospective-template` (product team ICP)
  - `client-status-update-email-template` (agency ICP)
- Blog index at `/blog`, articles at `/blog/[slug]`
- `generateStaticParams()` used — pre-rendered at build time
- Each article ends with a CTA block linking to `/app`, then a 3-card "Related reading" block (`getRelatedArticles()` in blog.ts: same-category first, then fill) — that's the internal-linking surface for SEO
- Article renderer (`blog/[slug]/page.tsx:parseInline`) supports `[text](url)` markdown links — internal links use Next `<Link>`, external use `<a rel="noopener">`. Inline `**bold**` still works alongside links. Whole-line `**bold**` becomes an emphasized paragraph.
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
- Theme: uses canonical CSS vars (`--bg`, `--surface`, `--nav-bg`, `--blue`, `--amber`, `--red`, `--muted`) and the project fonts (`--font` / `--serif`). Adapts to light/dark. Block category accents = decisions/agenda blue, actions amber, risks red, questions/email/slack muted. Pack-not-found state lives in `.notFound` styles, not inline.

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
- Sitemap + robots.txt for SEO indexing (`src/app/sitemap.ts`, `src/app/robots.ts`) — `/login`, `/signup`, `/share/` are explicitly disallowed and noindex'd
- Dynamic OpenGraph image at `/opengraph-image` (1200×630, generated edge-runtime via `next/og` in `src/app/opengraph-image.tsx`) — used by home page; blog posts reference it as their fallback image
- Structured data (JSON-LD): `Organization` site-wide (root layout), `WebSite` + `SoftwareApplication` + `FAQPage` on home (`page.tsx` — FAQ data lives in `FAQ_ITEMS` const, used by both the JSX and the JSON-LD; keep them in sync), `BlogPosting` on each article (`blog/[slug]/page.tsx:articleJsonLd`)
- Canonical URLs on every public page via `alternates.canonical` in metadata (root, `/app`, `/blog`, `/blog/[slug]`); `/login`, `/signup`, `/share` are `noindex` instead
- Per-route metadata via dedicated `layout.tsx` for client pages (`/app/layout.tsx`, `/login/layout.tsx`, `/signup/layout.tsx`) — these client pages can't export metadata themselves

### ICP landing pages + standalone /pricing (SEO Phase 3)
- **Shared styles** in `src/styles/marketing.module.css` — used by `/for-agencies`, `/for-product-teams`, `/for-freelancers`, and (partially) `/pricing`. Don't duplicate hero/section/card/mockup/FAQ classes per page; extend the shared module instead.
- **`/for-agencies`, `/for-product-teams`, `/for-freelancers`** are full SEO landings: hero with ICP badge + agency/team/freelancer-specific headline, 4 meeting-type cards, pain-point + Discovery/Sprint/Client mockup split, ICP-specific FAQ (5 entries each, also exposed as `FAQPage` JSON-LD), CTA banner, mini-footer. Each has `WebPage` + `FAQPage` JSON-LD. Mockup uses the same multi-layer shadow language as ProductShowcase.
- **`/pricing` standalone** = server component for metadata + `Product` JSON-LD with all 3 offers (Free, Pro Monthly, Pro Annual) + `FAQPage`. Toggle is in `PricingClient.tsx` (client island) with monthly/annual + Stripe checkout call. Pricing-specific module at `src/app/pricing/pricing.module.css`. The Team card here matches the landing rule: "Coming soon" + Notify-me mailto, no checkout button.
- **All `/#pricing` redirects updated to `/pricing`** site-wide: dashboard upgrade buttons, settings upgrade, search Pro lock, pack PDF gate, Stripe `cancel_url`, nudge email CTA, Nav.tsx + MobileNav. The on-page `#pricing` anchor on the landing still exists as a deep-link fallback but new code should target `/pricing`.
- **Sitemap** includes the 4 new pages with priorities: `/pricing` 0.85, `/for-*` pages 0.8 each.
- **Footer** on landing has a new "Use cases" column with the 3 ICP pages. MobileNav (mobile menu) also lists them.

### Free-tool SEO landings + 404 (SEO Phase 4)
- **`/tools/follow-up-email-generator`, `/tools/meeting-action-items-extractor`, `/tools/discovery-call-recap-tool`** are single-purpose SEO landings that target long-tail tool queries ("free follow-up email generator", "extract action items from meeting notes", "discovery call recap tool"). Each has hero, "how it works" or example mockup, FAQ, CTA → `/app`. Each declares `WebApplication` JSON-LD (free Offer, applicationCategory: BusinessApplication) + `FAQPage` JSON-LD. Each cross-links to the others, to the related blog article, and to the related ICP page. They reuse `marketing.module.css` — no new CSS module.
- **The `/app` flash tool is the same destination** — the `/tools/*` pages are framing layers that match a specific search intent and convert to the same /app entry point. Don't build a new tool route per landing — reuse /app.
- **Sitemap** includes all 3 tool pages at priority 0.75.
- **Footer** on landing has a new "Free tools" column listing all three. (MobileNav doesn't list them — the menu would get too long; footer is enough for crawl discovery.)
- **`src/app/not-found.tsx`** = global 404 with `noindex, follow` — a styled page with 4 popular-page cards (/app, /pricing, /blog, /for-agencies) so visitors who land on a broken link have routes back into the funnel. The `follow` directive lets Google still crawl the links from this page.

### Performance + advanced schemas + a11y (SEO Phase 5)
- **All `<img src="/logo.png">` migrated to `next/image`** across MobileNav, ProductShowcase, login/signup/dashboard/share/app pages. Critical above-the-fold logos (nav, auth, dashboard) get `priority`. Auto-generates WebP/AVIF, lazy-loads non-critical, sized-attribute reservation prevents layout shift (CLS Core Web Vital).
- **`viewport` export** in root layout: `themeColor` adapts dark/light, mobile width/scale set explicitly. Mobile address-bar matches the theme.
- **Preconnect / dns-prefetch** in root layout `<head>`: Google Fonts (preconnect with crossOrigin), Anthropic API + Stripe (dns-prefetch). Browser opens TLS sessions in parallel with HTML parse — faster first interaction.
- **Web App Manifest** at `/public/manifest.json` (referenced from root metadata `manifest: '/manifest.json'`) — name/short_name/description, start_url `/app`, theme_color, icons. Signal "real app" to crawlers + lets users "Add to home screen". The `/logo.png` icon is set with `purpose: 'maskable'`.
- **`prefers-reduced-motion: reduce`** block in `globals.css` — kills all animations / transitions / smooth-scroll for users who request reduced motion. Lighthouse a11y boost + accessibility correctness.
- **`BreadcrumbList` JSON-LD** added to: blog articles (Home → Blog → Article), each ICP page (Home → For X), each tool page (Home → Free tools → Tool name), `/pricing` (Home → Pricing). Helper at `src/lib/breadcrumb.ts:buildBreadcrumb()` — pass an ordered array of `{name, path}` crumbs; Home is auto-prepended. Google may render breadcrumbs in SERPs (CTR boost).
- **Search Console verification slot** prepared in root layout metadata as a commented-out `verification: { google: '...' }` line. When you claim the property in https://search.google.com/search-console, paste the token and uncomment.

### Quality refinements — output upgrade + active memory (Phase 7)
This phase pivoted the perceived value of a Pack from "structured summary" to "senior-analyst brief". Don't dilute these without an explicit reason.

- **Executive Snapshot** (`pack.snapshot`) — new field at the top of every Pack. The prompt asks Claude to produce a 2-3 sentence senior-consultant brief: what just happened, the cardinal risk, the next critical move — with specific names/numbers from the notes. Rendered as a gradient blue card *above* the regular blocks in `/app`, `/share/[token]`, and `/dashboard/pack/[id]`. Included in "Copy All". This is the wow moment now — not the speed.
- **P0 / P1 / P2 priority tiers** in the `actions` block — the prompt forces a single string with three inline section headers ("P0 — Blockers", "P1 — Commitments", "P2 — Maintenance"), each followed by `•` items. Empty sections are skipped. **Critical**: `actions` MUST be a single string, NOT a JSON object — Claude will sometimes try to return it as `{P0: ..., P1: ..., P2: ...}` and the React renderer would crash with "Objects are not valid as a React child". Two layers of defense: (1) the prompt repeats "actions is one string" multiple times; (2) `packFieldToString()` in `src/lib/supabase.ts` defensively coerces any object/array back to a clean line-broken string. ALWAYS render Pack fields through `packFieldToString` — never `pack.field` directly.
- **Differentiated tones** — the prompt now imposes 3 registers: `email` = agency-premium client-facing (warm but specific, references a detail from the call, no template phrases like "I hope this email finds you well"), `slack` = casual-direct internal team voice with optional emojis, `agenda` = strategic with "why it's on the agenda" framing (not "Status update / Q&A").
- **Risks + Mitigation** — every risk bullet is followed by a `Mitigation:` line on the next line. The prompt enforces this with a literal format example.
- **Inferred Open Questions** — the `questions` block now includes BOTH explicit questions AND implicit gaps (missing approvers, unconfirmed dependencies, unscoped commitments) prefixed with `Inferred:`. This is the one piece with hallucination risk — monitor user feedback.
- **Active memory (cross-meeting context)** — when `projectId` is set, `/api/flash` fetches three things from the project and injects them as a "PROJECT MEMORY" preamble: (1) the project's free-text `notes` field as a "PROJECT BRIEF" sub-block at the top (added in Phase 9 — long-running context like client info, tone, do's/don'ts), (2) the last 5 meetings' decisions, (3) all non-done tasks from those meetings. The prompt instructs Claude to cross-reference: progress on prior commitments, surface still-open items as inferred questions if not addressed, flag prior decisions being revisited. **This is the moat vs ChatGPT** — ChatGPT has no access to prior context. DB errors during the memory fetch are caught silently (try/catch) so a broken query never blocks a flash.

### Bug fixes shipped with Phase 7
- **Sign-out reliability fix** in `AuthProvider.signOut` — `supabase.auth.signOut()` is fire-and-forget but races against `window.location.replace('/')`. If the redirect fired before Supabase cleared its localStorage tokens, the next page load restored the session and "sign out" silently failed. Fix: synchronously delete every `localStorage` key starting with `sb-` or containing `supabase.auth` BEFORE the redirect. Don't undo this — the symptom was hard to debug.
- **HeroCta simplified to 2 states** — was 4 states (signed-out × guest-used / signed-in × meeting-count). User feedback: inconsistent, confusing. New rule: signed-out OR loading → "Try with sample notes →"; signed-in → "Continue →". Reflects real intent: a logged-in user already has account context, the CTA should simply send them to the tool. Don't restore the meeting-count branch — it caused regressions on cold cache.
- **Defensive Pack rendering** via `packFieldToString` (helper in `src/lib/supabase.ts`) — coerces any field (string / object / array / null) to a safe newline-joined string. Used in `/app`, `/share/[token]`, `/dashboard/pack/[id]`. Prevents the recurring "Objects are not valid as a React child" crash when Claude returns a structured field.
- **Dashboard pack detail JSX bug** in `dashboard/pack/[id]/page.tsx` — the `.blockContent` div was rendering the literal string `: meeting.pack?.[block.id] ?? '—'` (missing JSX `{}` braces, pre-existing). Fixed by wrapping in `{packFieldToString(...)}`.
- **Stale "3 free packs" copy in /app** (`src/app/app/page.tsx:613`) — the post-flash guest CTA said "Create account for 3 more →" from the era when Free was 3 packs/month. Bumped to "Create account for 5 more →" to match the actual Free plan (5 packs/month). NOTE: the matching copy in the welcome + nudge **emails** is intentionally still "3" — see the P0 roadmap entry. The email copy gets bumped when Resend reactivates the account; the in-app UI copy was the only one safe to fix independently.

### "For" dropdown in nav (visibility for ICP pages)
- ICP pages (`/for-agencies`, `/for-product-teams`, `/for-freelancers`) were buried in the footer only — feedback was they felt hidden. Added a "For ▾" dropdown in the desktop nav (`MobileNav.tsx:forWrap` / `forMenu`). Mobile menu already lists them flat. The dropdown closes on outside click (handler in `MobileNav` useEffect). Don't replace this with 3 inline links — the desktop nav is already at capacity; a dropdown groups them semantically.

### ICP → /app template prefill (Phase 8a)
The 3 ICP pages were "marketing only" — same `/app` for everyone. Now each ICP CTA sends to `/app?template=<slug>` and the textarea auto-fills with the matching template on mount.
- Mapping: `/for-agencies` → `?template=discovery`, `/for-product-teams` → `?template=retro`, `/for-freelancers` → `?template=status`. The 1-on-1 template stays available via the in-app templates dropdown but isn't an ICP-page entry point.
- Slug map lives in `src/app/app/page.tsx:TEMPLATE_SLUG_MAP` (URL-safe slugs → TEMPLATES keys). `useEffect` on mount reads `window.location.search` (no `useSearchParams`, avoids the Suspense boundary requirement).
- Each ICP page now delivers something concrete: a pre-filled call template, not just a generic redirect. Don't revert to plain `/app` links — that's what made the pages feel like dead-end content marketing.

### Premium P0/P1/P2 priority view (Phase 8b)
The `actions` block parses its string client-side into 3 visually distinct tier cards.
- Helper `parseActionTiers(text)` in `src/lib/supabase.ts` — robust to header variations (`P0 — Blockers`, `P0 -`, `P0:`), strips bullets, returns `{ p0, p1, p2, unsorted }`. The `unsorted` bucket catches items Claude emitted before any tier header (fallback rendering).
- **Single shared component** `<ActionTiers />` at `src/components/ActionTiers.tsx` + `ActionTiers.module.css` — used by `/app`, `/share/[token]`, `/dashboard/pack/[id]`. Renders P0 with red gradient + 🔴 icon, P1 with amber + 📌, P2 muted + ○. Counts shown as pill badges. Falls back to plain text if `total === 0` (Claude skipped headers). Server-component compatible (no hooks). Don't recreate per-page copies — Phase 8 originally had 3 duplicated locals; the refactor consolidated them.
- Light-mode tier colors are darkened via `:global([data-theme="light"])` overrides for contrast.
- Don't revert to a single text block — the visual hierarchy is the whole point of the priority work.

### Inferred-Question badge (Phase 8b cont.)
The `questions` block has its own renderer `<QuestionsView />` at `src/components/QuestionsView.tsx` (+ module CSS) that parses each line and visually distinguishes items prefixed with `Inferred:` (gaps the tool surfaced from absences in the notes — see Phase 7 prompt) from explicit questions raised in the call.
- Inferred items render with: 💭 icon, blue tinted background, blue left border, an "INFERRED" pill badge inline with the text. Explicit questions render plain with a "?" round dot.
- The "Inferred" treatment is the visual hook that signals the tool actually thought about the meeting, not just extracted text. Don't remove it — Phase 7 went to the trouble of inferring those items in the prompt; the UI must surface that effort.
- Used in `/app`, `/share/[token]`, `/dashboard/pack/[id]` via the shared component.

### Template-loaded banner on /app (Phase 8a cont.)
When `/app?template=<slug>` prefills the textarea (from an ICP-page CTA), a dismissible banner appears above the textarea: 📋 icon + "{TemplateName} template loaded — replace the bracketed placeholders with your actual notes." + ✕ dismiss button.
- State `templateBanner` holds the readable template name; `setTemplateBanner(null)` on dismiss. Animation reuses `blockIn` keyframe.
- Without this banner the textarea looked pre-filled-for-no-reason, which felt confusing. Don't ship the prefill without the banner — they're paired UX.

### PWA polish (Phase 8c)
- iOS-specific metadata in root layout (`appleWebApp.capable: true`, `statusBarStyle: 'black-translucent'`, `formatDetection.telephone: false`) → "Add to Home Screen" on iPhone gives a real fullscreen app feel, no auto-linking phone numbers.
- Service worker at `public/sw.js` — minimal cache-first strategy for static assets only (`/manifest.json`, `/favicon.png`, `/logo.png`, plus regex match on image/font extensions). API routes (`/api/`) and auth (`/auth/`) bypass the SW entirely (always network — the app needs fresh AI/auth responses). Versioned via `CACHE_NAME = 'meetingflash-v1'` — bump the version on breaking changes.
- Registration via `<SwRegister />` client component (rendered in root layout body). Only registers in production (`NODE_ENV === 'production'`), only if `serviceWorker` is supported, errors swallowed silently. Don't await the registration — it must never block the UI.
- ⚠️ NOT yet done: a proper "maskable" icon with safe-area padding. The current `/logo.png` is set with `purpose: 'maskable'` in the manifest but it's a square image without inner safe area, so it'll get cropped on circular Android masks. To fix: regenerate `/logo.png` with the icon centered inside the inner 80% of a 512×512 canvas. Defer until you have actual install metrics that show this matters.

### Phase 9 — /app auth fix, integrated projects, dashboard cold-start recovery, project notes
This phase tackled 4 reported bugs + 1 product upgrade in one pass.

- **/app now uses `useAuth()`** (replaces the page's old self-managed `getSession()` + local `isLoggedIn`/`plan`/`usesLeft` state). Reason: a logged-in Pro user briefly saw "Free pack used" + EN-only language locks because the local async auth hadn't resolved by first render. With useAuth, those values are derived synchronously from React context. This OVERRIDES the previous "leave alone" rule in the Auth Provider section above. While `authLoading` is true, all guest CTAs (the bottom hint, the post-flash "Save this pack" banner) are hidden behind a neutral "Loading account…" placeholder so the wrong UI never shows.
- **Clear button on /app** — small red-tinted "Clear ✕" button next to "Load sample" in the input header, visible only when the textarea has content. Clears text + dismisses any active template banner + clears errors in one click. Pattern lives in `src/app/app/app.module.css:.clearBtn`.
- **Project UX integration on /app** — when a project is selected the dropdown stays visible (so the user can switch projects on the fly), but: (1) the select gets a blue tint via `.selectActive` class to signal context-mode, (2) the "+ New" button disappears (you're already in a project; deselect first to make another), (3) the field label appends "· memory active (last 5 meetings injected)" so the user understands what selecting a project changes. Don't revert to a static dropdown — the active-tint + memory hint is the visual feedback that makes the persistent-context feature legible.
- **Project notes (long-running context)** — new `notes` text column on `projects` (migration in `supabase/migrations/2026_05_02_add_project_notes.sql` — must be applied manually in Supabase SQL editor). Edited on `/dashboard/project/[id]` Overview tab via a "🧠 Project notes" card at the top with Edit/Save flow. Injected into `/api/flash` as a new "PROJECT BRIEF" block at the top of PROJECT MEMORY when projectId is set — this comes BEFORE prior decisions and open tasks because it's the most-stable context. Use case: client name + roles, deal size, tone preferences, do's/don'ts that should colour every meeting recap. This is what turns a project from a "tag" into a real client dossier.
- **Dashboard cold-start recovery** — `loadData` no longer blindly calls `setMeetings([])` / `setProjects([])` on Supabase errors (the previous behaviour silently wiped visible state when the free-tier instance was sleeping). Now: returns boolean ok/fail, retries once after 1.5s on hard error, and on persistent failure surfaces a yellow "Couldn't load your data — Retry" banner above the dashboard header instead of a blank page. Same defensive retry pattern applied to `dashboard/settings/page.tsx` (fixed the "my saved name disappeared" bug — same root cause) and to `AuthProvider.loadProfile` (so the profile/plan doesn't come back null on cold-start, which would cascade into Pro-being-shown-as-Free everywhere).
- **Select button hidden when there's nothing to select** — on `/dashboard`, the "Select" button only renders if the active tab has at least one item (`meetings.length > 0` for recent, `projects.length > 0` for projects). Don't restore the unconditional render — there is nothing useful for the user to do with bulk-select on an empty list.

### Phase 10 — Auth stability + speed (May 2026)
The "Free plan flicker" symptom that triggered Phase 9 turned out to be the surface of three deeper bugs in the auth flow. This phase fixes them root-and-branch and locks the door against the underlying cause.

**Speed**
- AI model swap: `claude-sonnet-4-20250514` → `claude-haiku-4-5-20251001` in `/api/flash`. Roughly 3× faster on this tightly-structured JSON task with comparable quality (the schema does most of the heavy lifting). Combined with `max_tokens: 4000 → 2500` (which was a safety ceiling that almost never got close), packs now load in roughly half the previous time. Don't revert to Sonnet without measuring — the user feedback was specifically "too slow".

**Auth — stop wiping state on transient SIGNED_OUT**
- Symptom: navigating between /app and /dashboard occasionally flipped the account into Free mode even though the user was still logged in. Page-level Supabase queries 401 on free-tier cold-start; the JS client tries to refresh; the refresh also fails; the client fires SIGNED_OUT; our handler called `setUser(null) + setProfile(null)`. The localStorage tokens were still present — it wasn't a real sign-out.
- Fix in `AuthProvider.onAuthStateChange`: when the event has no session, scan localStorage for `sb-*` keys. If present → transient refresh failure, KEEP user/profile state and retry `getSession()` after 1.5s. If absent → real sign-out (our `signOut()` synchronously clears those keys before redirecting), wipe state.
- Don't undo this — without it, every cold-start refresh logs the user out cosmetically.

**Auth — `loadProfile` waits for the JWT before querying**
- Root cause of the "Account" placeholder + Free-mode UI for a paying Pro user. After a session resolves, the global `supabase` client takes a beat to attach the JWT to outgoing requests. If `loadProfile` fires its `.from('profiles').single()` in that window, RLS sees an unauthenticated request and returns 0 rows (PGRST116). The old code interpreted PGRST116 as "no profile yet" and tried to INSERT a new free profile, which conflicted with the existing Pro row → `setProfile` never ran → UI shows nothing or falls back to "free".
- Fix in `AuthProvider.loadProfile`: poll `supabase.auth.getSession()` until `session.access_token` is attached (up to 2s, 500ms intervals) before issuing the profile query. Then fetch with three retries at 0/1.5s/3s backoff. Only run the new-profile INSERT branch when PGRST116 is observed AFTER the JWT is confirmed present.
- Background recovery: a separate effect retries `loadProfile` every 4s while `user` is set but `profile` is still null. Self-healing if the cold start outlasts the in-flight retries.

**Auth — MobileNav placeholder while profile pending**
- Symptom: even when the profile load was healthy, the nav briefly rendered "adrienharrel" (the email prefix) before swapping to "Harrel" (the Google name). The displayName fallback chain was `profile?.full_name → profile?.email?.split('@')[0] → user?.email?.split('@')[0]` — that second-to-last step would fire while profile was still in flight.
- Fix in `MobileNav.tsx:60`: define `profilePending = loading || (!!user && !profile)`; while pending, render "Account" + "·" initial instead of the email-prefix fallback. Plan badge similarly shows "—" instead of the false "free" fallback during pending.
- The 4s `loading` safety timeout in AuthProvider was also bug-fixed (`useEffect` body, ~line 105): it used to fire `setLoading(false)` unconditionally even mid-`loadProfile`. Now only fires if `getSession()` itself hasn't resolved, letting `loadProfile` finish on its own retry budget.

**Auth — single-method enforcement (anti-doublon)**
- Migration `supabase/migrations/2026_05_03_get_auth_providers.sql` creates `public.get_auth_providers_for_email(check_email text) returns text[]` as a `SECURITY DEFINER` RPC, callable by the anon key — returns `['google']`, `['email']`, both, or `[]`. **Must be applied manually in Supabase SQL editor.** Don't wire any new check to this without confirming the migration ran.
- `/signup`: pre-flight RPC call. If providers exist, block with method-specific error ("Use Google" vs "Sign in").
- `/login` (password form): pre-flight RPC. If email has only Google identity → block with "Use Continue with Google" before `signInWithPassword` (which would otherwise return generic "invalid credentials" and send the user in circles).
- `/auth/callback` (Google OAuth): after `exchangeCodeForSession`, check `user.identities`. If `length > 1` AND any identity was created within the last 60s → freshly-linked dual identity, sign out + redirect to `/login?error=multi_identity`. Existing legacy dual-identity accounts (no fresh identity) are allowed through to avoid permanently locking them out — they need to be cleaned up manually via SQL. Same freshness gate applied to the case where a brand-new Google user collides with an existing email/password account.
- Login page reads `?error=use_email | use_google | multi_identity` from URL on mount and shows the appropriate red error inline.

**Dashboard / /app — wait for JWT before querying (same root cause)**
- Same race that bit `loadProfile` was hiding the dashboard's data + emptying the project dropdown on `/app`. Symptom: dashboard sidebar showing the contradictory "FREE / Unlimited" combo (because the local `profile` state was null → planName fallback `'free'` + ternary picking the non-free branch `'Unlimited'`).
- `dashboard/page.tsx:loadData` now starts with `supabase.auth.getSession()` and treats a missing `access_token` as a retryable failure (returns `false`, surfaces the yellow "Couldn't load your data — Retry" banner if both attempts fail).
- Dashboard sidebar now reads `effectiveProfile = profile ?? authProfile` (where `authProfile` is from `useAuth()`) so the badge can never show the contradictory state. It defaults to "—" / "—" while truly unknown rather than a misleading "free".
- `/app` projects effect uses the same `getSession` → query → 1.5s retry pattern. Without this, navigating from /dashboard to /app would fire the projects query before the JWT attached, RLS returned `[]`, and the dropdown appeared empty even though projects existed.

**Other**
- Next.js: `14.2.0 → 14.2.35`. Fixed the HMR `removeChild` runtime error in dev. Stayed on 14.x; do NOT jump to 16.x without a separate migration plan (async params in server components is a breaking change).
- Added `<meta name="mobile-web-app-capable" content="yes" />` in root layout `<head>` — silences Chrome's deprecation warning about the apple-only variant. The `appleWebApp` metadata still emits the iOS variant.

### Known data issue: dual identities on same auth user (NOT dual profiles)
The Phase 9 hypothesis was wrong — when we ran the diagnostic SQL on the founder's account it showed only ONE row in both `auth.users` and `profiles`, but `auth.identities` had **two rows** for the same `user_id` (one `provider='google'`, one `provider='email'`). Supabase had linked them when the project's auth setting "Allow same email across providers" was on.

**Symptom**: Same single auth user appears differently depending on session — "adrienharrel" (email-prefix fallback) vs "harrel" (Google name) — because each identity carries different `user_metadata`, and which one populates `session.user` depends on the active sign-in method. The plan stays correct because Stripe → profile → `auth.users.id` is a single chain.

**Manual cleanup** (use this when a user reports cross-method confusion):
1. List both identities: `SELECT i.id AS identity_id, i.provider, i.created_at FROM auth.identities i JOIN auth.users u ON u.id = i.user_id WHERE u.email = '<email>' ORDER BY i.created_at;`
2. Decide which method to keep (usually whichever is the user's primary).
3. Delete the unwanted identity row: `DELETE FROM auth.identities WHERE id = '<identity_id>' AND provider = '<email|google>';`
4. The user can no longer log in via the deleted method on that account, but the profile, plan, meetings, tasks, projects all stay intact (they're keyed on `auth.users.id`, not the identity).

**Prevention** is shipped in Phase 10 (single-method enforcement above) — new users can't end up in this state. The legacy "two separate auth.users rows" scenario from Phase 9 may also exist for some users; the cleanup procedure for that case is preserved below for completeness.

**Legacy "two separate auth.users rows" cleanup** (rare — happens when the linking setting was off at sign-up time):
1. `SELECT id, email, raw_app_meta_data->>'provider' AS provider, created_at FROM auth.users WHERE email = '<email>' ORDER BY created_at;`
2. Identify the row with the active Stripe subscription via `profiles.plan = 'pro'`.
3. Reassign data: `UPDATE meetings SET user_id = '<winner_id>' WHERE user_id = '<loser_id>';` (then `tasks`, `projects`).
4. Delete the loser auth.user via Supabase dashboard.

- Favicon tight-cropped (was 1536×1024 with 70% whitespace, now 512×512 transparent)
- Light-mode contrast fix on blue accents + nav (was hardcoded dark)
- Product showcase section on landing page — 3 interactive mockups
- Pre-launch landing redesign — agency-positioned hero, three outcome cards (replaced fake testimonials), 6-entry FAQ, "From the maker" founder note
- Truthful Pro plan gates enforced server- and client-side (lang, projects, search, PDF export)
- Time-saved toast + cognition-style loader messages + open-actions dashboard widget + ICP-targeted templates (retention/stickiness pass)
- Sharper post-flash guest CTA ("Save this pack") on `/app`
- Canonical `useAuth().signOut` everywhere — no more local awaiting sign-out paths in dashboard/settings

## Roadmap / TODO (priorities)

This section is the **source of truth for what's left to do**. Update as items ship or get deprioritized. Newest decisions go above older ones within a priority bucket.

### P0 — Live data issue (manual cleanup needed in Supabase)
- **Migration not yet applied** — `supabase/migrations/2026_05_03_get_auth_providers.sql` must be run in the Supabase SQL editor before the single-method auth enforcement gates do anything. Until then, /signup and /login fall through silently (the RPC call returns no data, the gate is bypassed). Migration `2026_05_02_add_project_notes.sql` (project notes column) also needs to be applied if not already.
- **Founder's own dual identity** — the founder's account (`adrienharrel@gmail.com`) has two linked identities (`provider='google'` + `provider='email'`) on the SAME `auth.users` row. NOT a dual-profile situation (Phase 9's hypothesis was wrong — see "Known data issue" section). Until the email identity is deleted via SQL, OAuth login is allowed (the freshness gate exempts legacy duals) but the cosmetic name/plan flicker is mitigated by the placeholder + recovery polling, not eliminated. To eliminate fully: delete the unwanted identity row (procedure in "Known data issue: dual identities").

### P0 — Blocked on external action (no code work possible right now)
- **Resend email account reactivation** — Resend flagged the account, awaiting their support response. Until lifted, all `/api/email/*` routes silently no-op (fire-and-forget with `.catch(()=>{})`). Once reactivated:
  - **Welcome email copy fix**: `src/app/api/email/welcome/route.ts:39` says "3 free Execution Packs" → bump to **5** (matches current Free plan limit).
  - **Nudge email copy fix**: `src/app/api/email/nudge/route.ts:19+39` say "3 free packs" → bump to **5**.
  - **Nudge trigger threshold**: `src/app/api/flash/route.ts:182` checks `uses_this_month >= 3` → bump to `>= 5` so the nudge fires at the actual limit, not earlier.
  - All three are intentionally NOT touched yet because the user said skip email infra changes until Resend reactivates. Don't fix in isolation.
- **Search Console domain claim** — `meetingflash.work` not yet registered on https://search.google.com/search-console. Slot ready in `src/app/layout.tsx` as commented `verification: { google: '...' }`. When the user claims the domain, paste the token and uncomment.

### P1 — High-impact, ready to execute
- **i18n FR / ES / DE (SEO Phase 6)** — Pro plan already outputs in EN/FR/ES/DE but the marketing site is EN-only. Big SEO opportunity: each language gets its own Google index footprint.
  - Recommended approach: subpath routes `/fr/*`, `/es/*`, `/de/*` (English stays at root), `hreflang` alternates in metadata, sitemap includes all variants, lightweight in-house translations dict at `src/lib/i18n.ts` (no `next-i18next` dep).
  - Pages to translate (priority order): home → pricing → 3 ICP pages → 3 tools → 3-4 phare blog articles. The `/app`, `/dashboard`, `/login`, `/signup`, `/share` routes do NOT need translation (product UI vs marketing surface).
  - Translation quality: Claude can do FR well, ES/DE acceptably but ideally relit by a native before launch. Recommended: **Option C — start with FR only** (6 pages: home, pricing, 3 ICP, lang switcher), validate quality, then ES/DE once native reviewers are available.

### P2 — Product features (planned, not started)
- **Team plan implementation** — currently "Coming soon" mailto everywhere. Real build needs: shared workspaces (multi-user projects), per-seat billing in Stripe (the price IDs exist in env but no flow), admin controls + SSO, Slack/Notion sync. Weeks of focused work — don't start without a clear customer demand signal (mailto inbox).
- **Slack integration** — export a Pack directly to a Slack channel via webhook. The Pack already includes a draft "Slack message" output, this would automate the actual posting.
- **Notion integration** — export decisions + tasks to a Notion database. Useful for product teams that live in Notion.
- **Google Calendar integration** — turn the next-agenda output into pre-filled calendar invites for the next meeting.

### P3 — Content + growth (ongoing)
- **More blog articles** for long-tail SEO. Current count: 9. Suggested next angles: alternative-to-X comparisons (Otter, Fireflies, Fathom — each as a separate article), "AI for sales call notes", "QBR template", industry-specific (legal, design agencies, etc.). Each new article auto-includes BlogPosting + BreadcrumbList JSON-LD via existing infra.
- **Real testimonials** — when first paying customers convert. Replace the deliberately-empty social proof slot. **Don't** fabricate (the user explicitly rejected fake testimonials in pre-launch v2).
- **Directory submissions** (off-code, user action): Product Hunt, AlternativeTo, BetaList, SaaSHub, Indie Hackers product directory. Helps with referral traffic + backlinks for SEO.
- **Live Lighthouse audit** post-deploy — Phase 5 added the perf optimizations but only a real production trace measures the actual Core Web Vitals scores.

### Nits / hygiene (small fixes that can be batched anytime)
- Unused import `createClient` in `src/app/api/checkout/route.ts:3` — never used. Safe to delete.
- Bump `*Last updated*` date at the bottom of this file when major work ships.

---

*Last updated: 2026-05-07 (Phase 10 — Haiku 4.5 model swap (~2× faster packs); auth stability fixes: AuthProvider waits for JWT before profile query + 3-attempt backoff + background recovery poll; transient SIGNED_OUT during cold-start no longer wipes state; MobileNav shows "Account" placeholder while profile pending instead of email-prefix flash; dashboard sidebar reads from useAuth().profile fallback (no more "FREE / Unlimited" contradiction); single-method auth enforcement via SECURITY DEFINER RPC + freshness-gated OAuth callback so existing dual-identity users aren't locked out; Next 14.2.0 → 14.2.35; mobile-web-app-capable meta)*
*Primary AI assistant: Claude (claude.ai + Claude Code)*
