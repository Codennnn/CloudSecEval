'use client'

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { ChartContainer, ChartTooltip } from '~/components/ui/chart'

import { bugReportsControllerGetDailyReportsStatsOptions } from '~api/@tanstack/react-query.gen'

// 报告活动监测图配置（提交 / 审核通过）
const activityChartConfig = {
  created: {
    label: '提交报告',
    color: '#1491ff',
  },
  inProgress: {
    label: '审核通过',
    color: '#09f6ff',
  },
} as const

function transformApiDataToChartData(
  apiData: { date: string, submittedCount: number, reviewedCount: number }[],
) {
  return apiData.map((item) => ({
    time: item.date,
    created: item.submittedCount,
    inProgress: item.reviewedCount,
  }))
}

interface TooltipPayload {
  dataKey: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

/**
 * 自定义科技风格工具提示
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-cyan-400/30 bg-gray-900/95 p-3 shadow-2xl backdrop-blur-sm">
        <div className="mb-2 border-b border-cyan-400/20 pb-2">
          <p className="text-xs font-mono text-cyan-300">{`时间: ${label}`}</p>
        </div>
        <div className="space-y-1">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-mono text-gray-200">
                {activityChartConfig[item.dataKey as keyof typeof activityChartConfig].label}:
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-75 blur-sm -z-10" />
      </div>
    )
  }

  return null
}

/**
 * 报告活动监测图表
 * 展示最近14天的报告活动趋势（提交报告/审核通过）
 */
export function ReportActivityChart() {
  const { data, isLoading } = useQuery(
    bugReportsControllerGetDailyReportsStatsOptions({
      query: {
        // 14天前的日期
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        // 当前日期
        endDate: new Date().toISOString().split('T')[0],
      },
    }),
  )

  const chartData = useMemo(() => {
    if (!data?.data.dailyStats) {
      return []
    }

    return transformApiDataToChartData(data.data.dailyStats)
  }, [data])

  if (isLoading) {
    return (
      <div className="aspect-auto h-44 w-full flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <ChartContainer
      className="aspect-auto h-44 w-full"
      config={activityChartConfig}
    >
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="fillCreated" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-created)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-created)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillInProgress" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-inProgress)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-inProgress)" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis
          axisLine={false}
          dataKey="time"
          minTickGap={32}
          tickLine={false}
          tickMargin={8}
        />

        <ChartTooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: '#00f5ff',
            strokeWidth: 2,
            strokeDasharray: '6 6',
            filter: 'drop-shadow(0 0 6px #00f5ff)',
          }}
        />

        <Area
          dataKey="inProgress"
          fill="url(#fillInProgress)"
          fillOpacity={0.6}
          stackId="1"
          stroke="var(--color-inProgress)"
          strokeWidth={2}
          type="monotone"
        />
        <Area
          dataKey="created"
          fill="url(#fillCreated)"
          fillOpacity={0.6}
          stackId="1"
          stroke="var(--color-created)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  )
}
