'use client'

import { useQuery } from '@tanstack/react-query'
import { Cell, Pie, PieChart } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import { roleColorMap, TeamRole } from '../lib/mockData'

import { departmentsControllerGetDepartmentOnlineStatsOptions } from '~api/@tanstack/react-query.gen'

interface TeamOnlineData {
  name: string
  value: number
  fill: string
}

interface TeamOnlineChartProps {
  data: TeamOnlineData[]
  totalOnline: number
}

export function TeamOnlineChart({ totalOnline }: TeamOnlineChartProps) {
  const { data } = useQuery({
    ...departmentsControllerGetDepartmentOnlineStatsOptions(),
  })
  const statsData = data?.data.map((d) => ({ name: d.name, value: d.online, fill: roleColorMap[d.role] ?? '#8b5cf6' }))

  return (
    <div className="relative min-h-64">
      <ChartContainer
        config={{
          online: { label: '在线', color: roleColorMap[TeamRole.蓝] },
        }}
      >
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={statsData}
            dataKey="value"
            endAngle={-270}
            innerRadius={48}
            label={({ name, value, percent }) => `${name} ${String(value)} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
            outerRadius={78}
            startAngle={90}
          >
            {statsData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>

          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold">{totalOnline}</div>
          <div className="text-xs text-muted-foreground">总在线人数</div>
        </div>
      </div>
    </div>
  )
}
