'use client'

import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import { bugReportsControllerGetDepartmentReportsStatsOptions } from '~api/@tanstack/react-query.gen'
import { getTeamRole, getTeamRoleConfig, TeamRole } from '~crowd-test/constants'

export function TeamReportsChart() {
  const { data } = useQuery({
    ...bugReportsControllerGetDepartmentReportsStatsOptions(),
  })
  const statsData = data?.data.departmentStats.map((d) => ({
    team: d.department.name,
    reports: d.reportCount,
    role: getTeamRole(d.department.remark),
  }))

  return (
    <ChartContainer
      config={{
        reports: { label: '报告数', color: getTeamRoleConfig(TeamRole.蓝).colorValue },
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
              fill={getTeamRoleConfig(d.role).colorValue}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
