import type { Metadata } from 'next'

import { LicensesTable } from '../licenses/LicensesTable'

import { LicenseTrendChart } from '~admin/components/LicenseTrendChart'
import { SectionCards } from '~admin/components/SectionCards'
import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Dashboard),
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-admin-content py-admin-content">
        <SectionCards />

        <div className="px-admin-content">
          <LicenseTrendChart />
        </div>

        <LicensesTable />
      </div>
    </div>
  )
}
