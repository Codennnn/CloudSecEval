import type { Metadata } from 'next'

import { ProfilePage } from './ProfilePage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Profile),
}

export default function AdminProfilePage() {
  return <ProfilePage />
}
