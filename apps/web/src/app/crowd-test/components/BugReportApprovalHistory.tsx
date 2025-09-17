'use client'

import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

import { bugReportsControllerGetApprovalHistoryOptions } from '~api/@tanstack/react-query.gen'

export interface BugReportApprovalHistoryProps {
  bugReportId: string
}

interface ApprovalLogItem {
  id: string
  action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'FORWARD'
  comment: string
  createdAt: string
  approver: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  targetUser?: {
    id: string
    name: string
    email: string
  }
}

const ACTION_LABELS = {
  APPROVE: '审批通过',
  REJECT: '审批驳回',
  REQUEST_INFO: '要求补充信息',
  FORWARD: '转发审批',
} as const

const ACTION_VARIANTS = {
  APPROVE: 'default',
  REJECT: 'destructive',
  REQUEST_INFO: 'secondary',
  FORWARD: 'outline',
} as const

export function BugReportApprovalHistory({ bugReportId }: BugReportApprovalHistoryProps) {
  const { data, isLoading, error } = useQuery({
    ...bugReportsControllerGetApprovalHistoryOptions({
      path: { id: bugReportId },
      query: {
        includeApprover: true,
        includeTargetUser: true,
      },
    }),
  })

  const approvalHistory = ((data as unknown as { data: ApprovalLogItem[] })?.data) ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>审批历史</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">加载中...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>审批历史</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">加载失败: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (approvalHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>审批历史</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">暂无审批记录</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>审批历史</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvalHistory.map((log) => (
            <div key={log.id} className="border-l-2 border-muted pl-4 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={log.approver?.avatarUrl} />
                    <AvatarFallback>
                      {log.approver?.name?.charAt(0) ?? '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {log.approver?.name ?? '未知用户'}
                      </span>
                      <Badge
                        className="text-xs"
                        variant={ACTION_VARIANTS[log.action]}
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </Badge>
                      {log.targetUser && (
                        <span className="text-xs text-muted-foreground">
                          → {log.targetUser.name}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {log.comment}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
