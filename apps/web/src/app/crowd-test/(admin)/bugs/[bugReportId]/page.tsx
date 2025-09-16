import type { Metadata } from 'next'

import { BugReportFormEdit } from '../../components/BugReportFormEdit'
import { BugReportGuidelines } from '../components/BugReportGuidelines'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestBugsDetail),
}

export default function BugReportPage() {
  return (
    <div className="p-admin-content">
      <div className="flex flex-col gap-admin-content xl:flex-row">
        <div className="min-w-0 flex-1">
          <BugReportFormEdit />
        </div>

        <div className="w-full shrink-0 xl:w-[420px]">
          <BugReportGuidelines />
        </div>
      </div>
    </div>
  )
}
