'use client'

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { StatsCard, StatsCardContent, StatsCardHeader, StatsCardTitle } from '~/components/ui-common/StatsCard'

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
 * 生成近 N 天的事件趋势数据（提交 / 审核）。
 */
function generateEventTrendData(days: number) {
  const today = new Date()
  const data: { date: string, submitted: number, approved: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)

    // 简单的可读性波动曲线：基于正弦和余量构造
    const base = 12 + Math.round(5 * Math.sin((days - i) / 2))
    const submitted = base + (i % 3)
    const approvedRaw = submitted - (1 + (i % 2))
    const approved = approvedRaw >= 0 ? approvedRaw : 0

    data.push({
      date: d.toISOString().split('T')[0],
      submitted,
      approved,
    })
  }

  return data
}

const eventTrendData = generateEventTrendData(14)

export function EventTrendChart() {
  return (
    <StatsCard>
      <StatsCardHeader>
        <StatsCardTitle>事件趋势</StatsCardTitle>
      </StatsCardHeader>
      <StatsCardContent>
        <div className="h-64">
          <ChartContainer config={eventChartConfig}>
            <LineChart data={eventTrendData}>
              <CartesianGrid vertical={false} />
              <XAxis axisLine={false} dataKey="date" minTickGap={24} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line dataKey="submitted" dot={false} stroke="var(--color-submitted)" strokeWidth={2} type="monotone" />
              <Line dataKey="approved" dot={false} stroke="var(--color-approved)" strokeWidth={2} type="monotone" />
            </LineChart>
          </ChartContainer>
        </div>
      </StatsCardContent>
    </StatsCard>
  )
}
