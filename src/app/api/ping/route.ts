import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lightweight endpoint that keeps the Supabase free-tier instance warm.
// Hit this every ~5 minutes from an external pinger (UptimeRobot, cron-job.org, etc.)
// to prevent the instance from sleeping and causing cold-start hangs in the app.
//
// force-dynamic is LOAD-BEARING, not decoration. Without it Next statically
// renders this handler at build time and Vercel serves the same frozen JSON
// forever — the Supabase query never runs, the pinger keeps the CDN warm
// instead of the database, and the project gets paused for inactivity anyway.
// That is exactly what happened: the response served on 2026-11-05 still
// carried a build-time timestamp. Do not remove these two exports.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Cheapest possible query — count head only, no data transferred.
  const { error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  return NextResponse.json(
    {
      ok: !error,
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}
