import type { Metadata } from 'next'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'
import { BugReportFormEdit } from '~crowd-test/components/BugReportFormEdit'
import { BugReportGuidelines } from '~crowd-test/components/BugReportGuidelines'
import { BugReportRoleView } from '~crowd-test/constants'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestBugsDetail),
}

export default function BugReportPage() {
  return (
    <div className="p-admin-content">
      <div className="flex flex-col gap-admin-content xl:flex-row">
        <div className="min-w-0 flex-1">
          <BugReportFormEdit roleView={BugReportRoleView.USER} />
        </div>

        <div className="w-full shrink-0 xl:w-[420px]">
          <BugReportGuidelines />
        </div>
      </div>
    </div>
  )
}
