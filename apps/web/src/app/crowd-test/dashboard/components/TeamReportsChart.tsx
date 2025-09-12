'use client'

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import { roleColorMap } from '../lib/mockData'

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

  const getBarColor = (teamName: string, role?: string): string => {
    if (role && roleColorMap[role]) {
      return roleColorMap[role]
    }

    if (teamName.includes('红')) {
      return roleColorMap['红']
    }

    if (teamName.includes('蓝')) {
      return roleColorMap['蓝']
    }

    return roleColorMap['评估']
  }

  return (
    <ChartContainer
      config={{
        reports: { label: '报告数', color: '#3b82f6' },
      }}
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="team" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="reports" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.team} fill={getBarColor(d.team, d.role)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
