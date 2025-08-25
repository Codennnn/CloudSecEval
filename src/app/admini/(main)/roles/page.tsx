import type { Metadata } from 'next'

import { RolesPage } from './RolesPage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Roles),
}

export default function AdminRolesPage() {
  return (
    <RolesPage />
  )
}
