import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — MeetingFlash',
  // Private, auth-gated area. noindex so Google drops it from the index.
  // NOTE: /dashboard is intentionally NOT disallowed in robots.ts — a
  // robots.txt block would stop Google from crawling the page to SEE this
  // noindex, which is exactly what caused the "Indexed, though blocked by
  // robots.txt" issue in Search Console. Crawl must be allowed for noindex
  // to take effect. Applies to all /dashboard/* routes via this layout.
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
