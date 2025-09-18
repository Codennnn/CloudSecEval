'use client'

import { BugListTable } from '~crowd-test/components/BugListTable'
import { BugStatsCards } from '~crowd-test/components/BugStatsCards'
import { BugReportRoleView } from '~crowd-test/constants'

export function BugPage() {
  return (
    <div className="p-admin-content flex flex-col gap-admin-content">
      <BugStatsCards />

      <BugListTable
        columnVisibilityStorageKey="bug-list-columns"
        roleView={BugReportRoleView.ADMIN}
      />
    </div>
  )
}
