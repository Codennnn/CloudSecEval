'use client'

import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

import { BugReportStatus, getReportStatus } from '~crowd-test/constants'

interface BugReportStatusIndicatorProps {
  status: BugReportStatus
  className?: string
}

export function BugReportStatusIndicator(props: BugReportStatusIndicatorProps) {
  const { status, className } = props

  const statusInfo = getReportStatus(status)

  return (
    <div className={cn('rounded-lg border p-4 space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Badge className={statusInfo.frontColor} variant="outline">
          {statusInfo.icon}
          {statusInfo.label}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {statusInfo.description}
      </p>

      {/* 被驳回状态的额外提示 */}
      {status === BugReportStatus.REJECTED && (
        <p className="text-sm text-red-600 mt-2">
          您可以修改报告内容后重新提交。
        </p>
      )}
    </div>
  )
}
