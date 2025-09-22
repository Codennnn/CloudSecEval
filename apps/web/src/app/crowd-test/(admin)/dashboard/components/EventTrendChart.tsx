'use client'

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

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

  return (
    <div>
      {
        isLoading
          ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">加载中...</div>
              </div>
            )
          : (
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
            )
      }
    </div>
  )
}
