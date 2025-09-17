'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { bugReportsControllerFindByIdOptions } from '~api/@tanstack/react-query.gen'
import { BugReportApproval } from '~crowd-test/components/BugReportApproval'
import { BugReportApprovalHistory } from '~crowd-test/components/BugReportApprovalHistory'
import { BugReportFormEdit } from '~crowd-test/components/BugReportFormEdit'
import { BugReportRoleView, type BugReportStatus } from '~crowd-test/constants'

export function ReportReview() {
  const { bugReportId } = useParams<{ bugReportId: string }>()

  const { data } = useQuery({
    ...bugReportsControllerFindByIdOptions({
      path: { id: bugReportId },
    }),
    enabled: typeof bugReportId === 'string',
  })

  const bugReportData = data?.data

  return (
    <div className="flex flex-col gap-admin-content xl:flex-row">
      <div className="min-w-0 flex-1 space-y-admin-content">
        <BugReportFormEdit readonly roleView={BugReportRoleView.ADMIN} />

        {bugReportData && (
          <BugReportApprovalHistory bugReportId={bugReportId} />
        )}
      </div>

      <div className="xl:w-80 space-y-admin-content">
        {bugReportData && (
          <BugReportApproval
            bugReportId={bugReportId}
            currentStatus={bugReportData.status as BugReportStatus}
          />
        )}
      </div>
    </div>
  )
}
