import type { Metadata } from 'next'

import { UnauthorizedPage } from './UnauthorizedPage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Unauthorized),
}

export default function UnauthorizedPageX() {
  return <UnauthorizedPage />
}
