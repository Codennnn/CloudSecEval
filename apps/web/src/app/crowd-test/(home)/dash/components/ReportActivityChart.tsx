'use client'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { ChartContainer, ChartTooltip } from '~/components/ui/chart'

// 报告活动监测图配置（新建 / 进行中 / 已完成）
const activityChartConfig = {
  created: {
    label: '提交报告',
    color: '#1491ff',
  },
  inProgress: {
    label: '审核报告',
    color: '#09f6ff',
  },
} as const

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
      <div className="rounded-lg border border-cyan-400/30 bg-gray-900/95 p-3 shadow-2xl backdrop-blur-sm">
        <div className="mb-2 border-b border-cyan-400/20 pb-2">
          <p className="text-xs font-mono text-cyan-300">{`时间: ${label}`}</p>
        </div>
        <div className="space-y-1">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-mono text-gray-200">
                {activityChartConfig[item.dataKey as keyof typeof activityChartConfig].label}:
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

/**
 * 生成近 N 小时的活动监测数据
 */
function generateActivityData(hours: number) {
  const now = new Date()
  const data: { time: string, created: number, inProgress: number, completed: number }[] = []

  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(now.getHours() - i)

    // 模拟活动波动 - 工作时间活动较多
    const hour = d.getHours()
    const isWorkingHour = hour >= 9 && hour <= 18
    const baseActivity = isWorkingHour ? 8 : 2

    // 添加一些随机波动
    const variance = Math.random() * 4
    const created = Math.round(baseActivity + variance)
    const inProgress = Math.round(created * 0.7 + Math.random() * 2)
    const completed = Math.round(created * 0.5 + Math.random() * 3)

    data.push({
      time: `${d.getHours().toString().padStart(2, '0')}:00`,
      created,
      inProgress,
      completed,
    })
  }

  return data
}

const activityData = generateActivityData(12)

/**
 * 报告活动监测图表
 * 展示近12小时的报告活动趋势（新建/处理中/已完成）
 */
export function ReportActivityChart() {
  return (
    <ChartContainer
      className="aspect-auto h-44 w-full"
      config={activityChartConfig}
    >
      <AreaChart data={activityData}>
        <defs>
          <linearGradient id="fillCreated" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-created)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-created)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillInProgress" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-inProgress)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-inProgress)" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis
          axisLine={false}
          dataKey="time"
          minTickGap={32}
          tickLine={false}
          tickMargin={8}
        />

        <ChartTooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: '#00f5ff',
            strokeWidth: 2,
            strokeDasharray: '6 6',
            filter: 'drop-shadow(0 0 6px #00f5ff)',
          }}
        />

        <Area
          dataKey="inProgress"
          fill="url(#fillInProgress)"
          fillOpacity={0.6}
          stackId="1"
          stroke="var(--color-inProgress)"
          strokeWidth={2}
          type="monotone"
        />
        <Area
          dataKey="created"
          fill="url(#fillCreated)"
          fillOpacity={0.6}
          stackId="1"
          stroke="var(--color-created)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  )
}
