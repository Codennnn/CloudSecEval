import type { Metadata } from 'next'

import { AdminRoutes, generatePageTitle } from '../../admini/lib/admin-nav'

import { DashboardPage as DashboardPageComponent } from './DashPage'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestDashboard),
}

export default function DashboardPage() {
  return <DashboardPageComponent />
}
