import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Weekly "open actions" digest — Vercel cron, Monday mornings.
// For every user with at least one task not marked done, sends a short recap
// email listing the top open actions with their meeting + deadline, linking
// back to the dashboard. This is the retention loop: the product is episodic,
// the open-task list is what brings people back between meetings.
//
// Opt-out: profiles.weekly_digest (migration 2026_07_04_weekly_digest.sql,
// applied manually). The column may not exist yet on an un-migrated instance —
// we only skip when the value is explicitly false, so a missing column
// (undefined) keeps everyone opted in and the route never crashes on it.

export const maxDuration = 60

type TaskRow = {
  user_id: string
  meeting_id: string | null
  text: string
  owner: string | null
  deadline: string | null
  priority: string | null
  status: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function digestHtml(name: string, tasks: { text: string; owner: string | null; deadline: string | null; meeting: string | null }[], total: number, appUrl: string) {
  const rows = tasks.map(t => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <div style="font-size:14px;color:#EDF1F9;line-height:1.5;">${esc(t.text)}</div>
        <div style="font-size:12px;color:#98A4BC;margin-top:4px;">
          ${[t.owner && `Owner: ${esc(t.owner)}`, t.deadline && `Due: ${esc(t.deadline)}`, t.meeting && esc(t.meeting)].filter(Boolean).join(' · ')}
        </div>
      </td>
    </tr>`).join('')

  const more = total > tasks.length
    ? `<p style="margin:16px 0 0;font-size:13px;color:#98A4BC;">+ ${total - tasks.length} more open action${total - tasks.length > 1 ? 's' : ''} in your dashboard.</p>`
    : ''

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A101F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A101F;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131C31;border-radius:16px;border:1px solid rgba(230,237,250,0.08);overflow:hidden;">
        <tr>
          <td style="padding:36px 40px 0;">
            <div style="font-size:18px;font-weight:700;color:#EDF1F9;">MeetingFlash</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 0;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#EDF1F9;line-height:1.3;">
              ${esc(name)}, you have ${total} open action${total > 1 ? 's' : ''} this week.
            </h1>
            <p style="margin:0 0 20px;font-size:14px;color:#98A4BC;line-height:1.6;">
              These came out of your meetings and are still marked to do:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
            ${more}
          </td>
        </tr>
        <tr>
          <td style="padding:28px 40px;">
            <a href="${appUrl}/dashboard"
               style="display:inline-block;background:#2E62FF;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
              Review them in your dashboard
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0;font-size:12px;color:#5C6A85;line-height:1.6;border-top:1px solid rgba(230,237,250,0.08);padding-top:20px;">
              You get this once a week while you have open actions.
              Turn it off anytime in <a href="${appUrl}/dashboard/settings" style="color:#7C9BFF;text-decoration:none;">Settings</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: 'no api key' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('user_id, meeting_id, text, owner, deadline, priority, status')
    .neq('status', 'done')
    .limit(2000)

  if (tasksError) {
    console.error('Digest tasks fetch error:', tasksError)
    return NextResponse.json({ error: 'Tasks fetch failed' }, { status: 500 })
  }
  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no open tasks' })
  }

  const byUser = new Map<string, TaskRow[]>()
  for (const t of tasks as TaskRow[]) {
    const list = byUser.get(t.user_id) ?? []
    list.push(t)
    byUser.set(t.user_id, list)
  }

  const userIds = [...byUser.keys()]
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds)

  if (profilesError || !profiles) {
    console.error('Digest profiles fetch error:', profilesError)
    return NextResponse.json({ error: 'Profiles fetch failed' }, { status: 500 })
  }

  const meetingIds = [...new Set((tasks as TaskRow[]).map(t => t.meeting_id).filter(Boolean))] as string[]
  const meetingTitles = new Map<string, string>()
  if (meetingIds.length > 0) {
    const { data: meetings } = await supabase
      .from('meetings')
      .select('id, title')
      .in('id', meetingIds)
    for (const m of meetings ?? []) meetingTitles.set(m.id, m.title)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.meetingflash.work'
  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0
  const failures: string[] = []

  for (const profile of profiles) {
    if (!profile.email) continue
    if (profile.weekly_digest === false) continue

    const userTasks = byUser.get(profile.id) ?? []
    if (userTasks.length === 0) continue

    // P0 first, then P1, then the rest — same hierarchy as the pack view.
    const rank = (p: string | null) => (p === 'high' ? 0 : p === 'medium' ? 1 : 2)
    userTasks.sort((a, b) => rank(a.priority) - rank(b.priority))

    const top = userTasks.slice(0, 8).map(t => ({
      text: t.text,
      owner: t.owner,
      deadline: t.deadline,
      meeting: t.meeting_id ? meetingTitles.get(t.meeting_id) ?? null : null,
    }))
    const firstName = (profile.full_name || 'there').split(' ')[0]

    try {
      await resend.emails.send({
        from: 'MeetingFlash <hello@meetingflash.work>',
        to: profile.email,
        subject: `${userTasks.length} open action${userTasks.length > 1 ? 's' : ''} from your meetings`,
        html: digestHtml(firstName, top, userTasks.length, appUrl),
      })
      sent++
    } catch (err) {
      console.error(`Digest send failed for ${profile.id}:`, err)
      failures.push(profile.id)
    }
    // Resend free tier rate limit is ~2 req/s — pace the loop.
    await new Promise(r => setTimeout(r, 600))
  }

  return NextResponse.json({ ok: true, sent, failed: failures.length, at: new Date().toISOString() })
}
