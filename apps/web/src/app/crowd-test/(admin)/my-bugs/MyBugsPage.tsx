'use client'

import { BugListTable } from '../../components/BugListTable'

import type { BugReportSummaryDto } from '~api/types.gen'

export function MyBugsPage() {
  return (
    <div className="p-admin-content">
      <BugListTable<BugReportSummaryDto>
        columnVisibilityStorageKey="my-bugs-columns"
      />
    </div>
  )
}
