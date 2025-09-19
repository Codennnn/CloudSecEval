'use client'

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip } from '~/components/ui/chart'

import { bugReportsControllerGetDepartmentReportsStatsOptions } from '~api/@tanstack/react-query.gen'
import { getTeamRole, getTeamRoleConfig, TeamRole } from '~crowd-test/constants'

interface TooltipPayload {
  dataKey: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

/**
 * 自定义科技风格工具提示
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-theme2/30 bg-crowd-test-dashboard-background/80 p-3 shadow-2xl backdrop-blur-sm">
        <div className="mb-2 border-b border-theme2/30 pb-2">
          <p className="text-xs font-mono text-theme2">{`团队: ${label}`}</p>
        </div>
        <div className="space-y-1">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-mono text-gray-200">
                报告数:
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-75 blur-sm -z-10" />
      </div>
    )
  }

  return null
}

interface ReportSubmitDatum {
  team: string
  reports: number
  role: TeamRole
}

export function ReportSubmitChart() {
  const { data } = useQuery({
    ...bugReportsControllerGetDepartmentReportsStatsOptions(),
  })

  // 将API数据转换为图表需要的格式
  const chartData = useMemo<ReportSubmitDatum[]>(() => {
    const departmentStats = data?.data.departmentStats

    if (!departmentStats) {
      return []
    }

    return departmentStats.map((d) => ({
      team: d.department.name,
      reports: d.reportCount,
      role: getTeamRole(d.department.remark),
    }))
  }, [data])

  return (
    <ChartContainer
      className="aspect-auto h-44 w-full"
      config={{
        reports: {
          label: '报告数',
          color: getTeamRoleConfig(TeamRole.蓝).colorValue,
        },
      }}
    >
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          axisLine={false}
          dataKey="team"
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} />

        <ChartTooltip
          content={<CustomTooltip />}
          cursor={{
            fill: 'rgba(6, 182, 212, 0.1)',
            stroke: '#00f5ff',
            strokeWidth: 2,
            radius: 6,
          }}
        />

        <Bar dataKey="reports" radius={6}>
          {chartData.map((d) => (
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
