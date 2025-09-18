'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { useUser } from '~admin/stores/useUserStore'
import { bugReportsControllerFindByIdOptions } from '~api/@tanstack/react-query.gen'
import { BugReportApproval } from '~crowd-test/components/BugReportApproval'
import { BugReportApprovalHistory } from '~crowd-test/components/BugReportApprovalHistory'
import { BugReportFormEdit } from '~crowd-test/components/BugReportFormEdit'
import { BugReportRoleView, type BugReportStatus } from '~crowd-test/constants'

export function ReportReview() {
  const { bugReportId } = useParams<{ bugReportId: string }>()

  const user = useUser()

  const { data } = useQuery({
    ...bugReportsControllerFindByIdOptions({
      path: { id: bugReportId },
    }),
    enabled: typeof bugReportId === 'string',
  })

  const bugReportData = data?.data
  const isSameUser = bugReportData?.userId === user?.id

  return (
    <div className="flex flex-col gap-admin-content xl:flex-row">
      <div className="flex-1">
        <BugReportFormEdit
          readonly
          roleView={BugReportRoleView.ADMIN}
        />
      </div>

      {!isSameUser && (
        <div className="xl:w-80 flex flex-col gap-admin-content">
          {bugReportData && (
            <BugReportApprovalHistory
              bugReportId={bugReportId}
            />
          )}

          {bugReportData && (
            <BugReportApproval
              bugReportId={bugReportId}
              currentStatus={bugReportData.status as BugReportStatus}
            />
          )}
        </div>
      )}
    </div>
  )
}
