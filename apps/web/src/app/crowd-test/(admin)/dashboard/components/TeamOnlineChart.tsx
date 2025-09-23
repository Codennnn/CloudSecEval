'use client'

import { Cell, Pie, PieChart } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { useTeamOnlineStats } from '~/hooks/useTeamOnlineStats'

import { teamConfig, TeamRole } from '~crowd-test/constants'

export function TeamOnlineChart() {
  const { teamOnlineData: statsData, totalOnline } = useTeamOnlineStats()

  return (
    <div className="relative min-h-64">
      <ChartContainer
        config={{
          online: { label: '在线', color: teamConfig[TeamRole.蓝].colorValue },
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
            label={({ name }) => `${name}`}
            labelLine={false}
            outerRadius={78}
            paddingAngle={2}
            startAngle={90}

          >
            {statsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
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
