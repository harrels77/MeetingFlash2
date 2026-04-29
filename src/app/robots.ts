import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/auth/', '/share/', '/login', '/signup'],
      },
    ],
    sitemap: 'https://meetingflash.work/sitemap.xml',
    host: 'https://meetingflash.work',
  }
}
