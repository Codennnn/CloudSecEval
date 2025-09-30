import { DateFormat, formatDate, formatRelativeTime } from '@mono/utils'
import { useInfiniteQuery } from '@tanstack/react-query'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { bugReportsControllerGetTimelineInfiniteOptions } from '~/lib/api/generated/@tanstack/react-query.gen'
import { cn } from '~/lib/utils'

import { BugReportStatus, getTimelineEventType, getVulSeverity } from '~crowd-test/constants'

const pageSize = 10

function TimelineItemSkeleton() {
  return (
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
}

interface ActivityTimelineProps {
  /** 事件类型筛选 */
  eventType?: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'FORWARD' | 'RESUBMIT' | 'UPDATE'
  departmentId?: string
}

export function ActivityTimeline(props: ActivityTimelineProps) {
  const { eventType, departmentId } = props

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
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
    ? data.pages
        .flatMap((page) => page.data)
        .filter((event) => event.bugReport.status !== BugReportStatus.DRAFT)
    : []

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

                  const eventConfig = getTimelineEventType(eventType)
                  const severityConfig = getVulSeverity(bugReport.severity)
                  const displayUser = user?.name ?? user?.email ?? '未知用户'
                  const displayTime = formatRelativeTime(createdAt)

                  return (
                    <li key={id} className="relative pl-8">
                      <span
                        className={cn(
                          'absolute left-0 top-0 flex items-center justify-center rounded-full bg-background size-4.5',
                          eventConfig.frontColor,
                        )}
                      >
                        {eventConfig.icon}
                      </span>

                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm flex items-center gap-1 overflow-hidden">
                          <span className="font-medium shrink-0">{displayUser}</span>
                          <span className="text-muted-foreground shrink-0">{eventConfig.label}</span>
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
                        <Badge
                          className={cn(
                            severityConfig.frontColor,
                            severityConfig.bgColor,
                            severityConfig.borderColor,
                          )}
                          variant="outline"
                        >
                          {severityConfig.label}
                        </Badge>

                        <span className={cn('text-xs', eventConfig.frontColor)}>
                          {eventConfig.label}
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
        : <div className="text-sm text-muted-foreground">暂无事件</div>}

      {isFetching
        ? (
            <ol className="space-y-4">
              {Array.from({ length: 4 }, (_, idx) => (
                <TimelineItemSkeleton key={idx} />
              ))}

            </ol>
          )
        : null}
    </div>
  )
}
