import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object as Stripe.Checkout.Session
    const userId     = session.metadata?.userId
    const customerId = session.customer as string

    if (userId) {
      const priceId = session.metadata?.priceId
      const plan = priceId === process.env.STRIPE_TEAM_PRICE_ID ? 'team' : 'pro'

      await supabase.from('profiles').update({ plan }).eq('id', userId)

      // Save userId on the Stripe customer so future webhook events can find the user
      if (customerId) {
        await stripe.customers.update(customerId, { metadata: { userId } })
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId   = subscription.customer as string

    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId   = customer.metadata?.userId

    if (userId) {
      await supabase.from('profiles').update({ plan: 'free' }).eq('id', userId)
    } else if (customer.email) {
      await supabase.from('profiles').update({ plan: 'free' }).eq('email', customer.email)
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice    = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId   = customer.metadata?.userId

    if (userId) {
      await supabase.from('profiles').update({ plan: 'free' }).eq('id', userId)
    } else if (customer.email) {
      await supabase.from('profiles').update({ plan: 'free' }).eq('email', customer.email)
    }
  }

  return NextResponse.json({ received: true })
}