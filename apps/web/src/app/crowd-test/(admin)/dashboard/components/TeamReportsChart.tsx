'use client'

import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import { roleColorMap, TeamRole } from '../lib/mockData'

import { bugReportsControllerGetDepartmentReportsStatsOptions } from '~api/@tanstack/react-query.gen'

/**
 * 团队报告数柱状图
 * 展示各队伍提交的漏洞报告数；红队为红色，蓝队为蓝色，其它队伍使用主题色回退。
 */
export function TeamReportsChart() {
  const { data } = useQuery({
    ...bugReportsControllerGetDepartmentReportsStatsOptions(),
  })
  const statsData = data?.data.departmentStats.map((d) => ({
    team: d.department.name,
    reports: d.reportCount,
    role: d.department.name === '未分配部门' ? TeamRole.蓝 : TeamRole.红,
  }))

  return (
    <ChartContainer
      config={{
        reports: { label: '报告数', color: roleColorMap[TeamRole.蓝] },
      }}
    >
      <BarChart data={statsData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis axisLine={false} dataKey="team" />

        <YAxis axisLine={false} />

        <ChartTooltip content={<ChartTooltipContent />} />

        <Bar dataKey="reports" radius={6}>
          {statsData?.map((d) => (
            <Cell
              key={d.team}
              fill={roleColorMap[d.role]}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
