import { AdminHeader } from '~/app/admini/components/AdminHeader'
import { ChartAreaInteractive } from '~/app/admini/components/ChartAreaInteractive'
import { DataTable } from '~/app/admini/components/DataTable'
import { SectionCards } from '~/app/admini/components/SectionCards'
import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'

import data from './data.json'

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
