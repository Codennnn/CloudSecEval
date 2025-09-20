import { useInfiniteQuery } from '@tanstack/react-query'
import { CheckCircleIcon, ClockIcon, FileTextIcon, RefreshCwIcon, SendIcon, Share2Icon, XCircleIcon } from 'lucide-react'

import { getVulSeverity, VulnerabilitySeverity, vulSeverityConfig } from '~/app/crowd-test/constants'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { bugReportsControllerGetTimelineInfiniteOptions } from '~/lib/api/generated/@tanstack/react-query.gen'
import type { TimelineEventDto } from '~/lib/api/generated/types.gen'
import { DateFormat, formatDate, formatRelativeTime } from '~/utils/date'

type Severity = VulnerabilitySeverity | undefined
type EventType = TimelineEventDto['eventType']

const pageSize = 10

interface ActivityTimelineProps {
  /** 事件类型筛选 */
  eventType?: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'FORWARD' | 'RESUBMIT' | 'UPDATE'
  departmentId?: string
}

export function ActivityTimeline(props: ActivityTimelineProps) {
  const { eventType, departmentId } = props

  // 使用无限查询获取时间线数据
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    ...bugReportsControllerGetTimelineInfiniteOptions({
      query: {
        pageSize,
        eventType,
        departmentId,
      },
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // 如果当前页数据条数小于页面大小，说明没有更多数据了
      if (lastPage.data.length < pageSize) {
        return undefined
      }

      return allPages.length + 1
    },
  })

  const events = typeof data === 'object' && 'pages' in data
    ? data.pages.flatMap((page) => page.data)
    : []

  // 时间线项目骨架组件
  const TimelineItemSkeleton = () => (
    <li className="relative pl-8">
      <span className="absolute left-0 top-0 flex items-center justify-center rounded-full bg-background">
        <Skeleton className="h-4 w-4 rounded-full" />
      </span>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm flex items-center gap-1 overflow-hidden flex-1">
          <Skeleton className="h-4 w-16 shrink-0" />
          <Skeleton className="h-4 w-20 shrink-0" />
          <Skeleton className="h-4 flex-1 max-w-32" />
        </div>
        <Skeleton className="h-3 w-12 shrink-0" />
      </div>
      <div className="mt-1 flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </li>
  )

  const getStatusTextColor = (eventType: EventType) => {
    let textClass = 'text-muted-foreground'

    switch (eventType) {
      case 'APPROVE':
        textClass = 'text-green-600'
        break

      case 'REJECT':
        textClass = 'text-red-600'
        break

      case 'REQUEST_INFO':
        textClass = 'text-orange-600'
        break

      case 'FORWARD':
        textClass = 'text-blue-600'
        break

      case 'RESUBMIT':
        textClass = 'text-violet-600'
        break

      case 'UPDATE':
        textClass = 'text-indigo-600'
        break

      default:
        textClass = 'text-muted-foreground'
        break
    }

    return textClass
  }

  const getSeverityBadgeClass = (severity: Severity) => {
    if (!severity || !(severity in vulSeverityConfig)) {
      return 'border-gray-200 bg-gray-50 text-gray-700'
    }

    // 根据严重级别返回对应的 badge 样式
    switch (severity) {
      case VulnerabilitySeverity.CRITICAL:
        return 'border-purple-300 bg-purple-50 text-purple-700'

      case VulnerabilitySeverity.HIGH:
        return 'border-red-300 bg-red-50 text-red-700'

      case VulnerabilitySeverity.MEDIUM:
        return 'border-orange-300 bg-orange-50 text-orange-700'

      case VulnerabilitySeverity.LOW:
        return 'border-amber-300 bg-amber-50 text-amber-700'

      case VulnerabilitySeverity.INFO:
        return 'border-gray-200 bg-gray-50 text-gray-700'

      default:
        return 'border-gray-200 bg-gray-50 text-gray-700'
    }
  }

  const getActionText = (eventType: EventType) => {
    let text = '提交漏洞报告'

    switch (eventType) {
      case 'APPROVE':
        text = '审批通过'
        break

      case 'REJECT':
        text = '审批驳回'
        break

      case 'REQUEST_INFO':
        text = '要求补充信息'
        break

      case 'FORWARD':
        text = '转发审批'
        break

      case 'RESUBMIT':
        text = '重新提交'
        break

      case 'UPDATE':
        text = '更新报告'
        break

      default:
        text = '提交漏洞报告'
        break
    }

    return text
  }

  const renderIcon = (eventType: EventType, size: number) => {
    let icon = <FileTextIcon className="text-blue-600" size={size} />

    if (eventType === 'APPROVE') {
      icon = <CheckCircleIcon className="text-green-600" size={size} />
    }
    else if (eventType === 'REJECT') {
      icon = <XCircleIcon className="text-red-600" size={size} />
    }
    else if (eventType === 'REQUEST_INFO') {
      icon = <ClockIcon className="text-orange-600" size={size} />
    }
    else if (eventType === 'FORWARD') {
      icon = <Share2Icon className="text-blue-600" size={size} />
    }
    else if (eventType === 'RESUBMIT') {
      icon = <SendIcon className="text-violet-600" size={size} />
    }
    else if (eventType === 'UPDATE') {
      icon = <RefreshCwIcon className="text-indigo-600" size={size} />
    }

    return icon
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }

  return (
    <div className="relative">
      <div className="absolute left-[8px] top-0 bottom-0 w-px bg-border" />

      {events.length > 0
        ? (
            <>
              <ul className="space-y-4">
                {events.map((evt) => {
                  const id = evt.id
                  const eventType = evt.eventType
                  const createdAt = evt.createdAt
                  const bugReport = evt.bugReport
                  const user = evt.user as { name?: string, email?: string } | undefined

                  const actionText = getActionText(eventType)
                  const statusColor = getStatusTextColor(eventType)
                  const severityConfig = getVulSeverity(bugReport.severity)
                  const severityClass = getSeverityBadgeClass(bugReport.severity as Severity)
                  const displayUser = user?.name ?? user?.email ?? '未知用户'
                  const displayTime = formatRelativeTime(createdAt)

                  return (
                    <li key={id} className="relative pl-8">
                      <span className="absolute left-0 top-0 flex items-center justify-center rounded-full bg-background">
                        {renderIcon(eventType, 16)}
                      </span>

                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm flex items-center gap-1 overflow-hidden">
                          <span className="font-medium shrink-0">{displayUser}</span>
                          <span className="text-muted-foreground shrink-0">{actionText}</span>
                          <span className="font-medium truncate flex-1 min-w-0">
                            {bugReport.title}
                          </span>
                        </div>
                        <span
                          className="shrink-0 text-xs text-muted-foreground"
                          title={formatDate(createdAt, DateFormat.YYYY_MM_DD_HH_MM)}
                        >
                          {displayTime}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <Badge className={severityClass} variant="outline">
                          {severityConfig.label}
                        </Badge>

                        <span className={`text-xs ${statusColor}`}>
                          {actionText}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* 加载更多按钮 */}
              {hasNextPage && (
                <div className="mt-6 flex justify-center">
                  <Button
                    disabled={isFetchingNextPage}
                    size="sm"
                    variant="outline"
                    onClick={handleLoadMore}
                  >
                    {isFetchingNextPage ? '加载中...' : '加载更多'}
                  </Button>
                </div>
              )}

              {isFetchingNextPage && (
                <ol className="mt-4 space-y-4">
                  {Array.from({ length: 2 }, (_, idx) => (
                    <TimelineItemSkeleton key={`loading-${idx}`} />
                  ))}
                </ol>
              )}
            </>
          )
        : isLoading
          ? (
              <ol className="space-y-4">
                {Array.from({ length: 4 }, (_, idx) => (
                  <TimelineItemSkeleton key={idx} />
                ))}

              </ol>
            )
          : <div className="text-sm text-muted-foreground">暂无事件</div> }
    </div>
  )
}
