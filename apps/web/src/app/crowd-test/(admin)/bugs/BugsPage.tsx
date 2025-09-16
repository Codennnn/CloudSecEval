'use client'

import { BugListTable, BugReportRoleView } from '../components/BugListTable'

import { BugStatsCards } from './components/BugStatsCards'
import { ensureMockData } from './lib/mockData'

export function BugPage() {
  const mockData = ensureMockData()

  return (
    <div className="p-admin-content flex flex-col gap-admin-content">
      <BugStatsCards data={mockData} />

      <BugListTable
        columnVisibilityStorageKey="bug-list-columns"
        roleView={BugReportRoleView.ADMIN}
      />
    </div>
  )
}
