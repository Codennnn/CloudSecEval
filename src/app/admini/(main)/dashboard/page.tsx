import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'

import data from './data.json'

import { AdminHeader } from '~admin/components/AdminHeader'
import { ChartAreaInteractive } from '~admin/components/ChartAreaInteractive'
import { DataTable } from '~admin/components/DataTable'
import { SectionCards } from '~admin/components/SectionCards'

export default function AdminDashboardPage() {
  return (
    <div className="size-full flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 flex-col overflow-hidden">
        <ScrollGradientContainer>
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />

              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              <DataTable data={data} />
            </div>
          </div>
        </ScrollGradientContainer>
      </div>
    </div>
  )
}
