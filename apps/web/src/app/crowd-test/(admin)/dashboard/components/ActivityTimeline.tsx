import { useInfiniteQuery } from '@tanstack/react-query'
import { CheckCircleIcon, ClockIcon, FileTextIcon, RefreshCwIcon, SendIcon, Share2Icon, XCircleIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { bugReportsControllerGetTimelineInfiniteOptions } from '~/lib/api/generated/@tanstack/react-query.gen'
import type { TimelineEventDto } from '~/lib/api/generated/types.gen'
import { DateFormat, formatDate } from '~/utils/date'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | undefined
type EventType = TimelineEventDto['eventType']

interface ActivityTimelineProps {
  /** 每页数据条数 */
  pageSize?: number
  /** 事件类型筛选 */
  eventType?: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'FORWARD' | 'RESUBMIT' | 'UPDATE'
}

/**
 * 时间线组件（接入真实接口）
 * - 内部管理数据获取和分页
 * - 支持加载更多数据
 * - 根据 eventType 显示图标与状态颜色
 * - 根据 bugReport.severity 显示风险等级 Badge
 */
export function ActivityTimeline(props: ActivityTimelineProps) {
  const { pageSize = 10, eventType } = props

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
      },
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // 如果当前页数据条数小于页面大小，说明没有更多数据了
      if (!lastPage || lastPage.length < pageSize) {
        return undefined
      }

      return allPages.length + 1
    },
  })

  // 扁平化所有页面的数据
  const events = data?.pages.flatMap((page) => page ?? []) ?? []

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
    let badgeClass = 'border-gray-200 bg-gray-50 text-gray-700'

    switch (severity) {
      case 'CRITICAL':
        badgeClass = 'border-red-300 bg-red-50 text-red-700'
        break

      case 'HIGH':
        badgeClass = 'border-orange-300 bg-orange-50 text-orange-700'
        break

      case 'MEDIUM':
        badgeClass = 'border-yellow-300 bg-yellow-50 text-yellow-700'
        break

      case 'LOW':
        badgeClass = 'border-emerald-300 bg-emerald-50 text-emerald-700'
        break

      case 'INFO':
        badgeClass = 'border-blue-300 bg-blue-50 text-blue-700'
        break

      default:
        badgeClass = 'border-gray-200 bg-gray-50 text-gray-700'
        break
    }

    return badgeClass
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

  // 处理加载更多
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }

  return (
    <div className="relative">
      <div className="absolute left-[8px] top-0 bottom-0 w-px bg-border" />

      {/* 初始加载状态 */}
      {isLoading && events.length === 0 && (
        <ol className="space-y-4">
          {Array.from({ length: 4 }, (_, idx) => (
            <TimelineItemSkeleton key={idx} />
          ))}
        </ol>
      )}

      {/* 无数据状态 */}
      {!isLoading && events.length === 0 && (
        <div className="text-sm text-muted-foreground">暂无事件</div>
      )}

      {/* 事件列表 */}
      {events.length > 0 && (
        <>
          <ol className="space-y-4">
            {events.map((evt: TimelineEventDto) => {
              const id = evt.id
              const eventType = evt.eventType
              const createdAt = evt.createdAt
              const bugReport = evt.bugReport as { title?: string, severity?: Severity } | undefined
              const user = evt.user as { name?: string, email?: string } | undefined

              const actionText = getActionText(eventType)
              const statusColor = getStatusTextColor(eventType)
              const severityClass = getSeverityBadgeClass(bugReport?.severity)
              const displayUser = user?.name ?? user?.email ?? '未知用户'
              const displayTime = formatDate(createdAt, DateFormat.HH_MM)

              return (
                <li key={id} className="relative pl-8">
                  <span className="absolute left-0 top-0 flex items-center justify-center rounded-full bg-background">
                    {renderIcon(eventType, 16)}
                  </span>

                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm flex items-center gap-1 overflow-hidden">
                      <span className="font-medium shrink-0">{displayUser}</span>
                      <span className="text-muted-foreground shrink-0">{actionText}</span>
                      <span className="font-medium truncate flex-1 min-w-0">{bugReport?.title ?? '（无标题）'}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {displayTime}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={severityClass} variant="outline">
                      {bugReport?.severity ?? 'UNKNOWN'}
                    </Badge>

                    <span className={`text-xs ${statusColor}`}>
                      {actionText}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>

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

          {/* 加载中状态（加载更多时） */}
          {isFetchingNextPage && (
            <ol className="mt-4 space-y-4">
              {Array.from({ length: 2 }, (_, idx) => (
                <TimelineItemSkeleton key={`loading-${idx}`} />
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  )
}
