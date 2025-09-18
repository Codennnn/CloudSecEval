'use client'

import type { BugReportSummaryDto } from '~api/types.gen'
import { BugListTable } from '~crowd-test/components/BugListTable'
import { BugReportRoleView } from '~crowd-test/constants'

export function MyBugsPage() {
  return (
    <div className="p-admin-content">
      <BugListTable<BugReportSummaryDto>
        columnVisibilityStorageKey="my-bugs-columns"
        roleView={BugReportRoleView.USER}
      />
    </div>
  )
}
