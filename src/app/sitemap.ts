import { MetadataRoute } from 'next'
import { articles } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.meetingflash.work'
  const now = new Date()

  return [
    { url: base,                       lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/app`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/pricing`,          lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/for-agencies`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for-product-teams`,lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for-freelancers`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/tools/follow-up-email-generator`,       lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/tools/meeting-action-items-extractor`,  lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/tools/discovery-call-recap-tool`,       lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/blog`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/privacy`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    ...articles.map(a => ({
      url: `${base}/blog/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
