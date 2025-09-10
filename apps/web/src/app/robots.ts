import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '~/constants/common'
import { getFullUrl } from '~/utils/link'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/test/', '/admini/'],
    },
    sitemap: getFullUrl('/sitemap.xml'),
    host: SITE_CONFIG.baseUrl,
  }
}
