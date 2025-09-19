import type { Metadata } from 'next'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestRoles),
}

export { default } from '~admin/(main)/roles/page'
