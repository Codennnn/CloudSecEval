'use client'

import { useRouter } from 'next/navigation'

import { BugListTable } from '../components/BugListTable'

import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import type { BugReportSummaryDto } from '~api/types.gen'

export function MyBugsPage() {
  const router = useRouter()

  const openEdit = (item: BugReportSummaryDto) => {
    router.push(getRoutePath(AdminRoutes.CrowdTestBugsDetail, { bugReportId: item.id }))
  }

  return (
    <div className="p-admin-content">
      <BugListTable<BugReportSummaryDto>
        columnVisibilityStorageKey="my-bugs-columns"
        onEdit={(item) => {
          openEdit(item)
        }}
      />
    </div>
  )
}
