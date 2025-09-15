import type { Metadata } from 'next'

import { DashboardPage as DashboardPageComponent } from './DashPage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestDashboard),
}

export default function DashboardPage() {
  return <DashboardPageComponent />
}
