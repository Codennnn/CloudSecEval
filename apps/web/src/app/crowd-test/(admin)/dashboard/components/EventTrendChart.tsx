'use client'

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { StatsCard, StatsCardContent, StatsCardHeader, StatsCardTitle } from '~/components/ui-common/StatsCard'

import { bugReportsControllerGetDailyReportsStatsOptions } from '~api/@tanstack/react-query.gen'

// 事件趋势图配置（提交 / 审核）
const eventChartConfig = {
  submitted: {
    label: '提交报告',
    color: 'oklch(56% 0.19 230deg)',
  },
  approved: {
    label: '审核通过',
    color: 'oklch(60.8% 0.172 155.46deg)',
  },
} as const

/**
 * 将 API 返回的每日统计数据转换为图表所需的格式
 */
function transformApiDataToChartData(
  apiData: { date: string, submittedCount: number, reviewedCount: number }[],
) {
  return apiData.map((item) => ({
    date: item.date,
    submitted: item.submittedCount,
    approved: item.reviewedCount,
  }))
}

export function EventTrendChart() {
  // 获取最近14天的数据，与原始模拟数据保持一致
  const { data, isLoading, isError } = useQuery(
    bugReportsControllerGetDailyReportsStatsOptions({
      query: {
        // 14天前的日期
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        // 当前日期
        endDate: new Date().toISOString().split('T')[0],
      },
    }),
  )

  // 转换API数据为图表所需格式
  const chartData = useMemo(() => {
    if (!data?.data.dailyStats) {
      return []
    }

    return transformApiDataToChartData(data.data.dailyStats)
  }, [data])

  // 加载状态
  if (isLoading) {
    return (
      <StatsCard>
        <StatsCardHeader>
          <StatsCardTitle>事件趋势</StatsCardTitle>
        </StatsCardHeader>
        <StatsCardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        </StatsCardContent>
      </StatsCard>
    )
  }

  // 错误状态
  if (isError) {
    return (
      <StatsCard>
        <StatsCardHeader>
          <StatsCardTitle>事件趋势</StatsCardTitle>
        </StatsCardHeader>
        <StatsCardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">加载失败，请稍后重试</div>
          </div>
        </StatsCardContent>
      </StatsCard>
    )
  }

  return (
    <StatsCard>
      <StatsCardHeader>
        <StatsCardTitle>事件趋势</StatsCardTitle>
      </StatsCardHeader>

      <StatsCardContent>
        <div className="h-64">
          <ChartContainer config={eventChartConfig}>
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                minTickGap={24}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line
                dataKey="submitted"
                dot={false}
                stroke="var(--color-submitted)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="approved"
                dot={false}
                stroke="var(--color-approved)"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ChartContainer>
        </div>
      </StatsCardContent>
    </StatsCard>
  )
}
