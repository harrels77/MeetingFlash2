import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Only disallow functional endpoints that should NEVER be crawled.
        // Private/auth pages (/dashboard, /login, /signup, /share) are kept OUT
        // of the index via `robots: { index: false }` metadata instead — NOT via
        // a robots.txt block. A robots.txt block prevents Google from crawling
        // the page to see the noindex tag, which caused the "Indexed, though
        // blocked by robots.txt" warning in Search Console. Crawl must be
        // allowed for noindex to take effect.
        disallow: ['/api/', '/auth/'],
      },
    ],
    sitemap: 'https://www.meetingflash.work/sitemap.xml',
    host: 'https://www.meetingflash.work',
  }
}
