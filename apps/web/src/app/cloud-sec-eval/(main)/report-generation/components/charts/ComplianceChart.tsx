'use client'

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

/**
 * 合规评估数据
 */
const complianceData = [
  { category: '物理环境', rate: 78.9, color: '#3b82f6' },
  { category: '通信网络', rate: 91.7, color: '#10b981' },
  { category: '区域边界', rate: 75.0, color: '#f59e0b' },
  { category: '计算环境', rate: 75.8, color: '#f59e0b' },
  { category: '管理中心', rate: 85.0, color: '#10b981' },
]

/**
 * 图表配置
 */
const chartConfig = {
  rate: {
    label: '符合率',
  },
}

/**
 * 合规评估柱状图组件
 * 展示各维度的合规符合率
 */
export function ComplianceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>合规评估结果</CardTitle>
        <CardDescription>
          各安全维度的法规符合率统计（等保 2.0 三级）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[300px]" config={chartConfig}>
          <BarChart data={complianceData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="category"
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
              {complianceData.map((entry, index) => {
                return <Cell key={index} fill={entry.color} />
              })}
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* 评级说明 */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
            <div className="text-xs text-muted-foreground">优秀</div>
            <div className="mt-1 text-sm font-medium">≥ 85%</div>
          </div>
          <div className="rounded-lg border bg-blue-50 p-3 dark:bg-blue-950/20">
            <div className="text-xs text-muted-foreground">良好</div>
            <div className="mt-1 text-sm font-medium">70% - 85%</div>
          </div>
          <div className="rounded-lg border bg-orange-50 p-3 dark:bg-orange-950/20">
            <div className="text-xs text-muted-foreground">需改进</div>
            <div className="mt-1 text-sm font-medium">&lt; 70%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
