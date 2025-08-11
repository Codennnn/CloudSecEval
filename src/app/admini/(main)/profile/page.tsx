import type { Metadata } from 'next'

import { AdminRoutes, generatePageTitle } from '../../lib/admin-nav'

import { ProfilePage } from './ProfilePage'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Profile),
}

export default function AdminProfilePage() {
  return <ProfilePage />
}
