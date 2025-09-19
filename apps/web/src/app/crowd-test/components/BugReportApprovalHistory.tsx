'use client'

import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { CheckCircle, FileText, Forward, Info, RotateCcw, Upload, XCircle } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

import { bugReportsControllerGetApprovalHistoryOptions } from '~api/@tanstack/react-query.gen'

export interface BugReportApprovalHistoryProps {
  bugReportId: string
}

// 历史事件类型枚举
type HistoryEventType = 'SUBMIT' | 'RESUBMIT' | 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'FORWARD' | 'UPDATE'

// 扩展的历史记录项接口
interface ExtendedHistoryItem {
  id: string
  eventType: HistoryEventType
  createdAt: string
  description: string
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl?: string | null
  }
  approvalInfo?: {
    action: string
    comment?: string
    targetUser?: {
      id: string
      name: string | null
      email: string
    }
  }
  submitInfo?: {
    title: string
    severity: string
    status: string
    isResubmit: boolean
    changedFields?: string[]
  }
  bugReport?: {
    id: string
    title: string
    severity: string
    status: string
  }
}

// 事件类型标签映射
const EVENT_TYPE_LABELS = {
  SUBMIT: '提交报告',
  RESUBMIT: '重新提交',
  APPROVE: '审批通过',
  REJECT: '审批驳回',
  REQUEST_INFO: '要求补充信息',
  FORWARD: '转发审批',
  UPDATE: '更新报告',
} as const

// 事件类型样式映射
const EVENT_TYPE_VARIANTS: Record<HistoryEventType, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  SUBMIT: 'secondary',
  RESUBMIT: 'outline',
  APPROVE: 'default',
  REJECT: 'destructive',
  REQUEST_INFO: 'secondary',
  FORWARD: 'outline',
  UPDATE: 'secondary',
}

// 事件类型图标映射
const EVENT_TYPE_ICONS = {
  SUBMIT: Upload,
  RESUBMIT: RotateCcw,
  APPROVE: CheckCircle,
  REJECT: XCircle,
  REQUEST_INFO: Info,
  FORWARD: Forward,
  UPDATE: FileText,
} as const

export function BugReportApprovalHistory({ bugReportId }: BugReportApprovalHistoryProps) {
  const { data, isLoading } = useQuery({
    ...bugReportsControllerGetApprovalHistoryOptions({
      path: { id: bugReportId },
      query: {
        includeApprover: true,
        includeTargetUser: true,
        includeSubmissions: true, // 启用提交记录
      },
    }),
  })

  const historyItems = data ? (data as unknown as { data: ExtendedHistoryItem[] }).data : []

  const renderEventContent = (item: ExtendedHistoryItem) => {
    // 渲染事件的具体内容
    if (item.eventType === 'SUBMIT' || item.eventType === 'RESUBMIT') {
      // 提交类事件
      const submitInfo = item.submitInfo

      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
          {submitInfo?.changedFields && submitInfo.changedFields.length > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <span className="font-medium">修改字段：</span>
              {submitInfo.changedFields.join(', ')}
            </div>
          )}
        </div>
      )
    }

    // 审批类事件
    const approvalInfo = item.approvalInfo

    return (
      <div className="space-y-2">
        {approvalInfo?.comment && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {approvalInfo.comment}
          </p>
        )}
        {!approvalInfo?.comment && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    )
  }

  const getUserName = (user: ExtendedHistoryItem['user']) => {
    return user.name ?? user.email
  }

  const getUserInitial = (user: ExtendedHistoryItem['user']) => {
    const name = getUserName(user)

    return name.charAt(0).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>操作历史</CardTitle>
      </CardHeader>

      <CardContent>
        {
          isLoading
            ? <p className="text-muted-foreground">加载中...</p>
            : historyItems.length > 0
              ? (
                  <div className="space-y-4">
                    {historyItems.map((item) => {
                      const IconComponent = EVENT_TYPE_ICONS[item.eventType]

                      return (
                        <div key={item.id} className="border-l-2 border-muted pl-4 pb-4 last:pb-0">

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={item.user.avatarUrl ?? undefined} />
                                <AvatarFallback>
                                  {getUserInitial(item.user)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">
                                    {getUserName(item.user)}
                                  </span>
                                  <Badge
                                    className="text-xs flex items-center gap-1"
                                    variant={EVENT_TYPE_VARIANTS[item.eventType]}
                                  >
                                    <IconComponent className="h-3 w-3" />
                                    {EVENT_TYPE_LABELS[item.eventType]}
                                  </Badge>
                                  {item.approvalInfo?.targetUser && (
                                    <span className="text-xs text-muted-foreground">
                                      → {item.approvalInfo.targetUser.name
                                        ?? item.approvalInfo.targetUser.email}
                                    </span>
                                  )}
                                </div>

                                {renderEventContent(item)}

                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(item.createdAt), {
                                    addSuffix: true,
                                    locale: zhCN,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              : <p className="text-muted-foreground">暂无操作记录</p>
        }
      </CardContent>
    </Card>
  )
}
