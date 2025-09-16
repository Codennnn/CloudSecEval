import type { Metadata } from 'next'

import { BugReportForm } from '~/app/crowd-test/(admin)/components/BugReportForm'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestBugsDetail),
}

export default function BugReportPage() {
  return (
    <div className="p-admin-content">
      <BugReportForm />
    </div>
  )
}
