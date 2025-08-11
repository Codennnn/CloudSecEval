import type { Metadata } from 'next'

import data from './data.json'

import { ChartAreaInteractive } from '~admin/components/ChartAreaInteractive'
import { DataTable } from '~admin/components/DataTable'
import { SectionCards } from '~admin/components/SectionCards'
import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Dashboard),
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-admin-content-md py-admin-content-md md:gap-admin-content md:py-admin-content">
        <SectionCards />

        <div className="px-admin-content-md lg:px-admin-content">
          <ChartAreaInteractive />
        </div>

        <DataTable data={data} />
      </div>
    </div>
  )
}
