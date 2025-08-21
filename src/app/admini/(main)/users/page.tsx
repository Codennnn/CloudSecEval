import type { Metadata } from 'next'

import { UserPage } from './UsersPage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Users),
}

export default function AdminUserPage() {
  return (
    <UserPage />
  )
}
