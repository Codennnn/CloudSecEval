'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

import { getTimelineEventType, getVulSeverity } from '~/app/crowd-test/constants'
import { bugReportsControllerGetTimelineInfiniteOptions } from '~/lib/api/generated/@tanstack/react-query.gen'
import { cn } from '~/lib/utils'
import { DateFormat, formatDate } from '~/utils/date'

function RealTimeActivityLoading() {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={`skeleton-${index}`} className="relative p-3 rounded-lg bg-gray-400/5 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-400/20 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-400/20 rounded w-3/4" />
              <div className="h-3 bg-gray-400/20 rounded w-1/2" />
            </div>
            <div className="w-8 h-3 bg-gray-400/20 rounded" />
          </div>
        </div>
      ))}
    </>
  )
}

const pageSize = 10 // 实时监控显示较少数据

export function RealTimeActivityMonitor() {
  // 使用无限查询获取最新活动数据
  const {
    data,
    isLoading,
  } = useInfiniteQuery({
    ...bugReportsControllerGetTimelineInfiniteOptions({
      query: {
        pageSize,
      },
    }),
    initialPageParam: 1,
    getNextPageParam: () => undefined, // 实时监控只显示第一页
  })

  const events = typeof data === 'object' && 'pages' in data
    ? data.pages.flatMap((page) => page.data).slice(0, pageSize)
    : []

  return (
    <div className="space-y-3">
      {/* 实时状态指示器 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
        </div>
        <span className="text-xs text-green-400 font-medium">实时监测中</span>
      </div>

      {/* 活动列表 */}
      <div className="space-y-2">
        {isLoading
          ? <RealTimeActivityLoading />
          : events.length === 0
            ? (
                <div className="text-sm text-white/60 p-3 rounded-lg bg-gray-400/5">
                  暂无最新活动
                </div>
              )
            : events.map((event) => {
                const eventType = event.eventType
                const bugReport = event.bugReport
                const user = event.user as { name?: string, email?: string } | undefined
                const createdAt = event.createdAt

                const severityConfig = getVulSeverity(bugReport.severity)
                const eventConfig = getTimelineEventType(eventType)

                const displayUser = user?.name ?? user?.email ?? '未知用户'
                const displayTime = formatDate(createdAt, DateFormat.HH_MM)

                return (
                  <div
                    key={event.id}
                    className={cn(
                      'relative p-3 rounded-lg',
                      eventConfig.bgColor,
                    )}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* 状态图标 - 显示事件类型图标 */}
                          <div
                            className={cn(
                              'flex-shrink-0 p-1.5 rounded-full mt-0.5 text-sm',
                              eventConfig.bgColor,
                              eventConfig.frontColor,
                            )}
                          >
                            {eventConfig.icon}
                          </div>

                          {/* 活动信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">
                                {eventConfig.label}
                              </span>

                              <span
                                className={cn(
                                  'text-xs px-2 py-0.5 rounded-full border font-semibold',
                                  severityConfig.frontColorDark,
                                  severityConfig.bgColorDark,
                                  severityConfig.borderColorDark,
                                )}
                              >
                                {severityConfig.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs opacity-60">
                              <span className="font-medium text-theme2">{displayUser}</span>
                              <span>→</span>
                              <span className="truncate">{bugReport.title}</span>
                            </div>
                          </div>
                        </div>

                        {/* 时间戳 */}
                        <div className="flex-shrink-0 text-xs font-mono opacity-50">
                          {displayTime}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
      </div>
    </div>
  )
}
