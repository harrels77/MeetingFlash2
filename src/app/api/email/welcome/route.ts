import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const displayName = name?.split(' ')[0] || 'there'

  try {
    await resend.emails.send({
      from: 'MeetingFlash <hello@meeetingflash.work>',
      to: email,
      subject: 'Welcome to MeetingFlash ⚡',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060C18;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060C18;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111D35;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
        <tr>
          <td style="padding:40px 40px 0;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#F8FAFC;letter-spacing:-0.5px;">⚡ MeetingFlash</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 0;">
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#F8FAFC;line-height:1.3;">
              Welcome, ${displayName}.
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#94A3B8;line-height:1.6;">
              You're in. You have <strong style="color:#60A5FA;">3 free Execution Packs</strong> this month — no prompts, no setup required.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#162040;border-radius:12px;padding:20px 24px;">
              <tr>
                <td>
                  <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#60A5FA;text-transform:uppercase;letter-spacing:0.08em;">What you get per Flash</p>
                  ${['📌 Decisions', '✓ Action items with owners', '❓ Open questions', '⚠ Risks', '📧 Follow-up email', '💬 Slack message', '📋 Next agenda'].map(item =>
                    `<div style="font-size:14px;color:#F8FAFC;padding:4px 0;">• ${item}</div>`
                  ).join('')}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/app"
               style="display:inline-block;background:#2563EB;color:#fff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;">
              Run your first Flash →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;border-top:1px solid rgba(255,255,255,0.07);padding-top:24px;margin-top:8px;">
            <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
              Questions? Reply to this email anytime.<br>
              — The MeetingFlash team
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;font-size:12px;color:#475569;">
        MeetingFlash · <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color:#475569;">Privacy</a> · <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms" style="color:#475569;">Terms</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Welcome email error:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}
