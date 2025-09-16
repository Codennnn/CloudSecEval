import type { Metadata } from 'next'

import { BugReportForm } from '~/app/crowd-test/(admin)/components/BugReportForm'

import { BugReportGuidelines } from '../components/BugReportGuidelines'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestBugsDetail),
}

/**
 * BugReportPage
 * 漏洞上报详情页：左侧为表单，右侧为规则说明（大屏并排，小屏自动换行）。
 */
export default function BugReportPage() {
  return (
    <div className="p-admin-content">
      <div className="flex flex-col gap-admin-content xl:flex-row">
        <div className="min-w-0 flex-1">
          <BugReportForm />
        </div>

        <div className="w-full shrink-0 xl:w-[420px]">
          <BugReportGuidelines />
        </div>
      </div>
    </div>
  )
}
