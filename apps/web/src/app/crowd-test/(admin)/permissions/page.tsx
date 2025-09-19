import type { Metadata } from 'next'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestPermissions),
}

export { default } from '~admin/(main)/permissions/page'
