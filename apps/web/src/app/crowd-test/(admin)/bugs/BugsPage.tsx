'use client'

import { useIsClient } from '~admin/stores/useUserStore'
import { BugListTable } from '~crowd-test/components/BugListTable'
import { BugStatsCards } from '~crowd-test/components/BugStatsCards'
import { BugReportRoleView } from '~crowd-test/constants'

export function BugPage() {
  const isClient = useIsClient()

  return (
    <div className="p-admin-content flex flex-col gap-admin-content">
      <BugStatsCards />

      <BugListTable
        columnVisibilityStorageKey="bug-list-columns"
        roleView={isClient ? BugReportRoleView.CLIENT : BugReportRoleView.ADMIN}
      />
    </div>
  )
}
