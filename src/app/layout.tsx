import type { Metadata } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/lib/AuthProvider'
import { Analytics } from '@vercel/analytics/next'

const SITE_URL = 'https://meetingflash.work'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MeetingFlash — Turn meeting notes into execution instantly',
    template: '%s — MeetingFlash',
  },
  description: 'Paste your meeting notes. Get decisions, action items, follow-up email, Slack message and next agenda in under 20 seconds. No prompts. No setup.',
  applicationName: 'MeetingFlash',
  authors: [{ name: 'Simon Harrel', url: SITE_URL }],
  creator: 'Simon Harrel',
  publisher: 'MeetingFlash',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MeetingFlash — Turn meeting notes into execution instantly',
    description: 'Paste your notes. Get decisions, tasks, follow-up email and Slack message in 20 seconds.',
    url: SITE_URL,
    siteName: 'MeetingFlash',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetingFlash — Turn meeting notes into execution instantly',
    description: 'Paste your notes. Get decisions, tasks, follow-up email and Slack message in 20 seconds.',
    creator: '@meetingflash',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
    icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  category: 'productivity',
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MeetingFlash',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: 'hello@meetingflash.work',
  founder: {
    '@type': 'Person',
    name: 'Simon Harrel',
  },
  description: 'AI-powered post-meeting execution tool. Turns raw meeting notes into a complete Execution Pack in under 20 seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('mf_theme');if(t)document.documentElement.setAttribute('data-theme',t)})()` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
