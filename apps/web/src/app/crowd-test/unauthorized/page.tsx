import type { Metadata } from 'next'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestUnauthorized),
}

export { default } from '~admin/unauthorized/page'
