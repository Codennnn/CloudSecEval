import { useQuery } from '@tanstack/react-query'
import { Cell, Pie, PieChart } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'

import { departmentsControllerGetDepartmentOnlineStatsOptions } from '~api/@tanstack/react-query.gen'
import { getTeamRole, teamConfig, TeamRole } from '~crowd-test/constants'

export function TeamOnlineChart() {
  const { data } = useQuery({
    ...departmentsControllerGetDepartmentOnlineStatsOptions(),
  })

  const legendSolidColors = ['#3b82f6', '#ef4444', '#22d3ee', '#a78bfa']

  const totalOnline = data?.data.totalOnline ?? 0

  // 按队伍汇总在线人数（用于饼图）
  const teamOnlineData = data?.data.departments
    ? data.data.departments
        .filter((d) => d.online > 0)
        .map((d) => {
          const role = getTeamRole(d.department.remark)

          return {
            name: d.department.name,
            value: d.online,
            fill: teamConfig[role].colorValue,
          }
        })
    : []

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
            label={({ name, value, percent }) => `${name} ${String(value)} (${(percent * 100).toFixed(0)}%)`}
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

      {/* 简洁图例 - 按红队蓝队分组 */}
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {(() => {
          // 按队伍分组计算总在线人数
          const departments = data?.data.departments ?? []
          const redTeamOnline = departments
            .filter((d) => getTeamRole(d.department.remark) === TeamRole.红)
            .reduce((sum, d) => sum + d.online, 0)
          const blueTeamOnline = departments
            .filter((d) => getTeamRole(d.department.remark) === TeamRole.蓝)
            .reduce((sum, d) => sum + d.online, 0)

          const groupData = [
            { name: '红队', value: redTeamOnline, color: teamConfig[TeamRole.红].colorValue },
            { name: '蓝队', value: blueTeamOnline, color: teamConfig[TeamRole.蓝].colorValue },
          ]

          return groupData.map((item) => {
            const percent = totalOnline ? Math.round((item.value / totalOnline) * 100) : 0

            return (
              <div key={item.name} className="flex items-center gap-2">
                <svg className="shrink-0" height="10" viewBox="0 0 10 10" width="10">
                  <circle cx="5" cy="5" fill={item.color} r="5" />
                </svg>
                <span className="truncate opacity-60">{item.name}</span>
                <span className="ml-auto tabular-nums opacity-80">{item.value}人 ({percent}%)</span>
              </div>
            )
          })
        })()}
      </div>
    </div>
  )
}
