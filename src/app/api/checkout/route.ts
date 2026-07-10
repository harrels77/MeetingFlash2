import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Only our own price IDs can be checked out — the client used to be able to
// send any priceId (and any userId) in the body.
const ALLOWED_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID,
].filter(Boolean) as string[]

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, email } = await req.json()

    if (!priceId || !ALLOWED_PRICE_IDS.includes(priceId)) {
      return NextResponse.json({ error: 'Unknown price' }, { status: 400 })
    }

    // Prefer the server-verified identity over anything in the body.
    // The client-supplied userId is only kept as a legacy fallback.
    let resolvedUserId: string | undefined = typeof userId === 'string' ? userId : undefined
    let resolvedEmail: string | undefined = typeof email === 'string' && email ? email : undefined
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      )
      const { data: { user } } = await userClient.auth.getUser()
      if (user) {
        resolvedUserId = user.id
        resolvedEmail = user.email ?? resolvedEmail
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
      metadata: { userId: resolvedUserId ?? '', priceId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}