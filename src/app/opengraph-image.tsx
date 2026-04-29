import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MeetingFlash — Turn meeting notes into execution instantly'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #060C18 0%, #0B1730 50%, #111D35 100%)',
          padding: '80px 96px',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.45) 0%, rgba(37,99,235,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.25) 0%, rgba(96,165,250,0) 70%)',
          }}
        />

        {/* Brand row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#F8FAFC',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -0.5,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            ⚡
          </div>
          MeetingFlash
        </div>

        {/* Main pitch */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 18,
              color: '#60A5FA',
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA' }} />
            Post-meeting execution, in 20 seconds
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              color: '#F8FAFC',
              lineHeight: 1.05,
              letterSpacing: -2.5,
              maxWidth: 980,
            }}
          >
            Send a client-ready meeting recap before they finish their coffee.
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#94A3B8',
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', gap: 28 }}>
            <span>✓ Decisions</span>
            <span>✓ Action items</span>
            <span>✓ Follow-up email</span>
            <span>✓ Next agenda</span>
          </div>
          <div style={{ color: '#60A5FA', fontWeight: 600 }}>meetingflash.work</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
