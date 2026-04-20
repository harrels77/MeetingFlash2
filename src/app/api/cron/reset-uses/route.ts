import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('profiles')
    .update({ uses_this_month: 0 })
    .eq('plan', 'free')

  if (error) {
    console.error('Reset uses error:', error)
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, reset: new Date().toISOString() })
}
