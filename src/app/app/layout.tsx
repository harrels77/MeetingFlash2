import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free meeting notes to action items — MeetingFlash',
  description: 'Paste raw meeting notes and get a complete Execution Pack — decisions, action items with owners, follow-up email, Slack message, next agenda — in under 20 seconds. Free, no signup required for the first pack.',
  alternates: { canonical: '/app' },
  openGraph: {
    title: 'MeetingFlash — Free meeting notes to action items',
    description: 'Paste raw meeting notes. Get a complete Execution Pack in 20 seconds. No signup needed for the first one.',
    url: 'https://meetingflash.work/app',
    type: 'website',
  },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
