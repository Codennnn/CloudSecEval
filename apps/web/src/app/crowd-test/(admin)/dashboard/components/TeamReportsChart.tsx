'use client'

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import { roleColorMap, TeamRole } from '../lib/mockData'

interface TeamReportsDatum {
  team: string
  reports: number
  role?: string
}

interface TeamReportsChartProps {
  data: TeamReportsDatum[]
}

/**
 * 团队报告数柱状图
 * 展示各队伍提交的漏洞报告数；红队为红色，蓝队为蓝色，其它队伍使用主题色回退。
 */
export function TeamReportsChart(props: TeamReportsChartProps) {
  const { data } = props

  return (
    <ChartContainer
      config={{
        reports: { label: '报告数', color: roleColorMap[TeamRole.蓝] },
      }}
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis axisLine={false} dataKey="team" />

        <YAxis axisLine={false} />

        <ChartTooltip content={<ChartTooltipContent />} />

        <Bar dataKey="reports" radius={6}>
          {data.map((d) => (
            <Cell
              key={d.team}
              fill={d.role
                ? roleColorMap[d.role]
                : undefined}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
