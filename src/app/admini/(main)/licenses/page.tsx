import type { Metadata } from 'next'

import { LicensesPage } from './LicensesPage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Licenses),
}

export default function AdminLicensesPage() {
  return <LicensesPage />
}
