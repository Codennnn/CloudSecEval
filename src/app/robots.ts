import type { MetadataRoute } from 'next'

import { getFullUrl, SITE_CONFIG } from '~/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/test/'],
    },
    sitemap: getFullUrl('/sitemap.xml'),
    host: SITE_CONFIG.baseUrl,
  }
}
