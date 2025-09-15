'use client'

import { Cell, Pie, PieChart } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import { roleColorMap, TeamRole } from '../lib/mockData'

interface TeamOnlineData {
  name: string
  value: number
  fill: string
}

interface TeamOnlineChartProps {
  data: TeamOnlineData[]
  totalOnline: number
}

export function TeamOnlineChart({ data, totalOnline }: TeamOnlineChartProps) {
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
            data={data}
            dataKey="value"
            endAngle={-270}
            innerRadius={48}
            label={({ name, value, percent }) => `${name} ${String(value)} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
            outerRadius={78}
            startAngle={90}
          >
            {data.map((entry, index) => (
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
