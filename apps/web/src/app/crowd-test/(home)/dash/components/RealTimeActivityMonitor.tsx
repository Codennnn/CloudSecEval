'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ActivityIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon, FileTextIcon, InfoIcon, RefreshCwIcon, SendIcon, Share2Icon, ShieldCheckIcon, XCircleIcon } from 'lucide-react'

import { getVulSeverity, VulnerabilitySeverity } from '~/app/crowd-test/constants'
import { bugReportsControllerGetTimelineInfiniteOptions } from '~/lib/api/generated/@tanstack/react-query.gen'
import type { TimelineEventDto } from '~/lib/api/generated/types.gen'
import { DateFormat, formatDate } from '~/utils/date'

type EventType = TimelineEventDto['eventType']
type Severity = VulnerabilitySeverity | undefined

// 基于 constants 配置生成 UI 样式
const getSeverityUIConfig = (severity: Severity) => {
  // 根据严重程度生成对应的图标和颜色
  switch (severity) {
    case VulnerabilitySeverity.CRITICAL:
      return {
        icon: <AlertTriangleIcon size={12} />,
        iconColor: 'text-purple-400',
        pulseColor: 'bg-purple-400/10',
        bgColor: 'bg-purple-400/5',
        badgeClassName: 'bg-purple-500/10 text-purple-400 border-purple-400/20',
      }

    case VulnerabilitySeverity.HIGH:
      return {
        icon: <AlertTriangleIcon size={12} />,
        iconColor: 'text-red-400',
        pulseColor: 'bg-red-400/10',
        bgColor: 'bg-red-400/5',
        badgeClassName: 'bg-red-500/10 text-red-400 border-red-400/20',
      }

    case VulnerabilitySeverity.MEDIUM:
      return {
        icon: <ShieldCheckIcon size={12} />,
        iconColor: 'text-orange-400',
        pulseColor: 'bg-orange-400/10',
        bgColor: 'bg-orange-400/5',
        badgeClassName: 'bg-orange-500/10 text-orange-400 border-orange-400/20',
      }

    case VulnerabilitySeverity.LOW:
      return {
        icon: <InfoIcon size={12} />,
        iconColor: 'text-yellow-400',
        pulseColor: 'bg-yellow-400/10',
        bgColor: 'bg-yellow-400/5',
        badgeClassName: 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20',
      }

    case VulnerabilitySeverity.INFO:
      return {
        icon: <ActivityIcon size={12} />,
        iconColor: 'text-blue-400',
        pulseColor: 'bg-blue-400/10',
        bgColor: 'bg-blue-400/5',
        badgeClassName: 'bg-blue-500/10 text-blue-400 border-blue-400/20',
      }

    default:
      return {
        icon: <InfoIcon size={12} />,
        iconColor: 'text-gray-400',
        pulseColor: 'bg-gray-400/10',
        bgColor: 'bg-gray-400/5',
        badgeClassName: 'bg-gray-500/10 text-gray-400 border-gray-400/20',
      }
  }
}

// 获取事件类型对应的动作文本
const getActionText = (eventType: EventType) => {
  switch (eventType) {
    case 'SUBMIT':
      return '提交漏洞报告'

    case 'APPROVE':
      return '审批通过'

    case 'REJECT':
      return '审批驳回'

    case 'REQUEST_INFO':
      return '要求补充信息'

    case 'FORWARD':
      return '转发审批'

    case 'RESUBMIT':
      return '重新提交'

    case 'UPDATE':
      return '更新报告'

    default:
      return '提交漏洞报告'
  }
}

// 根据事件类型获取对应图标
const getEventIcon = (eventType: EventType) => {
  switch (eventType) {
    case 'SUBMIT':
      return <FileTextIcon size={12} />

    case 'APPROVE':
      return <CheckCircleIcon size={12} />

    case 'REJECT':
      return <XCircleIcon size={12} />

    case 'REQUEST_INFO':
      return <ClockIcon size={12} />

    case 'FORWARD':
      return <Share2Icon size={12} />

    case 'RESUBMIT':
      return <SendIcon size={12} />

    case 'UPDATE':
      return <RefreshCwIcon size={12} />

    default:
      return <FileTextIcon size={12} />
  }
}

const pageSize = 5 // 实时监控显示较少数据

export function RealTimeActivityMonitor() {
  // 使用无限查询获取最新活动数据
  const {
    data,
    isLoading,
    isError,
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
          ? (
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
          : isError
            ? (
                <div className="text-sm text-red-400 p-3 rounded-lg bg-red-400/5">
                  加载活动数据失败
                </div>
              )
            : events.length === 0
              ? (
                  <div className="text-sm text-white/60 p-3 rounded-lg bg-gray-400/5">
                    暂无最新活动
                  </div>
                )
              : events.map((event, index) => {
                  const eventType = event.eventType
                  const bugReport = event.bugReport
                  const user = event.user as { name?: string, email?: string } | undefined
                  const createdAt = event.createdAt

                  const severity = bugReport.severity as Severity
                  const severityConfig = getVulSeverity(severity)
                  const uiConfig = getSeverityUIConfig(severity)
                  const actionText = getActionText(eventType)
                  const eventIcon = getEventIcon(eventType)

                  const displayUser = user?.name ?? user?.email ?? '未知用户'
                  const displayTime = formatDate(createdAt, DateFormat.HH_MM)

                  return (
                    <div
                      key={event.id}
                      className={`
                relative p-3 rounded-lg
                ${uiConfig.bgColor}
                ${index === 0 ? 'bg-cyan-400/5' : ''}
              `}
                    >
                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* 状态图标 - 显示事件类型图标 */}
                            <div className={`flex-shrink-0 p-1.5 rounded-full ${uiConfig.pulseColor} ${uiConfig.iconColor} mt-0.5`}>
                              {eventIcon}
                            </div>

                            {/* 活动信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white/90 truncate">
                                  {actionText}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${uiConfig.badgeClassName}`}>
                                  {severityConfig.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-white/60">
                                <span className="font-medium text-cyan-400">{displayUser}</span>
                                <span>→</span>
                                <span className="truncate">{bugReport.title}</span>
                              </div>
                            </div>
                          </div>

                          {/* 时间戳 */}
                          <div className="flex-shrink-0 text-xs text-white/50 font-mono">
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
