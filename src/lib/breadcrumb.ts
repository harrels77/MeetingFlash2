// Helper to generate Schema.org BreadcrumbList JSON-LD for any page.
// Pass an ordered list of crumbs (Home is added automatically as the first one).

const SITE = 'https://meetingflash.work'

export function buildBreadcrumb(crumbs: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      ...crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.name,
        item: `${SITE}${c.path}`,
      })),
    ],
  }
}
