import type { Metadata } from 'next'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'
import { BugReportFormEdit } from '~crowd-test/components/BugReportFormEdit'
import { BugReportRoleView } from '~crowd-test/constants'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestBugsDetail),
}

export default function BugReportPage() {
  return (
    <div className="p-admin-content">
      <BugReportFormEdit roleView={BugReportRoleView.USER} />
    </div>
  )
}
