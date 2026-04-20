import type { Metadata } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/lib/AuthProvider'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'MeetingFlash — Turn meeting notes into execution instantly',
  description: 'Paste your meeting notes. Get decisions, action items, follow-up email, Slack message and next agenda in under 20 seconds. No prompts. No setup.',
  keywords: 'meeting notes, meeting summary, action items, meeting recap, AI meeting tool, post-meeting execution, meeting productivity',
  openGraph: {
    title: 'MeetingFlash — Turn meeting notes into execution instantly',
    description: 'Paste your notes. Get decisions, tasks, follow-up email and Slack message in 20 seconds.',
    url: 'https://meetingflash.vercel.app',
    siteName: 'MeetingFlash',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetingFlash — Turn meeting notes into execution instantly',
    description: 'Paste your notes. Get decisions, tasks, follow-up email and Slack message in 20 seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
    icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}