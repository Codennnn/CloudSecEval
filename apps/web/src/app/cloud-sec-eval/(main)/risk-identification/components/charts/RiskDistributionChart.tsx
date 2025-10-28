'use client'

import { Cell, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import type { RiskStats } from '../../lib/types'

interface RiskDistributionChartProps {
  data: RiskStats
}

/**
 * 风险等级分布饼图组件
 * 展示高/中/低风险的分布情况
 */
export function RiskDistributionChart(props: RiskDistributionChartProps) {
  const { data } = props

  // 准备图表数据
  const chartData = [
    {
      name: '高风险',
      value: data.high,
      color: '#ef4444',
      percentage: ((data.high / data.total) * 100).toFixed(1),
    },
    {
      name: '中风险',
      value: data.medium,
      color: '#f59e0b',
      percentage: ((data.medium / data.total) * 100).toFixed(1),
    },
    {
      name: '低风险',
      value: data.low,
      color: '#10b981',
      percentage: ((data.low / data.total) * 100).toFixed(1),
    },
  ]

  // 图表配置
  const chartConfig = {
    value: {
      label: '数量',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>风险等级分布</CardTitle>
        <CardDescription>
          共发现
          {' '}
          {data.total}
          {' '}
          个风险项，按风险等级分类统计
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
          {/* 饼图 */}
          <ChartContainer className="h-[300px]" config={chartConfig}>
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={chartData}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
                labelLine
                nameKey="name"
                outerRadius={100}
              >
                {chartData.map((entry, index) => {
                  return <Cell key={index} fill={entry.color} />
                })}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>

          {/* 图例和统计 */}
          <div className="flex flex-col justify-center gap-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold">{item.value}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.percentage}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

