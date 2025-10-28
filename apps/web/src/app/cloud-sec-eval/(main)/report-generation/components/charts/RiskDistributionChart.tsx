'use client'

import { Cell, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

/**
 * 风险分布数据
 */
const riskData = [
  { name: '高风险', value: 12, color: '#ef4444', percentage: 14.1 },
  { name: '中风险', value: 28, color: '#f59e0b', percentage: 32.9 },
  { name: '低风险', value: 45, color: '#10b981', percentage: 52.9 },
]

/**
 * 图表配置
 */
const chartConfig = {
  value: {
    label: '数量',
  },
}

/**
 * 风险分布饼图组件
 * 展示不同风险等级的分布情况
 */
export function RiskDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>风险等级分布</CardTitle>
        <CardDescription>
          共发现 85 个风险项，按风险等级分类统计
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* 图表 */}
          <ChartContainer className="h-[300px]" config={chartConfig}>
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={riskData}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
                labelLine
                nameKey="name"
                outerRadius={100}
              >
                {riskData.map((entry, index) => {
                  return <Cell key={index} fill={entry.color} />
                })}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>

          {/* 图例和统计 */}
          <div className="flex flex-col justify-center space-y-4">
            {riskData.map((item) => {
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {item.value} 项
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">总计</span>
                <span className="text-sm font-medium">
                  {riskData.reduce((sum, item) => sum + item.value, 0)} 项
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

