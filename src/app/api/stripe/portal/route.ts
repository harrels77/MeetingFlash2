import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Opens the Stripe Customer Billing Portal for the authenticated user.
// The portal lets them update their card, view invoices, change plan, or
// cancel — without us having to build any of that UI ourselves.
//
// Looks up the Stripe customer by email rather than storing customer_id on
// the profile (we don't, currently). Slightly slower than a direct lookup
// but avoids a schema change and a backfill for existing subscribers.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user || !user.email) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Find the Stripe customer for this email. There should be exactly one
  // for a paying user; if multiple exist (rare), Stripe returns the most
  // recent first, which is the right one in 99% of cases.
  const customers = await stripe.customers.list({ email: user.email, limit: 1 })
  if (customers.data.length === 0) {
    return NextResponse.json({ error: 'No subscription found for this email.' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://meetingflash.work'}/dashboard/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
