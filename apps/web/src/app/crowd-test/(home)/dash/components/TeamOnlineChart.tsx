import { Cell, Pie, PieChart } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { useTeamOnlineStats } from '~/hooks/useTeamOnlineStats'

export function TeamOnlineChart() {
  const legendSolidColors = ['#3b82f6', '#ef4444', '#22d3ee', '#a78bfa']

  const { teamOnlineData, totalOnline } = useTeamOnlineStats()

  return (
    <div className="relative min-h-64">
      <ChartContainer
        config={{
          // online: { label: '在线', color: '#22d3ee' },
        }}
      >
        <PieChart>
          <defs>
            <linearGradient id="grad-blue" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="grad-red" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="grad-cyan" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="grad-violet" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          <Pie
            isAnimationActive
            cornerRadius={6}
            cx="50%"
            cy="50%"
            data={teamOnlineData}
            dataKey="value"
            endAngle={-270}
            innerRadius={56}
            label={({ name }) => `${name}`}
            labelLine={false}
            outerRadius={84}
            paddingAngle={2}
            startAngle={90}
          >
            {teamOnlineData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke={legendSolidColors[index]}
                strokeOpacity={0.25}
                strokeWidth={1.5}
              />
            ))}
          </Pie>

          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>

      {/* 发光环效果 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center -translate-y-[16px]">
        <div className="size-44 rounded-full ring-1 ring-theme2/20 shadow-[0_0_80px_20px_rgba(34,211,238,0.08)]" />
      </div>

      {/* 中心统计数值 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center -translate-y-[16px]">
        <div className="text-center">
          <div className="text-3xl font-extrabold bg-gradient-to-b from-theme2 to-theme bg-clip-text text-transparent tabular-nums">
            {totalOnline}
          </div>
          <div className="text-xs text-theme2/70">总在线人数</div>
        </div>
      </div>
    </div>
  )
}
