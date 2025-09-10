import type { Metadata } from 'next'

import { LicensesTable } from './LicensesTable'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Licenses),
}

export default function AdminLicensesPage() {
  return <LicensesTable />
}
