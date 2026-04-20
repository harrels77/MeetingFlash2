# MeetingFlash — Context for Claude

## Product
Post-meeting execution SaaS. Transforms raw meeting notes into
a complete Execution Pack in 20 seconds. 7 structured outputs:
decisions, action items, open questions, risks, follow-up email,
Slack message, next agenda.

## Stack
- Next.js 14 App Router + TypeScript
- Supabase (auth + PostgreSQL + RLS)
- Anthropic Claude API (claude-sonnet-4-20250514) with prompt caching
- CSS Modules
- Stripe (subscriptions) — apiVersion: 2026-03-25.dahlia

## Design System
- Background: #060C18
- Blue primary: #2563EB
- Fonts: Plus Jakarta Sans, Instrument Serif, JetBrains Mono
- CSS variables in src/styles/globals.css

## All Pages & Routes
- src/app/page.tsx — Landing page (hero, demo, features, testimonials, pricing)
- src/app/app/page.tsx — Flash tool (main product)
- src/app/dashboard/page.tsx — Dashboard (recent packs + projects tabs)
- src/app/dashboard/pack/[id]/page.tsx — View a single saved pack
- src/app/dashboard/project/[id]/page.tsx — View all packs in a project
- src/app/dashboard/search/page.tsx — Search across meetings
- src/app/dashboard/settings/page.tsx — Account settings
- src/app/login/page.tsx — Login
- src/app/signup/page.tsx — Signup
- src/app/share/[token]/page.tsx — Public share link for a pack
- src/app/privacy/page.tsx — Privacy policy
- src/app/terms/page.tsx — Terms of service
- src/app/api/flash/route.ts — Core AI route (Claude API)
- src/app/api/checkout/route.ts — Stripe checkout session
- src/app/api/webhook/route.ts — Stripe webhook handler
- src/lib/supabase.ts — Supabase client
- src/lib/AuthProvider.tsx — Auth context

## Database (Supabase)
Tables: profiles, projects, meetings, tasks
- meetings.pack = JSONB: { decisions, actions, questions, risks, email, slack, agenda, tasks[] }
- meetings.share_token = string (nullable) — for public share links
- profiles.plan = 'free' | 'pro' | 'team'
- profiles.uses_this_month = integer (reset monthly)
- tasks: { user_id, meeting_id, text, owner, deadline, priority, status }
- IMPORTANT: webhook uses SUPABASE_SERVICE_ROLE_KEY (not anon key) to bypass RLS

## Pricing
- Free: 3 packs/month
- Pro: $12/month (or $8/month billed annually at $96/yr)
- Team: $25/month for 5 seats (or $20/month billed annually at $240/yr)

## Stripe Integration
- Env vars needed: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID
- TODO: Annual pricing not wired yet — needs NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID
  and NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID, then update checkout onClick
  in page.tsx to pass annual price ID when annual === true
- Webhook handles: checkout.session.completed, customer.subscription.deleted,
  invoice.payment_failed
- Customer metadata stores userId for reliable webhook lookups

## API: /api/flash
- In-memory rate limit: 10 requests/minute per IP
- max_tokens: 4000
- Prompt caching enabled (saves ~80% on system prompt cost)
- Saves meeting + tasks to DB if Authorization header present
- Calls supabase RPC increment_uses after each successful flash

## Auth
- Google OAuth via Supabase
- Email/password
- Auth callback: /auth/callback
- After login: redirect to /

## App Logic (src/app/app/page.tsx)
- Guest users: 1 free pack (tracked in localStorage mf_guest_used)
- Free plan users: 3 packs/month (tracked in profiles.uses_this_month)
- Upgrade modal shown when limit hit (for both guest and logged-in free users)
- Project selector visible when logged in (create project inline)
- copy() uses navigator.clipboard.writeText()

## Dashboard Features
- Recent packs tab + Projects tab
- Select mode for bulk delete
- Rename meetings and projects (modal)
- Share meeting: generates random token, copies link to clipboard
- Pack summary shown on hover
- Auto-creates profile row if missing on first login

## Current Status
- MVP complete with all core bugs fixed
- Stripe fully integrated and webhook handling complete
- Annual pricing toggle is UI-only (not wired to Stripe annual price IDs yet)
- Deployed to Vercel
