import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/lib/AuthProvider'
import { Analytics } from '@vercel/analytics/next'
import SwRegister from '@/components/SwRegister'

const SITE_URL = 'https://www.meetingflash.work'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#060C18' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
  width: 'device-width',
  initialScale: 1,
}

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
  appleWebApp: {
    capable: true,
    title: 'MeetingFlash',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  category: 'productivity',
  manifest: '/manifest.json',
  verification: { google: 'A3rgfyop9UvIzL0VkxhsstDiZHvrQMfkhCIjPQZuXJU' },
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
        {/* Preconnect to performance-critical origins so the browser opens connections in parallel with HTML parsing */}
        {/* Cross-platform PWA meta — Next.js auto-emits the apple-mobile-web-app
            variant from appleWebApp metadata, but Chrome warns it's deprecated
            without this generic counterpart. */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
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
        <SwRegister />
        <Analytics />
      </body>
    </html>
  )
}
