import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lightweight endpoint that keeps the Supabase free-tier instance warm.
// Hit this every ~5 minutes from an external pinger (UptimeRobot, cron-job.org, etc.)
// to prevent the instance from sleeping and causing cold-start hangs in the app.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Cheapest possible query — count head only, no data transferred.
  const { error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  return NextResponse.json({
    ok: !error,
    timestamp: new Date().toISOString(),
  })
}
