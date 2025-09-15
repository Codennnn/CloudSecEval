'use client'

import { BugListTable, BugReportRoleView } from '../components/BugListTable'

import { BugStatsCards } from './components/BugStatsCards'
import { getBugListQueryKey, getBugListQueryOptions } from './lib/bugQueries'
import { ensureMockData } from './lib/mockData'

export function BugPage() {
  const mockData = ensureMockData()

  return (
    <div className="p-admin-content flex flex-col gap-admin-content">
      <BugStatsCards data={mockData} />

      <BugListTable
        columnVisibilityStorageKey="bug-list-columns"
        queryKeyFn={getBugListQueryKey}
        queryOptionsFn={getBugListQueryOptions}
        roleView={BugReportRoleView.ADMIN}
      />
    </div>
  )
}
