'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import type { RiskStats } from '../../lib/types'

interface RiskTrendChartProps {
  data: RiskStats['trend']
}

/**
 * 风险趋势折线图组件
 * 展示近7天风险发现趋势
 */
export function RiskTrendChart(props: RiskTrendChartProps) {
  const { data } = props

  // 格式化日期显示
  const chartData = data.map((item) => {
    const date = new Date(item.date)

    return {
      ...item,
      dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
    }
  })

  // 图表配置
  const chartConfig = {
    count: {
      label: '总数',
      color: '#3b82f6',
    },
    high: {
      label: '高风险',
      color: '#ef4444',
    },
    medium: {
      label: '中风险',
      color: '#f59e0b',
    },
    low: {
      label: '低风险',
      color: '#10b981',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>风险发现趋势</CardTitle>
        <CardDescription>
          近 7 天每日新发现风险数量统计
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[300px]" config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="dateLabel"
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />

            <Line
              dataKey="high"
              dot={{ r: 4 }}
              stroke="var(--color-high)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="medium"
              dot={{ r: 4 }}
              stroke="var(--color-medium)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="low"
              dot={{ r: 4 }}
              stroke="var(--color-low)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
