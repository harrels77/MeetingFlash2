import type { Metadata } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/lib/AuthProvider'

export const metadata: Metadata = {
  title: 'MeetingFlash — Turn meetings into execution',
  description: 'Paste your meeting notes. Get decisions, action items, follow-up email, Slack message and next agenda in 20 seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}